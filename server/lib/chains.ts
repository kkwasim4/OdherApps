export interface ChainConfig {
  id: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  type: 'evm' | 'solana';
}

export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    type: 'evm',
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    type: 'evm',
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    type: 'evm',
  },
  base: {
    id: 'base',
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    type: 'evm',
  },
  optimism: {
    id: 'optimism',
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    type: 'evm',
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
    type: 'solana',
  },
};

export function detectChainType(address: string): 'evm' | 'solana' | 'unknown' {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return 'evm';
  }
  
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return 'solana';
  }
  
  return 'unknown';
}
