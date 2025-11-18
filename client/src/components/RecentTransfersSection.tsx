import { useQuery } from "@tanstack/react-query";
import { XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionTable, type Transaction } from "@/components/TransactionTable";

interface RecentTransfersSectionProps {
  address: string;
}

export default function RecentTransfersSection({ address }: RecentTransfersSectionProps) {
  const {
    data: transfersData,
    isLoading: transfersLoading,
    error: transfersError,
  } = useQuery<{ transfers: Transaction[]; isMockData?: boolean }>({
    queryKey: ["/api/transfers", address],
    enabled: !!address,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <div>
          <CardTitle>Recent Transfers</CardTitle>
          <CardDescription>Latest token transfer transactions</CardDescription>
        </div>
        {transfersData?.isMockData && (
          <Badge variant="secondary" className="text-xs">
            Mock Data
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {transfersLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : transfersError ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="error-transfers">
            <XCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-semibold">Failed to load transfers</p>
            <p className="text-sm mt-1">
              {transfersError instanceof Error ? transfersError.message : "An error occurred"}
            </p>
          </div>
        ) : (!transfersData || !transfersData.transfers || transfersData.transfers.length === 0) ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="empty-transfers">
            <p>No recent transfers found</p>
          </div>
        ) : (
          <TransactionTable 
            transactions={transfersData.transfers.slice(0, 10)} 
            compact 
            data-testid="table-transfers"
          />
        )}
      </CardContent>
    </Card>
  );
}
