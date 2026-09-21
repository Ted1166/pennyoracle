import { createPublicClient, createWalletClient, http, parseAbi, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from './config';

export const arcChain = defineChain({
  id: config.chainId,
  name: 'Arc',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: [config.rpcUrl], webSocket: [config.wsRpcUrl] }
  }
});

export const pennyOracleAbi = parseAbi([
  'event Asked(uint256 indexed id, address indexed asker, string question, uint64 askedAt)',
  'event Fulfilled(uint256 indexed id, bytes32 answerHash, uint64 fulfilledAt)',
  'function fulfill(uint256 id, bytes32 answerHash) external',
  'function getQuestion(uint256 id) view returns ((address,string,bytes32,bool,uint64,uint64))',
  'function nextId() view returns (uint256)'
]);

export const publicClient = createPublicClient({
  chain: arcChain,
  transport: http(config.rpcUrl)
});

export const oracleAccount = privateKeyToAccount(config.oraclePrivateKey);

export const walletClient = createWalletClient({
  account: oracleAccount,
  chain: arcChain,
  transport: http(config.rpcUrl)
});
