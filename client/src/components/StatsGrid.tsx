import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Chains Supported", value: "23 EVM + Solana" },
  { label: "DEX Coverage", value: "10+ DEXs" },
  { label: "Analysis Speed", value: "< 3 seconds" },
  { label: "Risk Factors", value: "15+ checks" },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-2xl lg:text-3xl font-bold text-primary">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
