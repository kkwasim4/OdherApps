import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisResult } from "@shared/schema";

interface ExportButtonProps {
  analysis: AnalysisResult;
}

export function ExportButton({ analysis }: ExportButtonProps) {
  const { toast } = useToast();

  const downloadFile = (content: string, filename: string, type: string) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.error('Download functionality is only available in browser environment');
      return;
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = () => {
    const content = JSON.stringify(analysis, null, 2);
    const filename = `odherapp-${analysis.metadata.address.slice(0, 10)}-${Date.now()}.json`;
    downloadFile(content, filename, "application/json");
    
    toast({
      title: "Export Successful",
      description: `Analysis exported as ${filename}`,
    });
  };

  const exportAsCSV = () => {
    const rows: string[][] = [];
    
    rows.push(["Token Analysis Report"]);
    rows.push([]);
    
    rows.push(["Token Metadata"]);
    rows.push(["Field", "Value"]);
    rows.push(["Address", analysis.metadata.address]);
    rows.push(["Chain", analysis.metadata.chain]);
    rows.push(["Chain Type", analysis.metadata.chainType]);
    rows.push(["Name", analysis.metadata.name || "Unknown"]);
    rows.push(["Symbol", analysis.metadata.symbol || "Unknown"]);
    rows.push(["Decimals", analysis.metadata.decimals !== undefined ? String(analysis.metadata.decimals) : "Unknown"]);
    rows.push(["Total Supply", analysis.metadata.totalSupply || "Unknown"]);
    rows.push(["Verified", analysis.metadata.isVerified === true ? "Yes" : analysis.metadata.isVerified === false ? "No" : "Unknown"]);
    rows.push([]);

    rows.push(["Liquidity Information"]);
    rows.push(["DEX", "Pair", "Liquidity USD"]);
    if (analysis.liquidity && analysis.liquidity.length > 0) {
      analysis.liquidity.forEach((liq) => {
        rows.push([liq.dex, liq.pair, String(liq.liquidityUSD)]);
      });
    } else {
      rows.push(["No liquidity data available", "", ""]);
    }
    rows.push(["Total Liquidity USD", "", String(analysis.totalLiquidityUSD)]);
    rows.push([]);

    rows.push(["Risk Analysis"]);
    rows.push(["Risk Score", String(analysis.risk.score)]);
    rows.push(["Owner Privileges", analysis.risk.hasOwnerPrivileges ? "Yes" : "No"]);
    rows.push(["Mint Authority", analysis.risk.hasMintAuthority ? "Yes" : "No"]);
    rows.push([]);
    rows.push(["Risk Factors"]);
    rows.push(["Severity", "Name", "Description"]);
    analysis.risk.factors.forEach((factor) => {
      rows.push([factor.severity, factor.name, factor.description]);
    });
    rows.push([]);

    if (analysis.holders && analysis.holders.length > 0) {
      rows.push(["Top Holders"]);
      rows.push(["Rank", "Address", "Balance", "Percentage"]);
      analysis.holders.forEach((holder, index) => {
        rows.push([
          String(index + 1),
          holder.address,
          holder.balance,
          `${holder.percentage.toFixed(2)}%`,
        ]);
      });
      rows.push([]);
    }

    if (analysis.aiSummary) {
      rows.push(["AI Summary"]);
      rows.push([analysis.aiSummary]);
      rows.push([]);
    }

    rows.push(["Exported At", new Date().toISOString()]);

    const csvContent = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const filename = `odherapp-${analysis.metadata.address.slice(0, 10)}-${Date.now()}.csv`;
    downloadFile(csvContent, filename, "text/csv");

    toast({
      title: "Export Successful",
      description: `Analysis exported as ${filename}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-export">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsJSON} data-testid="button-export-json">
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsCSV} data-testid="button-export-csv">
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
