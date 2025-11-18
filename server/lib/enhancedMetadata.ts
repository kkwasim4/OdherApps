/**
 * ENHANCED TOKEN METADATA AGGREGATOR
 * 
 * Fetches comprehensive token metadata from multiple sources and merges them.
 * Includes categories, social links, websites, and community info.
 * 
 * Data Sources:
 * - CoinGecko API: Categories, social links, community stats, descriptions
 * - On-chain data: Basic token info (name, symbol, decimals, totalSupply)
 * - Market data: Price, marketcap, FDV (from liveMarketData.ts)
 */

export interface EnhancedTokenMetadata {
  // Basic info (from on-chain)
  address: string;
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  totalSupply: string | undefined;
  
  // Market data (from liveMarketData)
  price: number | undefined;
  priceChange24h: number | undefined;
  marketCap: number | undefined;
  fdv: number | undefined;
  circulatingSupply: number | undefined;
  
  // Enhanced metadata (from CoinGecko)
  categories: string[];
  websites: string[];
  twitter: string | undefined;
  telegram: string | undefined;
  description: string | undefined;
  
  // Logo
  logo: string | undefined;
}

interface CoinGeckoFullResponse {
  id?: string;
  name?: string;
  symbol?: string;
  description?: {
    en?: string;
  };
  links?: {
    homepage?: string[];
    twitter_screen_name?: string;
    telegram_channel_identifier?: string;
    blockchain_site?: string[];
    official_forum_url?: string[];
  };
  categories?: string[];
  image?: {
    large?: string;
    small?: string;
  };
  market_data?: {
    current_price?: { usd?: number };
    price_change_percentage_24h?: number;
    market_cap?: { usd?: number };
    fully_diluted_valuation?: { usd?: number };
    circulating_supply?: number;
    max_supply?: number;
    total_supply?: number;
  };
}

/**
 * Fetch enhanced metadata from CoinGecko
 * Returns comprehensive token information including social links and categories
 */
async function fetchCoinGeckoEnhancedMetadata(
  address: string, 
  chainId: string
): Promise<CoinGeckoFullResponse | null> {
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

    const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address.toLowerCase()}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.log(`[EnhancedMetadata] CoinGecko API returned ${response.status} for ${address}`);
      return null;
    }

    const data = await response.json();
    return data as CoinGeckoFullResponse;
  } catch (error) {
    console.warn(`[EnhancedMetadata] CoinGecko fetch failed for ${address}:`, error);
    return null;
  }
}

/**
 * Clean and validate URLs
 * Removes empty strings, invalid URLs, and duplicates
 */
function cleanUrls(urls: (string | undefined)[]): string[] {
  const validUrls = urls
    .filter((url): url is string => !!url && url.trim().length > 0)
    .filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
  
  // Remove duplicates
  return Array.from(new Set(validUrls));
}

/**
 * MAIN ENHANCED METADATA AGGREGATOR
 * 
 * Combines data from multiple sources into a unified metadata object
 * 
 * @param address - Token contract address
 * @param chainId - Blockchain identifier
 * @param baseMetadata - Basic on-chain metadata (name, symbol, decimals, totalSupply)
 * @param marketData - Market data (price, marketCap, etc.)
 * @param logoUrl - Token logo URL
 */
export async function aggregateEnhancedMetadata(
  address: string,
  chainId: string,
  baseMetadata: {
    name?: string | null;
    symbol?: string | null;
    decimals?: number | null;
    totalSupply?: string | null;
  },
  marketData: {
    price?: number | null;
    priceChange24h?: number | null;
    marketCap?: number | null;
    fullyDilutedValuation?: number | null;
    circulatingSupply?: number | null;
  },
  logoUrl?: string | null
): Promise<EnhancedTokenMetadata> {
  // Fetch enhanced metadata from CoinGecko
  const coinGecko = await fetchCoinGeckoEnhancedMetadata(address, chainId);

  // Extract categories
  const categories = coinGecko?.categories?.filter(cat => cat && cat.trim().length > 0) || [];

  // Extract website URLs (homepage + official forums)
  const homepages = coinGecko?.links?.homepage || [];
  const forums = coinGecko?.links?.official_forum_url || [];
  const websites = cleanUrls([...homepages, ...forums]);

  // Extract social links
  const twitter = coinGecko?.links?.twitter_screen_name || null;
  const telegram = coinGecko?.links?.telegram_channel_identifier || null;

  // Extract description (English only, first 500 chars)
  const description = coinGecko?.description?.en 
    ? coinGecko.description.en.substring(0, 500) + (coinGecko.description.en.length > 500 ? '...' : '')
    : null;

  // Merge all data sources with priority:
  // 1. Base metadata (on-chain) - most reliable
  // 2. Market data - for price/market cap
  // 3. CoinGecko metadata - for missing fields
  
  // Convert all null values to undefined for schema compliance
  return {
    address,
    name: baseMetadata.name ?? coinGecko?.name ?? undefined,
    symbol: baseMetadata.symbol ?? coinGecko?.symbol?.toUpperCase() ?? undefined,
    decimals: baseMetadata.decimals ?? undefined,
    totalSupply: baseMetadata.totalSupply ?? coinGecko?.market_data?.total_supply?.toString() ?? undefined,
    
    price: marketData.price ?? coinGecko?.market_data?.current_price?.usd ?? undefined,
    priceChange24h: marketData.priceChange24h ?? coinGecko?.market_data?.price_change_percentage_24h ?? undefined,
    marketCap: marketData.marketCap ?? coinGecko?.market_data?.market_cap?.usd ?? undefined,
    fdv: marketData.fullyDilutedValuation ?? coinGecko?.market_data?.fully_diluted_valuation?.usd ?? undefined,
    circulatingSupply: marketData.circulatingSupply ?? coinGecko?.market_data?.circulating_supply ?? undefined,
    
    categories,  // Always array, never null
    websites,    // Always array, never null
    twitter: twitter ?? undefined,    // Convert null to undefined
    telegram: telegram ?? undefined,  // Convert null to undefined
    description: description ?? undefined,  // Convert null to undefined
    
    logo: logoUrl ?? undefined,  // Handle undefined logoUrl
  };
}
