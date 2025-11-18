import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import type { TokenFlowMetrics } from "@shared/schema";

interface PriceMetricsPanelProps {
  symbol?: string;
  currentPrice?: number;
  priceChange24h?: number;
  flowMetrics?: TokenFlowMetrics;
}

function formatNumber(value: number | undefined, decimals: number = 2): string {
  if (value === undefined || value === null) return 'N/A';
  
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  } else if (value < 0.01) {
    return `$${value.toFixed(6)}`;
  }
  
  return `$${value.toFixed(decimals)}`;
}

function formatTokenAmount(value: string | undefined): string {
  if (!value || value === 'N/A') return 'N/A';
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'N/A';
  
  if (numValue >= 1000000000) {
    return `${(numValue / 1000000000).toFixed(2)}B`;
  } else if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(2)}M`;
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(2)}K`;
  }
  
  return numValue.toFixed(2);
}

export function PriceMetricsPanel({ 
  symbol, 
  currentPrice, 
  priceChange24h,
  flowMetrics
}: PriceMetricsPanelProps) {
  // Only show metrics if we have live data
  if (!currentPrice || priceChange24h === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Price & Flow Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            Price data unavailable - analyzing...
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = priceChange24h >= 0;

  const MetricRow = ({ 
    label, 
    value, 
    change, 
    icon: Icon 
  }: { 
    label: string; 
    value: string; 
    change?: number;
    icon?: React.ComponentType<{ className?: string }>;
  }) => {
    const isPositiveChange = change !== undefined && change >= 0;
    const ChangeIcon = change === undefined ? null : change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : ArrowRight;
    
    return (
      <div className="flex items-center justify-between py-3 px-4 rounded-lg hover-elevate" data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{value}</span>
          {change !== undefined && ChangeIcon && (
            <span className={`flex items-center text-xs font-medium ${isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <ChangeIcon className="w-3 h-3 mr-0.5" />
              {Math.abs(change).toFixed(2)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Live Price & Flow Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Price Display */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Current Price</div>
            <div className="text-2xl font-bold" data-testid="text-current-price">
              {formatNumber(currentPrice, 6)}
            </div>
          </div>
          <div className="flex flex-col items-end justify-center">
            <div className="text-sm text-muted-foreground mb-1">24H Change</div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-md ${isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {isPositive ? (
                <TrendingUp className={`w-4 h-4 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              ) : (
                <TrendingDown className={`w-4 h-4 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              )}
              <span className={`text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} data-testid="text-price-change-24h">
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Flow Metrics Table */}
        {flowMetrics && (
          <div className="space-y-2">
            <div className="text-sm font-semibold mb-3">Live Blockchain Flow Metrics</div>
            
            {/* 24H Metrics */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase px-4">24 Hours</div>
              <MetricRow 
                label="Inflow" 
                value={`${formatTokenAmount(flowMetrics.period24h.inflow)} ${symbol || ''}`}
                icon={ArrowUpRight}
              />
              <MetricRow 
                label="Outflow" 
                value={`${formatTokenAmount(flowMetrics.period24h.outflow)} ${symbol || ''}`}
                icon={ArrowDownRight}
              />
              <MetricRow 
                label="Net Flow" 
                value={`${formatTokenAmount(flowMetrics.period24h.netFlow)} ${symbol || ''}`}
                icon={(() => {
                  const netFlowNum = parseFloat(flowMetrics.period24h.netFlow);
                  if (!isFinite(netFlowNum)) return ArrowRight;
                  return netFlowNum >= 0 ? ArrowUpRight : ArrowDownRight;
                })()}
              />
              {flowMetrics.period24h.transferCount > 0 && (
                <div className="text-xs text-muted-foreground px-4 pt-1">
                  {flowMetrics.period24h.transferCount} transfers • {flowMetrics.period24h.uniqueAddresses} unique addresses
                </div>
              )}
            </div>

            {/* 12H Metrics */}
            <div className="space-y-1 pt-2">
              <div className="text-xs font-medium text-muted-foreground uppercase px-4">12 Hours</div>
              <MetricRow 
                label="Inflow" 
                value={`${formatTokenAmount(flowMetrics.period12h.inflow)} ${symbol || ''}`}
                icon={ArrowUpRight}
              />
              <MetricRow 
                label="Outflow" 
                value={`${formatTokenAmount(flowMetrics.period12h.outflow)} ${symbol || ''}`}
                icon={ArrowDownRight}
              />
              <MetricRow 
                label="Net Flow" 
                value={`${formatTokenAmount(flowMetrics.period12h.netFlow)} ${symbol || ''}`}
                icon={(() => {
                  const netFlowNum = parseFloat(flowMetrics.period12h.netFlow);
                  if (!isFinite(netFlowNum)) return ArrowRight;
                  return netFlowNum >= 0 ? ArrowUpRight : ArrowDownRight;
                })()}
              />
            </div>

            {/* 4H Metrics */}
            <div className="space-y-1 pt-2">
              <div className="text-xs font-medium text-muted-foreground uppercase px-4">4 Hours</div>
              <MetricRow 
                label="Inflow" 
                value={`${formatTokenAmount(flowMetrics.period4h.inflow)} ${symbol || ''}`}
                icon={ArrowUpRight}
              />
              <MetricRow 
                label="Outflow" 
                value={`${formatTokenAmount(flowMetrics.period4h.outflow)} ${symbol || ''}`}
                icon={ArrowDownRight}
              />
              <MetricRow 
                label="Net Flow" 
                value={`${formatTokenAmount(flowMetrics.period4h.netFlow)} ${symbol || ''}`}
                icon={(() => {
                  const netFlowNum = parseFloat(flowMetrics.period4h.netFlow);
                  if (!isFinite(netFlowNum)) return ArrowRight;
                  return netFlowNum >= 0 ? ArrowUpRight : ArrowDownRight;
                })()}
              />
            </div>
          </div>
        )}

        {!flowMetrics && (
          <div className="text-sm text-muted-foreground text-center py-4">
            Flow metrics not available for this token
          </div>
        )}
      </CardContent>
    </Card>
  );
}
