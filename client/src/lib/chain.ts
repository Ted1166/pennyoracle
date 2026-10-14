import { defineChain } from 'viem';

export const arc = defineChain({
  id: Number(import.meta.env.VITE_CHAIN_ID ?? 5042),
  name: 'Arc',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_RPC_URL ?? 'https://rpc.mainnet.arc.io'] }
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://explorer.arc.io' }
  }
});
