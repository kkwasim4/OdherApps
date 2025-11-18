import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, ExternalLink } from "lucide-react";
import AddressLink from "@/components/AddressLink";
import { Skeleton } from "@/components/ui/skeleton";

export interface DAppActivity {
  rank: number;
  contractAddress: string;
  contractName?: string;
  txnCount: number;
  gasSpent: string;
  gasSpentUSD?: number;
}

interface DAppActivityTableProps {
  activities: DAppActivity[];
  isLoading?: boolean;
  chainType?: string;
  degradedMode?: boolean;
  message?: string;
}

export function DAppActivityTable({ activities, isLoading, chainType, degradedMode, message }: DAppActivityTableProps) {
  const formatGasSpent = (gasETH: string, gasUSD?: number) => {
    const ethValue = parseFloat(gasETH);
    
    if (gasUSD) {
      return `$${gasUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    }
    
    if (ethValue < 0.001) {
      return `${ethValue.toFixed(6)} ETH`;
    }
    
    return `${ethValue.toFixed(4)} ETH`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            DApp Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            DApp Activity
            {degradedMode && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Limited Data
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {message || "No DApp activity data available"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          DApp Activity
          <div className="ml-auto flex items-center gap-2">
            {degradedMode && (
              <Badge variant="secondary" className="text-xs">
                Limited Data
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              Last 10K blocks
            </Badge>
          </div>
        </CardTitle>
        {message && (
          <p className="text-xs text-muted-foreground mt-1">{message}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Txn Count</TableHead>
                <TableHead className="text-right">Gas Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.contractAddress} data-testid={`dapp-${activity.rank}`}>
                  <TableCell className="font-mono text-muted-foreground">
                    {activity.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {activity.contractName ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.contractName}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </div>
                      ) : (
                        <AddressLink 
                          address={activity.contractAddress}
                          type="address"
                          shorten={true}
                          className="font-mono text-sm"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {activity.txnCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatGasSpent(activity.gasSpent, activity.gasSpentUSD)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
