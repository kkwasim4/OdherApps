import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets } from "lucide-react";
import type { LiquidityData } from "@shared/schema";

interface LiquidityPanelProps {
  liquidity: LiquidityData[];
  totalLiquidityUSD: number;
}

export function LiquidityPanel({ liquidity, totalLiquidityUSD }: LiquidityPanelProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            Liquidity
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Liquidity</p>
            <p className="text-3xl font-bold text-primary" data-testid="text-total-liquidity">
              {formatCurrency(totalLiquidityUSD)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {liquidity.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No liquidity data available
          </div>
        ) : (
          <div className="space-y-3">
            {liquidity.map((liq, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover-elevate"
                data-testid={`liquidity-item-${index}`}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-medium">
                      {liq.dex}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-mono truncate">
                      {liq.pair}
                    </span>
                  </div>
                  {liq.volume24h !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      24h Volume: {formatCurrency(liq.volume24h)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold font-mono">
                    {formatCurrency(liq.liquidityUSD)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
