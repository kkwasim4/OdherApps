// Mock market data generator for MVP
// In production, this would call real price APIs like CoinGecko, DexScreener, etc.

import { createHash } from 'crypto';

interface MarketData {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  logoUrl?: string;
  maxSupply?: string;
}

const MOCK_LOGOS: Record<string, string> = {
  'ethereum': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'usdt': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  'usdc': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  'dai': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
};

// Deterministic random number generator using SHA-256
function deterministicRandom(seed: string, index: number): number {
  const hash = createHash('sha256')
    .update(seed + ':' + index.toString())
    .digest('hex');
  const hexValue = parseInt(hash.substring(0, 8), 16);
  return hexValue / 0xffffffff;
}

export function generateMarketData(symbol?: string, totalSupply?: string): MarketData {
  // Create deterministic seed from symbol and totalSupply
  const seed = (symbol || 'unknown') + ':' + (totalSupply || '0');
  
  // Generate realistic deterministic data based on symbol
  const basePrice = symbol && (symbol.toLowerCase().includes('usdt') || symbol.toLowerCase().includes('usdc') || symbol.toLowerCase().includes('dai'))
    ? 1.0  // Stablecoins around $1
    : deterministicRandom(seed, 0) * 1000 + 0.01;  // Deterministic price between $0.01 and $1000
  
  const price = parseFloat(basePrice.toFixed(6));
  
  // Price change between -20% and +30%
  const priceChange24h = parseFloat((deterministicRandom(seed, 1) * 50 - 20).toFixed(2));
  
  // Calculate market cap based on total supply and price
  let marketCap = 0;
  if (totalSupply) {
    try {
      const supply = parseFloat(totalSupply) / Math.pow(10, 18); // Assume 18 decimals
      marketCap = supply * price;
    } catch {
      marketCap = deterministicRandom(seed, 2) * 1000000000; // Deterministic between 0 and 1B
    }
  } else {
    marketCap = deterministicRandom(seed, 2) * 1000000000;
  }
  
  // Volume is typically 5-20% of market cap
  const volume24h = marketCap * (0.05 + deterministicRandom(seed, 3) * 0.15);
  
  // Find logo if available
  const logoKey = symbol?.toLowerCase() || '';
  const logoUrl = MOCK_LOGOS[logoKey];
  
  return {
    price,
    priceChange24h,
    marketCap: parseFloat(marketCap.toFixed(2)),
    volume24h: parseFloat(volume24h.toFixed(2)),
    logoUrl,
  };
}
