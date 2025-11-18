import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, LineChart, CandlestickChart } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from 'chartjs-chart-financial';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement
);

interface OHLCVDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface InteractiveChartProps {
  address?: string;
  symbol?: string;
  currentPrice?: number;
  priceChange24h?: number;
}

type ChartType = 'line' | 'candlestick';
type Timeframe = '1h' | '4h' | '24h' | '7d' | '30d' | '90d' | '1y';

export function InteractiveChart({ address, symbol, currentPrice, priceChange24h }: InteractiveChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const chartRef = useRef<any>(null);

  const isPositive = (priceChange24h ?? 0) >= 0;

  // Fetch OHLCV data from API
  const { data: ohlcvData, isLoading } = useQuery<{
    address: string;
    symbol?: string;
    timeframe: string;
    data: OHLCVDataPoint[];
    dataSource: string;
  }>({
    queryKey: ['/api/ohlcv', address, timeframe],
    queryFn: async () => {
      if (!address) throw new Error('No address provided');
      const response = await apiRequest('GET', `/api/ohlcv/${address}?timeframe=${timeframe}`);
      return await response.json();
    },
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const chartData = ohlcvData?.data || [];
  const hasData = chartData.length > 0;

  // Prepare chart data based on chart type
  const preparedChartData = useMemo(() => {
    if (!hasData) return null;

    if (chartType === 'line') {
      // Line chart - use close prices
      return {
        labels: chartData.map(d => new Date(d.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: timeframe === '1h' || timeframe === '4h' ? 'numeric' : undefined,
          minute: timeframe === '1h' ? 'numeric' : undefined,
        })),
        datasets: [{
          label: `${symbol || 'Price'} (USD)`,
          data: chartData.map(d => d.close),
          borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
          backgroundColor: isPositive 
            ? 'rgba(34, 197, 94, 0.1)' 
            : 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: chartData.length > 50 ? 0 : 2,
          pointHoverRadius: 5,
        }]
      };
    } else {
      // Candlestick chart
      return {
        labels: chartData.map(d => new Date(d.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: timeframe === '1h' || timeframe === '4h' ? 'numeric' : undefined,
        })),
        datasets: [{
          label: `${symbol || 'Price'}`,
          data: chartData.map(d => ({
            x: d.timestamp,
            o: d.open,
            h: d.high,
            l: d.low,
            c: d.close,
          })) as any,
          borderColor: {
            up: 'rgb(34, 197, 94)',
            down: 'rgb(239, 68, 68)',
            unchanged: 'rgb(156, 163, 175)',
          } as any,
          backgroundColor: {
            up: 'rgba(34, 197, 94, 0.8)',
            down: 'rgba(239, 68, 68, 0.8)',
            unchanged: 'rgba(156, 163, 175, 0.8)',
          } as any,
        }]
      };
    }
  }, [chartData, chartType, hasData, isPositive, symbol, timeframe]);

  // Chart options
  const chartOptions: ChartOptions<any> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            if (chartType === 'candlestick') {
              const data = context.raw;
              return [
                `Open: $${data.o?.toFixed(6) || 'N/A'}`,
                `High: $${data.h?.toFixed(6) || 'N/A'}`,
                `Low: $${data.l?.toFixed(6) || 'N/A'}`,
                `Close: $${data.c?.toFixed(6) || 'N/A'}`,
              ];
            }
            return `Price: $${context.parsed.y?.toFixed(6) || 'N/A'}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkipPadding: 20,
          font: {
            size: 10,
          },
        },
      },
      y: {
        display: true,
        position: 'right' as const,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(value < 0.01 ? 6 : value < 1 ? 4 : 2);
          },
          font: {
            size: 10,
          },
        },
      },
    },
  }), [chartType]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!hasData) return null;

    const prices = chartData.map(d => d.close);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const firstPrice = chartData[0].close;
    const lastPrice = chartData[chartData.length - 1].close;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    return { high, low, change };
  }, [chartData, hasData]);

  const timeframeButtons: { value: Timeframe; label: string }[] = [
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' },
  ];

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Price Chart</h3>
          {stats && (
            <div className="flex items-center gap-3 text-sm">
              <div className={`flex items-center gap-1 font-semibold ${stats.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)}%
              </div>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">H: ${stats.high.toFixed(6)}</span>
              <span className="text-muted-foreground">L: ${stats.low.toFixed(6)}</span>
            </div>
          )}
        </div>

        {/* Chart Type Switcher */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={chartType === 'line' ? 'default' : 'outline'}
            onClick={() => setChartType('line')}
            className="gap-1"
            data-testid="button-chart-type-line"
          >
            <LineChart className="w-4 h-4" />
            Line
          </Button>
          <Button
            size="sm"
            variant={chartType === 'candlestick' ? 'default' : 'outline'}
            onClick={() => setChartType('candlestick')}
            className="gap-1"
            data-testid="button-chart-type-candle"
          >
            <CandlestickChart className="w-4 h-4" />
            Candle
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 pb-2 border-b">
          {timeframeButtons.map(({ value, label }) => (
            <Button
              key={value}
              size="sm"
              variant={timeframe === value ? 'default' : 'ghost'}
              onClick={() => setTimeframe(value)}
              className="min-w-[50px]"
              data-testid={`button-timeframe-${value}`}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Chart Area */}
        <div className="h-[400px] relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="w-full h-full" />
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">No chart data available</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Try a different timeframe or check back later
                </p>
              </div>
            </div>
          ) : preparedChartData ? (
            <Chart
              ref={chartRef}
              type={chartType === 'candlestick' ? 'candlestick' : 'line'}
              data={preparedChartData}
              options={chartOptions}
            />
          ) : null}
        </div>

        {/* Current Price Display */}
        {currentPrice !== undefined && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Current Price</div>
              <div className="text-xl font-bold font-mono" data-testid="text-current-price">
                ${currentPrice.toFixed(currentPrice < 0.01 ? 6 : currentPrice < 1 ? 4 : 2)}
              </div>
            </div>
            {priceChange24h !== undefined && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">24H Change</div>
                <div className={`text-xl font-bold flex items-center gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                </div>
              </div>
            )}
            {ohlcvData?.dataSource && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Data Source</div>
                <div className="text-sm font-semibold capitalize">
                  {ohlcvData.dataSource}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
