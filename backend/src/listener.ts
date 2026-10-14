import { keccak256, toHex } from 'viem';
import { publicClient, walletClient, pennyOracleAbi } from './chain';
import { config } from './config';
import { getOracleAnswer } from './oracle';
import { getById, insertAsked, markFulfilled } from './store';
import { AskedEvent } from './types';

const RECOVERY_INTERVAL_MS = 30_000;

const processing = new Set<string>();
const settled = new Set<string>();
let recovering = false;

export function startListener() {
  publicClient.watchContractEvent({
    address: config.contractAddress,
    abi: pennyOracleAbi,
    eventName: 'Asked',
    onLogs: (logs) => {
      for (const log of logs) {
        const args = log.args as unknown as AskedEvent;
        handleAsked(args).catch((err) => {
          console.error('failed to handle ask', err);
        });
      }
    }
  });

  runRecovery();
  setInterval(runRecovery, RECOVERY_INTERVAL_MS);
}

async function runRecovery() {
  if (recovering) return;
  recovering = true;
  try {
    await recoverPending();
  } catch (err) {
    console.error('recovery failed', err);
  } finally {
    recovering = false;
  }
}

async function recoverPending() {
  const total = Number(
    await publicClient.readContract({
      address: config.contractAddress,
      abi: pennyOracleAbi,
      functionName: 'nextId'
    })
  );

  for (let i = 0; i < total; i++) {
    const id = String(i);
    if (settled.has(id) || processing.has(id)) continue;

    if (getById(id)?.fulfilled) {
      settled.add(id);
      continue;
    }

    const [asker, question, , fulfilled, askedAt] = await publicClient.readContract({
      address: config.contractAddress,
      abi: pennyOracleAbi,
      functionName: 'getQuestion',
      args: [BigInt(i)]
    });

    if (fulfilled) {
      settled.add(id);
      continue;
    }

    try {
      await handleAsked({ id: BigInt(i), asker, question, askedAt });
    } catch (err) {
      console.error(`failed to recover question ${id}`, err);
    }
  }
}

async function handleAsked(args: AskedEvent) {
  const id = args.id.toString();
  if (processing.has(id)) return;
  processing.add(id);

  try {
    insertAsked(id, args.asker, args.question, Number(args.askedAt));

    const answer = await getOracleAnswer(args.question);
    const answerHash = keccak256(toHex(answer));

    const hash = await walletClient.writeContract({
      address: config.contractAddress,
      abi: pennyOracleAbi,
      functionName: 'fulfill',
      args: [args.id, answerHash]
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });

    markFulfilled(id, answer, answerHash, Number(block.timestamp));
    settled.add(id);
  } finally {
    processing.delete(id);
  }
}