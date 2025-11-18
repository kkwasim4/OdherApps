import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  testId?: string;
}

export function MetricCard({ label, value, subtitle, testId }: MetricCardProps) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4 space-y-1">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
        <div className="text-xl font-bold font-mono" data-testid={testId}>
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
