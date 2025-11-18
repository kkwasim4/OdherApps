/**
 * LIVE MARKET DATA INTEGRATION
 * 
 * Fetches real-time price, volume, and market cap data from multiple sources.
 * Zero mock data - all information comes from live APIs.
 * 
 * Data Sources (in priority order):
 * 1. DexScreener API - Real-time DEX prices and volume
 * 2. CoinGecko API - Comprehensive market data for listed tokens
 * 3. On-chain calculation - Fallback using liquidity pool data
 * 
 * All sources have timeout protection and graceful degradation.
 */

import { resolveTokenLogo } from './logoResolver';

export interface LiveMarketData {
  price: number | null;
  priceChange24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  fullyDilutedValuation: number | null;
  circulatingSupply: number | null;
  maxSupply: number | null;
  logoUrl: string;
  dataSource: 'dexscreener' | 'coingecko' | 'calculated' | 'unavailable';
}

/**
 * Fetch price data from DexScreener API
 * Most reliable for new/unlisted tokens on DEXes
 */
async function fetchDexScreenerData(address: string, chainId: string): Promise<Partial<LiveMarketData> | null> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.pairs || data.pairs.length === 0) return null;

    // Filter pairs by chain and sort by liquidity (most liquid pair = most accurate price)
    const chainMap: Record<string, string> = {
      'ethereum': 'ethereum',
      'bsc': 'bsc',
      'polygon': 'polygon',
      'base': 'base',
      'optimism': 'optimism',
      'arbitrum': 'arbitrum',
      'avalanche': 'avalanche',
    };

    const expectedChainId = chainMap[chainId.toLowerCase()];
    const chainPairs = expectedChainId
      ? data.pairs.filter((pair: any) => pair.chainId?.toLowerCase() === expectedChainId)
      : data.pairs;

    if (chainPairs.length === 0) return null;

    // Get the pair with highest liquidity
    chainPairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
    const bestPair = chainPairs[0];

    return {
      price: bestPair.priceUsd ? parseFloat(bestPair.priceUsd) : null,
      priceChange24h: bestPair.priceChange?.h24 || null,
      volume24h: bestPair.volume?.h24 || null,
      marketCap: bestPair.fdv || null, // DexScreener reports FDV as marketCap for most tokens
      fullyDilutedValuation: bestPair.fdv || null,
      dataSource: 'dexscreener' as const,
    };
  } catch (error) {
    console.warn('DexScreener fetch failed:', error);
    return null;
  }
}

/**
 * Fetch comprehensive market data from CoinGecko
 * Best for established tokens listed on CoinGecko
 */
async function fetchCoinGeckoData(address: string, chainId: string): Promise<Partial<LiveMarketData> | null> {
  try {
    const platformMap: Record<string, string> = {
      'ethereum': 'ethereum',
      'bsc': 'binance-smart-chain',
      'polygon': 'polygon-pos',
      'optimism': 'optimistic-ethereum',
      'arbitrum': 'arbitrum-one',
      'avalanche': 'avalanche',
      'base': 'base',
    };

    const platform = platformMap[chainId.toLowerCase()];
    if (!platform) return null;

    // CoinGecko API - no key required for basic usage (rate limited but functional)
    const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address.toLowerCase()}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    
    return {
      price: data.market_data?.current_price?.usd || null,
      priceChange24h: data.market_data?.price_change_percentage_24h || null,
      marketCap: data.market_data?.market_cap?.usd || null,
      volume24h: data.market_data?.total_volume?.usd || null,
      fullyDilutedValuation: data.market_data?.fully_diluted_valuation?.usd || null,
      circulatingSupply: data.market_data?.circulating_supply || null,
      maxSupply: data.market_data?.max_supply || null,
      dataSource: 'coingecko' as const,
    };
  } catch (error) {
    console.warn('CoinGecko fetch failed:', error);
    return null;
  }
}

/**
 * Calculate estimated price from liquidity pool data
 * Fallback when APIs are unavailable
 */
function calculatePriceFromLiquidity(
  totalSupply: string | undefined,
  totalLiquidityUSD: number,
  decimals: number = 18
): Partial<LiveMarketData> | null {
  if (!totalSupply || totalLiquidityUSD === 0) return null;

  try {
    // Rough estimate: assume liquidity represents ~10% of circulating supply
    const supply = parseFloat(totalSupply) / Math.pow(10, decimals);
    const estimatedCirculating = supply * 0.1; // Conservative estimate
    const estimatedPrice = totalLiquidityUSD / estimatedCirculating;

    return {
      price: estimatedPrice > 0 ? estimatedPrice : null,
      priceChange24h: null, // Can't calculate without historical data
      marketCap: estimatedPrice * supply,
      volume24h: null,
      dataSource: 'calculated' as const,
    };
  } catch (error) {
    return null;
  }
}

/**
 * MAIN LIVE MARKET DATA FETCHER
 * 
 * Attempts multiple data sources in priority order.
 * Always resolves with at minimum a valid logo URL.
 * 
 * @param address - Token contract address
 * @param chainId - Blockchain identifier
 * @param symbol - Token symbol (for logo generation)
 * @param totalSupply - Total supply (for fallback calculation)
 * @param totalLiquidityUSD - Total liquidity (for fallback calculation)
 * @param decimals - Token decimals (for fallback calculation)
 */
export async function fetchLiveMarketData(
  address: string,
  chainId: string,
  symbol?: string,
  totalSupply?: string,
  totalLiquidityUSD?: number,
  decimals?: number
): Promise<LiveMarketData> {
  // Always fetch logo (guaranteed to return a valid URL)
  const logoResolution = await resolveTokenLogo(address, chainId, symbol);

  // Try DexScreener first (best for DEX-traded tokens)
  const dexData = await fetchDexScreenerData(address, chainId);
  if (dexData && dexData.price !== null) {
    return {
      price: dexData.price ?? null,
      priceChange24h: dexData.priceChange24h ?? null,
      marketCap: dexData.marketCap ?? null,
      volume24h: dexData.volume24h ?? null,
      fullyDilutedValuation: dexData.fullyDilutedValuation ?? null,
      circulatingSupply: dexData.circulatingSupply ?? null,
      maxSupply: dexData.maxSupply ?? null,
      logoUrl: logoResolution.url,
      dataSource: 'dexscreener',
    };
  }

  // Try CoinGecko (best for established tokens)
  const geckoData = await fetchCoinGeckoData(address, chainId);
  if (geckoData && geckoData.price !== null) {
    return {
      price: geckoData.price ?? null,
      priceChange24h: geckoData.priceChange24h ?? null,
      marketCap: geckoData.marketCap ?? null,
      volume24h: geckoData.volume24h ?? null,
      fullyDilutedValuation: geckoData.fullyDilutedValuation ?? null,
      circulatingSupply: geckoData.circulatingSupply ?? null,
      maxSupply: geckoData.maxSupply ?? null,
      logoUrl: logoResolution.url,
      dataSource: 'coingecko',
    };
  }

  // Fallback: Calculate from liquidity data
  if (totalLiquidityUSD && totalLiquidityUSD > 0) {
    const calculated = calculatePriceFromLiquidity(totalSupply, totalLiquidityUSD, decimals);
    if (calculated && calculated.price !== null) {
      return {
        price: calculated.price ?? null,
        priceChange24h: calculated.priceChange24h ?? null,
        marketCap: calculated.marketCap ?? null,
        volume24h: calculated.volume24h ?? null,
        fullyDilutedValuation: calculated.fullyDilutedValuation ?? null,
        circulatingSupply: null,
        maxSupply: null,
        logoUrl: logoResolution.url,
        dataSource: 'calculated',
      };
    }
  }

  // No price data available from any source
  return {
    price: null,
    priceChange24h: null,
    marketCap: null,
    volume24h: null,
    fullyDilutedValuation: null,
    circulatingSupply: null,
    maxSupply: null,
    logoUrl: logoResolution.url,
    dataSource: 'unavailable',
  };
}
