import { parseAbi } from 'viem';

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
export const USDC_ADDRESS = (import.meta.env.VITE_USDC_ADDRESS ||
  '0x3600000000000000000000000000000000000000') as `0x${string}`;

export const pennyOracleAbi = parseAbi([
  'event Asked(uint256 indexed id, address indexed asker, string question, uint64 askedAt)',
  'event Fulfilled(uint256 indexed id, bytes32 answerHash, uint64 fulfilledAt)',
  'function ask(string question) external returns (uint256)',
  'function fulfill(uint256 id, bytes32 answerHash) external',
  'function getQuestion(uint256 id) view returns ((address,string,bytes32,bool,uint64,uint64))',
  'function nextId() view returns (uint256)'
]);

export const usdcAbi = parseAbi([
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)'
]);

export const QUESTION_PRICE = 10000n;
