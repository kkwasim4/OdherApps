/**
 * OHLCV (Candlestick) Data Integration
 * 
 * Fetches historical OHLC (Open, High, Low, Close) and Volume data for interactive charting.
 * Used for TradingView-style candlestick charts with multiple timeframes.
 * 
 * Data Sources:
 * 1. CoinGecko API - Historical market data (primary)
 * 2. DexScreener API - Real-time DEX data (fallback)
 */

export interface OHLCVDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface OHLCVResponse {
  address: string;
  symbol?: string;
  timeframe: string;
  data: OHLCVDataPoint[];
  dataSource: 'coingecko' | 'dexscreener' | 'unavailable';
}

/**
 * Fetch OHLCV data from CoinGecko
 * Supports multiple timeframes: 1h, 4h, 24h, 7d, 30d, 90d, 1y
 */
async function fetchCoinGeckoOHLCV(
  address: string,
  chainId: string,
  timeframe: string
): Promise<OHLCVDataPoint[] | null> {
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

    // Map timeframe to CoinGecko days parameter
    const timeframeMap: Record<string, { days: string; interval?: string }> = {
      '1h': { days: '1', interval: '5m' },
      '4h': { days: '1', interval: '15m' },
      '24h': { days: '1', interval: 'hourly' },
      '7d': { days: '7', interval: 'hourly' },
      '30d': { days: '30', interval: 'daily' },
      '90d': { days: '90', interval: 'daily' },
      '1y': { days: '365', interval: 'daily' },
    };

    const { days, interval } = timeframeMap[timeframe] || { days: '1', interval: 'hourly' };

    // CoinGecko market_chart endpoint (uses contract address directly)
    // Note: OHLC endpoint requires coin ID, but market_chart works with contract addresses
    // We'll use market_chart and derive OHLC from the price data
    const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address.toLowerCase()}/market_chart?vs_currency=usd&days=${days}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    
    // CoinGecko market_chart returns { prices: [[timestamp, price], ...] }
    if (!data.prices || !Array.isArray(data.prices) || data.prices.length === 0) return null;

    // Convert price data to OHLC format
    // For each period, we'll use the price as open, high, low, and close (since we only have price points)
    return data.prices.map((pricePoint: [number, number]) => ({
      timestamp: pricePoint[0],
      open: pricePoint[1],
      high: pricePoint[1],
      low: pricePoint[1],
      close: pricePoint[1],
    }));
  } catch (error) {
    console.warn('CoinGecko OHLCV fetch failed:', error);
    return null;
  }
}

/**
 * Fetch current price from DexScreener as fallback
 * Creates a single candlestick from current price
 */
async function fetchDexScreenerCurrentPrice(
  address: string
): Promise<OHLCVDataPoint[] | null> {
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

    // Get the pair with highest liquidity
    data.pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
    const bestPair = data.pairs[0];

    if (!bestPair.priceUsd) return null;

    const price = parseFloat(bestPair.priceUsd);
    const timestamp = Date.now();

    // Create a simple candlestick from current price
    return [{
      timestamp,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: bestPair.volume?.h24 || 0,
    }];
  } catch (error) {
    console.warn('DexScreener fallback failed:', error);
    return null;
  }
}

/**
 * MAIN OHLCV DATA FETCHER
 * 
 * Fetches candlestick data for interactive charting
 * 
 * @param address - Token contract address
 * @param chainId - Blockchain identifier
 * @param symbol - Token symbol
 * @param timeframe - Time period (1h, 4h, 24h, 7d, 30d, 90d, 1y)
 */
export async function fetchOHLCVData(
  address: string,
  chainId: string,
  symbol?: string,
  timeframe: string = '24h'
): Promise<OHLCVResponse> {
  // Try CoinGecko first
  let ohlcvData = await fetchCoinGeckoOHLCV(address, chainId, timeframe);
  let dataSource: 'coingecko' | 'dexscreener' | 'unavailable' = 'coingecko';

  // Fallback to DexScreener current price
  if (!ohlcvData || ohlcvData.length === 0) {
    ohlcvData = await fetchDexScreenerCurrentPrice(address);
    dataSource = ohlcvData && ohlcvData.length > 0 ? 'dexscreener' : 'unavailable';
  }

  return {
    address,
    symbol,
    timeframe,
    data: ohlcvData || [],
    dataSource,
  };
}
