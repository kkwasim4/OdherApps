/**
 * HISTORICAL PRICE DATA INTEGRATION
 * 
 * Fetches real-time 24h price history from market data APIs.
 * Zero mock data - all information comes from live APIs.
 * 
 * Data Sources:
 * 1. CoinGecko API - 24h price history with hourly data points
 * 2. DexScreener API - Fallback for DEX tokens
 */

export interface PriceDataPoint {
  timestamp: number;
  price: number;
}

/**
 * Fetch 24h price history from CoinGecko
 */
async function fetchCoinGeckoHistory(address: string, chainId: string): Promise<PriceDataPoint[] | null> {
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

    const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address.toLowerCase()}/market_chart?vs_currency=usd&days=1`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    
    if (!data.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
      return null;
    }

    // CoinGecko returns [[timestamp, price], [timestamp, price], ...]
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price
    }));
  } catch (error) {
    console.warn('[HistoricalPrice] CoinGecko fetch failed:', error);
    return null;
  }
}

/**
 * Fetch 24h price history from DexScreener
 */
async function fetchDexScreenerHistory(address: string, chainId: string): Promise<PriceDataPoint[] | null> {
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

    // DexScreener doesn't provide historical data in free tier
    // Return current price as single data point
    if (bestPair.priceUsd) {
      return [{
        timestamp: Date.now(),
        price: parseFloat(bestPair.priceUsd)
      }];
    }

    return null;
  } catch (error) {
    console.warn('[HistoricalPrice] DexScreener fetch failed:', error);
    return null;
  }
}

/**
 * MAIN HISTORICAL PRICE FETCHER
 * 
 * Fetches real 24h price history from available sources.
 * Returns empty array if no data available.
 */
export async function fetchHistoricalPriceData(
  address: string,
  chainId: string
): Promise<PriceDataPoint[]> {
  // Try CoinGecko first (has actual historical data)
  const geckoHistory = await fetchCoinGeckoHistory(address, chainId);
  if (geckoHistory && geckoHistory.length > 0) {
    console.log(`[HistoricalPrice] Fetched ${geckoHistory.length} data points from CoinGecko`);
    return geckoHistory;
  }

  // Fallback to DexScreener (single current price point)
  const dexHistory = await fetchDexScreenerHistory(address, chainId);
  if (dexHistory && dexHistory.length > 0) {
    console.log('[HistoricalPrice] Using current price from DexScreener');
    return dexHistory;
  }

  console.log('[HistoricalPrice] No price history available');
  return [];
}
