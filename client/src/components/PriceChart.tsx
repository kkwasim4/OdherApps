import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/api/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceChartProps {
  address?: string;
  symbol?: string;
  currentPrice?: number;
  priceChange24h?: number;
}

interface PriceDataPoint {
  timestamp: number;
  price: number;
}

export function PriceChart({ address, symbol, currentPrice, priceChange24h }: PriceChartProps) {
  const isPositive = (priceChange24h ?? 0) >= 0;
  
  // Fetch real historical price data from API using shared apiRequest helper
  const { data: historyData, isLoading } = useQuery<{ priceHistory: PriceDataPoint[] }>({
    queryKey: ['/api/price-history', address],
    queryFn: async () => {
      if (!address) throw new Error('No address provided');
      const response = await apiRequest('GET', `/api/price-history/${address}`);
      return await response.json();
    },
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const priceHistory = historyData?.priceHistory || [];
  const hasHistoricalData = priceHistory.length > 0;

  // Process historical data for SVG visualization
  const generateTrendPoints = () => {
    if (priceHistory.length === 0) {
      return [];
    }
    
    if (priceHistory.length === 1) {
      // Single data point (e.g., DexScreener fallback) - create flat line
      const price = priceHistory[0].price;
      return [
        { x: 0, y: price },
        { x: 100, y: price }
      ];
    }
    
    // Multiple data points - use real historical data
    const maxX = priceHistory.length - 1;
    return priceHistory.map((point, i) => ({
      x: (i / maxX) * 100,
      y: point.price
    }));
  };

  const trendPoints = generateTrendPoints();
  
  let svgPoints: { x: number; y: number }[] = [];
  let pathData = '';
  
  if (trendPoints.length > 0) {
    const maxY = Math.max(...trendPoints.map(p => p.y));
    const minY = Math.min(...trendPoints.map(p => p.y));
    const range = maxY - minY || 1;
    
    // Convert to SVG coordinates (inverted Y axis)
    svgPoints = trendPoints.map(p => ({
      x: p.x,
      y: 100 - ((p.y - minY) / range) * 100
    }));

    pathData = svgPoints.length > 0 
      ? `M ${svgPoints.map(p => `${p.x},${p.y}`).join(' L ')}`
      : '';
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Price Chart (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* SVG Trend Line - Always show if we have historical data */}
          <div className="h-[160px] relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-muted-foreground/10 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-muted-foreground">Loading price history...</div>
              </div>
            ) : !hasHistoricalData ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-muted-foreground">No historical data available</div>
              </div>
            ) : (
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Gradient fill */}
                <defs>
                  <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Fill area */}
                {pathData && (
                  <path
                    d={`${pathData} L 100,100 L 0,100 Z`}
                    fill="url(#trendGradient)"
                  />
                )}
                
                {/* Trend line */}
                {pathData && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>
            )}
          </div>

          {/* Price Display - Show if available, otherwise show minimal info */}
          {currentPrice && priceChange24h !== undefined ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                <div className="text-2xl font-bold font-mono" data-testid="text-chart-price">
                  ${currentPrice.toFixed(currentPrice < 0.01 ? 6 : currentPrice < 1 ? 4 : 2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">24H Change</div>
                <div className={`text-2xl font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                </div>
              </div>
            </div>
          ) : hasHistoricalData && priceHistory.length > 0 ? (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">
                Historical data available • Latest price: ${priceHistory[priceHistory.length - 1].price.toFixed(6)}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
