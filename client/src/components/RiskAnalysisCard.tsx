import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, Info } from "lucide-react";
import type { RiskAnalysis } from "@shared/schema";

interface RiskAnalysisCardProps {
  risk: RiskAnalysis;
}

export function RiskAnalysisCard({ risk }: RiskAnalysisCardProps) {
  const getRiskLevel = (score: number): { label: string; color: string; variant: "default" | "destructive" | "secondary" } => {
    if (score >= 75) return { label: "Low Risk", color: "text-green-600", variant: "default" };
    if (score >= 50) return { label: "Medium Risk", color: "text-yellow-600", variant: "secondary" };
    return { label: "High Risk", color: "text-red-600", variant: "destructive" };
  };

  const riskLevel = getRiskLevel(risk.score);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-600" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const criticalFactors = risk.factors.filter(f => f.severity === 'high');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Risk Analysis
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Risk Score</p>
              <p className={`text-4xl font-bold ${riskLevel.color}`} data-testid="text-risk-score">
                {risk.score}/100
              </p>
            </div>
            <Badge variant={riskLevel.variant} className="text-sm px-3 py-1">
              {riskLevel.label}
            </Badge>
          </div>

          <div className="space-y-2">
            <Progress value={risk.score} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Higher scores indicate lower risk
            </p>
          </div>
        </div>

        {criticalFactors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">Critical Warnings:</span> {criticalFactors.length} high-risk factor{criticalFactors.length > 1 ? 's' : ''} detected
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <p className="text-sm font-semibold">Risk Factors</p>
          {risk.factors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No significant risk factors detected</p>
          ) : (
            <div className="space-y-2">
              {risk.factors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                  data-testid={`risk-factor-${index}`}
                >
                  {getSeverityIcon(factor.severity)}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{factor.name}</p>
                      {getSeverityBadge(factor.severity)}
                    </div>
                    <p className="text-xs text-muted-foreground">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {(risk.hasOwnerPrivileges || risk.hasMintAuthority || risk.lpOwnershipPercent !== undefined || risk.tradingTax !== undefined) && (
          <div className="grid grid-cols-2 gap-3">
            {risk.hasOwnerPrivileges !== undefined && (
              <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                <p className="text-xs text-muted-foreground">Owner Privileges</p>
                <p className="text-sm font-semibold">
                  {risk.hasOwnerPrivileges ? "Detected" : "None"}
                </p>
              </div>
            )}
            {risk.hasMintAuthority !== undefined && (
              <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                <p className="text-xs text-muted-foreground">Mint Authority</p>
                <p className="text-sm font-semibold">
                  {risk.hasMintAuthority ? "Active" : "Disabled"}
                </p>
              </div>
            )}
            {risk.lpOwnershipPercent !== undefined && (
              <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                <p className="text-xs text-muted-foreground">LP Ownership</p>
                <p className="text-sm font-semibold">{risk.lpOwnershipPercent.toFixed(1)}%</p>
              </div>
            )}
            {risk.tradingTax !== undefined && (
              <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                <p className="text-xs text-muted-foreground">Trading Tax</p>
                <p className="text-sm font-semibold">{risk.tradingTax.toFixed(1)}%</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
