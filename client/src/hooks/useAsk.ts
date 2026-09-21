import { useState } from 'react';
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, QUESTION_PRICE, USDC_ADDRESS, pennyOracleAbi, usdcAbi } from '../lib/contract';

type AskStatus = 'idle' | 'approving' | 'asking' | 'done' | 'error';

export function useAsk() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [status, setStatus] = useState<AskStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: usdcAbi,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
    query: { enabled: Boolean(address) }
  });

  async function ask(question: string) {
    if (!address || !publicClient) return;
    setError(null);

    try {
      if (!allowance || allowance < QUESTION_PRICE) {
        setStatus('approving');
        const approveHash = await writeContractAsync({
          address: USDC_ADDRESS,
          abi: usdcAbi,
          functionName: 'approve',
          args: [CONTRACT_ADDRESS, QUESTION_PRICE * 100n]
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        await refetchAllowance();
      }

      setStatus('asking');
      const askHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: pennyOracleAbi,
        functionName: 'ask',
        args: [question]
      });
      await publicClient.waitForTransactionReceipt({ hash: askHash });
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'something went wrong');
    }
  }

  return { ask, status, error };
}
