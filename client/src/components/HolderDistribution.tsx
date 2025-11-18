import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle } from "lucide-react";
import { formatTokenBalance } from "@/utils/formatTokenAmount";
import AddressLink from "@/components/AddressLink";
import type { HolderData } from "@shared/schema";

interface HolderDistributionProps {
  holders: HolderData[];
  decimals?: number;
  symbol?: string;
}

// Classify holders into categories based on their percentage of total supply
function classifyHolders(holders: HolderData[]) {
  let whale = 0, large = 0, medium = 0, small = 0;

  holders.forEach(holder => {
    const pct = holder.percentage;
    if (pct >= 1.0) whale++;           // ≥ 1%
    else if (pct >= 0.1) large++;       // 0.1% - 1%
    else if (pct >= 0.01) medium++;     // 0.01% - 0.1%
    else small++;                       // < 0.01%
  });

  return { whale, large, medium, small };
}

export function HolderDistribution({ holders, decimals, symbol }: HolderDistributionProps) {
  const maxPercentage = holders.length > 0 ? Math.max(...holders.map(h => h.percentage)) : 0;
  const isWhale = (percentage: number) => percentage >= 1.0;
  
  // Classify holders
  const classification = classifyHolders(holders);

  const top10Holders = holders.slice(0, 10);
  const othersPercentage = holders.slice(10).reduce((acc, h) => acc + h.percentage, 0);

  // Color mapping for holder bars
  const COLORS = [
    "#001B48",
    "#0056A6",
    "#4AA8FF",
    "#D6EBFF",
    "#2563EB",
    "#3B82F6",
    "#60A5FA",
    "#93C5FD",
    "#BFDBFE",
    "#DBEAFE",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Holder Distribution
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {holders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No holder data available
          </div>
        ) : (
          <div className="space-y-6">
            {/* Classification Summary */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#001B48" }}>
                  {classification.whale}
                </div>
                <div className="text-xs text-muted-foreground">Whales (≥1%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#0056A6" }}>
                  {classification.large}
                </div>
                <div className="text-xs text-muted-foreground">Large (0.1-1%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#4AA8FF" }}>
                  {classification.medium}
                </div>
                <div className="text-xs text-muted-foreground">Medium (0.01-0.1%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#D6EBFF" }}>
                  {classification.small}
                </div>
                <div className="text-xs text-muted-foreground">Small (&lt;0.01%)</div>
              </div>
            </div>

            {/* Top 10 Holders Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Top 10 Holders</h4>
              {top10Holders.map((holder, index) => (
                <div key={index} className="space-y-2" data-testid={`holder-${index}`}>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-muted-foreground shrink-0">
                        #{index + 1}
                      </span>
                      <div className="truncate">
                        <AddressLink 
                          address={holder.address} 
                          type="address"
                          shorten={true}
                          className="text-sm"
                          testId={`link-holder-${index}`}
                        />
                      </div>
                      {isWhale(holder.percentage) && (
                        <Badge variant="destructive" className="shrink-0 gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Whale
                        </Badge>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold">{holder.percentage.toFixed(2)}%</div>
                      {decimals !== undefined && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {formatTokenBalance(holder.balance, decimals, symbol)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-visible">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${(holder.percentage / maxPercentage) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                        boxShadow: "0 2px 8px rgba(0, 27, 72, 0.15)",
                      }}
                    />
                  </div>
                </div>
              ))}
              {othersPercentage > 0 && (
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Others ({holders.length - 10} holders)</span>
                  <span className="font-semibold">{othersPercentage.toFixed(2)}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
