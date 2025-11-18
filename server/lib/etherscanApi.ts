/**
 * ETHERSCAN API INTEGRATION
 * 
 * Provides access to Etherscan blockchain explorer API for:
 * - Contract source code verification
 * - Token metadata and information
 * - Contract ABI retrieval
 * - Transaction history
 * - Token holder counts
 * 
 * Supports multiple chains with automatic endpoint selection.
 */

import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache

interface EtherscanChainConfig {
  apiUrl: string;
  apiKey: string;
}

// Etherscan API endpoints for different chains
// PENTING: Setiap chain explorer memerlukan API key sendiri!
// 
// Daftar API keys yang diperlukan (tambahkan di Replit Secrets):
// ✅ ETHERSCAN_API_KEY - Untuk Ethereum (SUDAH DIISI)
// ⚠️ BSCSCAN_API_KEY - Untuk BSC (ISI DISINI: https://bscscan.com/myapikey)
// ⚠️ POLYGONSCAN_API_KEY - Untuk Polygon (ISI DISINI: https://polygonscan.com/myapikey)
// ⚠️ ARBISCAN_API_KEY - Untuk Arbitrum (ISI DISINI: https://arbiscan.io/myapikey)
// ⚠️ OPTIMISTIC_ETHERSCAN_API_KEY - Untuk Optimism (ISI DISINI: https://optimistic.etherscan.io/myapikey)
// ⚠️ BASESCAN_API_KEY - Untuk Base (ISI DISINI: https://basescan.org/myapikey)
// ⚠️ SNOWTRACE_API_KEY - Untuk Avalanche (ISI DISINI: https://snowtrace.io/myapikey)
//
// Catatan: Tanpa API key yang sesuai, contract verification tidak akan bekerja untuk chain tersebut
const ETHERSCAN_CONFIGS: Record<string, EtherscanChainConfig> = {
  ethereum: {
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: process.env.ETHERSCAN_API_KEY || '',
  },
  bsc: {
    apiUrl: 'https://api.bscscan.com/api',
    apiKey: process.env.BSCSCAN_API_KEY || '', // ISI DISINI untuk BSC verification
  },
  polygon: {
    apiUrl: 'https://api.polygonscan.com/api',
    apiKey: process.env.POLYGONSCAN_API_KEY || '', // ISI DISINI untuk Polygon verification
  },
  arbitrum: {
    apiUrl: 'https://api.arbiscan.io/api',
    apiKey: process.env.ARBISCAN_API_KEY || '', // ISI DISINI untuk Arbitrum verification
  },
  optimism: {
    apiUrl: 'https://api-optimistic.etherscan.io/api',
    apiKey: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || '', // ISI DISINI untuk Optimism verification
  },
  base: {
    apiUrl: 'https://api.basescan.org/api',
    apiKey: process.env.BASESCAN_API_KEY || '', // ISI DISINI untuk Base verification
  },
  avalanche: {
    apiUrl: 'https://api.snowtrace.io/api',
    apiKey: process.env.SNOWTRACE_API_KEY || '', // ISI DISINI untuk Avalanche verification
  },
};

export interface ContractSourceCode {
  SourceCode: string;
  ABI: string;
  ContractName: string;
  CompilerVersion: string;
  OptimizationUsed: string;
  Runs: string;
  ConstructorArguments: string;
  EVMVersion: string;
  Library: string;
  LicenseType: string;
  Proxy: string;
  Implementation: string;
  SwarmSource: string;
}

export interface TokenInfo {
  contractAddress: string;
  tokenName: string;
  symbol: string;
  divisor: string;
  tokenType: string;
  totalSupply: string;
  blueCheckmark: string;
  description: string;
  website: string;
  email: string;
  blog: string;
  reddit: string;
  slack: string;
  facebook: string;
  twitter: string;
  bitcointalk: string;
  github: string;
  telegram: string;
  wechat: string;
  linkedin: string;
  discord: string;
  whitepaper: string;
  tokenPriceUSD: string;
}

/**
 * Get contract source code and verification status
 */
export async function getContractSourceCode(
  chain: string,
  address: string
): Promise<ContractSourceCode | null> {
  const cacheKey = `etherscan:source:${chain}:${address}`;
  const cached = cache.get<ContractSourceCode>(cacheKey);
  if (cached) return cached;

  const config = ETHERSCAN_CONFIGS[chain.toLowerCase()];
  if (!config || !config.apiKey) {
    console.warn(`[Etherscan] No configuration found for chain: ${chain}`);
    return null;
  }

  try {
    const url = `${config.apiUrl}?module=contract&action=getsourcecode&address=${address}&apikey=${config.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result && data.result.length > 0) {
      const sourceCode = data.result[0];
      cache.set(cacheKey, sourceCode);
      console.log(`[Etherscan] Contract source code retrieved for ${address} on ${chain}`);
      return sourceCode;
    }

    console.log(`[Etherscan] No source code found for ${address} on ${chain}`);
    return null;
  } catch (error) {
    console.error(`[Etherscan] Error fetching contract source:`, error);
    return null;
  }
}

/**
 * Check if contract is verified on Etherscan
 */
export async function isContractVerified(
  chain: string,
  address: string
): Promise<boolean> {
  const sourceCode = await getContractSourceCode(chain, address);
  return sourceCode !== null && sourceCode.SourceCode !== '';
}

/**
 * Get token information from Etherscan
 */
export async function getTokenInfo(
  chain: string,
  address: string
): Promise<TokenInfo | null> {
  const cacheKey = `etherscan:tokeninfo:${chain}:${address}`;
  const cached = cache.get<TokenInfo>(cacheKey);
  if (cached) return cached;

  const config = ETHERSCAN_CONFIGS[chain.toLowerCase()];
  if (!config || !config.apiKey) {
    console.warn(`[Etherscan] No configuration found for chain: ${chain}`);
    return null;
  }

  try {
    const url = `${config.apiUrl}?module=token&action=tokeninfo&contractaddress=${address}&apikey=${config.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result && data.result.length > 0) {
      const tokenInfo = data.result[0];
      cache.set(cacheKey, tokenInfo);
      console.log(`[Etherscan] Token info retrieved for ${address} on ${chain}`);
      return tokenInfo;
    }

    return null;
  } catch (error) {
    console.error(`[Etherscan] Error fetching token info:`, error);
    return null;
  }
}

/**
 * Get token holder count from Etherscan
 */
export async function getTokenHolderCount(
  chain: string,
  address: string
): Promise<number | null> {
  const cacheKey = `etherscan:holders:${chain}:${address}`;
  const cached = cache.get<number>(cacheKey);
  if (cached) return cached;

  const config = ETHERSCAN_CONFIGS[chain.toLowerCase()];
  if (!config || !config.apiKey) {
    console.warn(`[Etherscan] No configuration found for chain: ${chain}`);
    return null;
  }

  try {
    const url = `${config.apiUrl}?module=token&action=tokenholderlist&contractaddress=${address}&page=1&offset=1&apikey=${config.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.message) {
      const match = data.message.match(/A total of (\d+) holders found/);
      if (match && match[1]) {
        const holderCount = parseInt(match[1], 10);
        cache.set(cacheKey, holderCount);
        console.log(`[Etherscan] Holder count: ${holderCount} for ${address} on ${chain}`);
        return holderCount;
      }
    }

    return null;
  } catch (error) {
    console.error(`[Etherscan] Error fetching holder count:`, error);
    return null;
  }
}

/**
 * Get contract ABI
 */
export async function getContractABI(
  chain: string,
  address: string
): Promise<string | null> {
  const cacheKey = `etherscan:abi:${chain}:${address}`;
  const cached = cache.get<string>(cacheKey);
  if (cached) return cached;

  const config = ETHERSCAN_CONFIGS[chain.toLowerCase()];
  if (!config || !config.apiKey) {
    console.warn(`[Etherscan] No configuration found for chain: ${chain}`);
    return null;
  }

  try {
    const url = `${config.apiUrl}?module=contract&action=getabi&address=${address}&apikey=${config.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result) {
      cache.set(cacheKey, data.result);
      console.log(`[Etherscan] Contract ABI retrieved for ${address} on ${chain}`);
      return data.result;
    }

    return null;
  } catch (error) {
    console.error(`[Etherscan] Error fetching contract ABI:`, error);
    return null;
  }
}

/**
 * Get transaction list for an address
 */
export async function getTransactionList(
  chain: string,
  address: string,
  page: number = 1,
  offset: number = 10
): Promise<any[] | null> {
  const cacheKey = `etherscan:txlist:${chain}:${address}:${page}:${offset}`;
  const cached = cache.get<any[]>(cacheKey);
  if (cached) return cached;

  const config = ETHERSCAN_CONFIGS[chain.toLowerCase()];
  if (!config || !config.apiKey) {
    console.warn(`[Etherscan] No configuration found for chain: ${chain}`);
    return null;
  }

  try {
    const url = `${config.apiUrl}?module=account&action=txlist&address=${address}&page=${page}&offset=${offset}&sort=desc&apikey=${config.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result) {
      cache.set(cacheKey, data.result, 60); // Cache for 1 minute
      console.log(`[Etherscan] Transaction list retrieved for ${address} on ${chain}`);
      return data.result;
    }

    return null;
  } catch (error) {
    console.error(`[Etherscan] Error fetching transaction list:`, error);
    return null;
  }
}

/**
 * Enhanced contract verification check with metadata
 */
export async function getVerificationStatus(
  chain: string,
  address: string
): Promise<{
  isVerified: boolean;
  contractName?: string;
  compilerVersion?: string;
  optimization?: boolean;
  license?: string;
  isProxy?: boolean;
  implementationAddress?: string;
}> {
  const sourceCode = await getContractSourceCode(chain, address);
  
  if (!sourceCode || !sourceCode.SourceCode) {
    return { isVerified: false };
  }

  return {
    isVerified: true,
    contractName: sourceCode.ContractName,
    compilerVersion: sourceCode.CompilerVersion,
    optimization: sourceCode.OptimizationUsed === '1',
    license: sourceCode.LicenseType,
    isProxy: sourceCode.Proxy === '1',
    implementationAddress: sourceCode.Implementation || undefined,
  };
}
