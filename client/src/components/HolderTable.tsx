import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, AlertCircle } from "lucide-react";
import { formatTokenBalance } from "@/utils/formatTokenAmount";
import AddressLink from "@/components/AddressLink";
import type { HolderData } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface HolderTableProps {
  holders: HolderData[];
  decimals?: number;
  symbol?: string;
  totalHolders?: number;
  isLiveData?: boolean;
  error?: string | null;
}

// Helper function to format large number strings with commas (precision-safe)
// Handles both integer strings (BigInt format) and decimal-formatted strings
function formatLargeNumberString(numStr: string): string {
  if (!numStr) return '0';
  
  // Handle negative numbers
  const isNegative = numStr.startsWith('-');
  const absStr = isNegative ? numStr.slice(1) : numStr;
  
  // Check if the string contains a decimal point
  const parts = absStr.split('.');
  
  // Format the integer part with commas
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Preserve the decimal part if it exists
  const result = parts.length > 1 
    ? `${integerPart}.${parts[1]}`
    : integerPart;
  
  return isNegative ? `-${result}` : result;
}

export function HolderTable({ 
  holders, 
  decimals, 
  symbol, 
  totalHolders,
  isLiveData,
  error 
}: HolderTableProps) {
  
  if (error) {
    return (
      <Card data-testid="card-holder-error">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Token Holders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" data-testid="alert-holder-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription data-testid="text-holder-error">{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!holders || holders.length === 0) {
    return (
      <Card data-testid="card-holder-empty">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Token Holders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground" data-testid="text-holder-empty">
            No holder data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-holder-table">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Token Holders
            {totalHolders && totalHolders > 0 && (
              <span className="text-sm font-normal text-muted-foreground" data-testid="text-total-holders">
                ({totalHolders.toLocaleString()} total)
              </span>
            )}
          </CardTitle>
          {isLiveData && (
            <div className="flex items-center gap-2" data-testid="badge-live-data">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Live Data</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]" data-testid="header-rank">Rank</TableHead>
                <TableHead data-testid="header-address">Address</TableHead>
                <TableHead className="text-right" data-testid="header-quantity">Quantity</TableHead>
                <TableHead className="text-right w-[120px]" data-testid="header-percentage">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holders.map((holder, index) => {
                const formattedBalance = decimals !== undefined
                  ? formatTokenBalance(holder.balance, decimals, symbol)
                  : formatLargeNumberString(holder.balance);

                return (
                  <TableRow key={holder.address} data-testid={`row-holder-${index}`}>
                    <TableCell className="font-mono text-muted-foreground" data-testid={`text-rank-${index}`}>
                      {index + 1}
                    </TableCell>
                    <TableCell data-testid={`cell-address-${index}`}>
                      <AddressLink
                        address={holder.address}
                        type="address"
                        shorten={true}
                        className="font-mono text-sm"
                        testId={`link-holder-${index}`}
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm" data-testid={`text-balance-${index}`}>
                      {formattedBalance}
                    </TableCell>
                    <TableCell className="text-right font-semibold" data-testid={`text-percentage-${index}`}>
                      {holder.percentage.toFixed(4)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {holders.length >= 20 && (
          <div className="px-6 py-3 border-t bg-muted/30 text-sm text-muted-foreground text-center" data-testid="text-showing-top">
            Showing top {holders.length} holders
          </div>
        )}
      </CardContent>
    </Card>
  );
}
