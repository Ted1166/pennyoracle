import { useAccount, useReadContract } from 'wagmi';
import { USDC_ADDRESS, usdcAbi } from '../lib/contract';

export function useWallet() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) }
  });

  return {
    address,
    isConnected,
    balance: balance ?? 0n
  };
}
