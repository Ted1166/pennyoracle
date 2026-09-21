import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arcTestnet } from './chain';

export const wagmiConfig = getDefaultConfig({
  appName: 'PennyOracle',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'pennyoracle',
  chains: [arcTestnet],
  ssr: false
});
