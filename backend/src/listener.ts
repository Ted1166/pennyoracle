import { keccak256, toHex } from 'viem';
import { publicClient, walletClient, pennyOracleAbi } from './chain';
import { config } from './config';
import { getOracleAnswer } from './oracle';
import { insertAsked, markFulfilled } from './store';
import { AskedEvent } from './types';

const processing = new Set<string>();

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
  } finally {
    processing.delete(id);
  }
}
