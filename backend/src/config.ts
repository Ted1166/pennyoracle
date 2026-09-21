import 'dotenv/config';

export const config = {
  rpcUrl: process.env.ARC_RPC_URL ?? 'https://rpc.testnet.arc.network',
  wsRpcUrl: process.env.ARC_WS_RPC_URL ?? 'wss://rpc.testnet.arc.network',
  contractAddress: process.env.CONTRACT_ADDRESS as `0x${string}`,
  oraclePrivateKey: process.env.ORACLE_PRIVATE_KEY as `0x${string}`,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5',
  port: Number(process.env.PORT ?? 8787),
  dbPath: process.env.DB_PATH ?? './data/pennyoracle.sqlite',
  chainId: Number(process.env.CHAIN_ID ?? 5042002)
};
