import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddressLink from "@/components/AddressLink";
import { ArrowRight, ArrowDown, ArrowUp, Repeat } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  type?: "transfer" | "swap" | "mint" | "burn" | "approve" | "other";
  status?: "success" | "failed" | "pending";
  tokenSymbol?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  showAmount?: boolean;
  compact?: boolean;
}

const TX_TYPE_ICONS: Record<string, typeof ArrowRight> = {
  transfer: ArrowRight,
  swap: Repeat,
  mint: ArrowUp,
  burn: ArrowDown,
  approve: ArrowRight,
  other: ArrowRight,
};

const TX_TYPE_COLORS: Record<string, string> = {
  transfer: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  swap: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  mint: "bg-green-500/10 text-green-700 dark:text-green-400",
  burn: "bg-red-500/10 text-red-700 dark:text-red-400",
  approve: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

export function TransactionTable({ 
  transactions, 
  showAmount = true, 
  compact = false 
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  const formatAmount = (value: string, symbol?: string) => {
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return value;
      
      if (numValue === 0) return "0";
      if (numValue < 0.000001) return "< 0.000001";
      if (numValue < 1) return numValue.toFixed(6);
      if (numValue < 1000) return numValue.toFixed(4);
      if (numValue < 1000000) return `${(numValue / 1000).toFixed(2)}K`;
      return `${(numValue / 1000000).toFixed(2)}M`;
    } catch {
      return value;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const shortenHash = (hash: string) => {
    if (hash.length <= 12) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Hash</TableHead>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            {showAmount && <TableHead className="text-right">Amount</TableHead>}
            <TableHead className="w-[100px] text-right">Block</TableHead>
            <TableHead className="w-[140px] text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const Icon = TX_TYPE_ICONS[tx.type || "other"];
            const typeColor = TX_TYPE_COLORS[tx.type || "other"];

            return (
              <TableRow key={tx.hash} data-testid={`row-tx-${tx.hash}`}>
                <TableCell className="font-mono text-xs">
                  <Link href={`/tx/${tx.hash}`}>
                    <a 
                      className="text-primary hover:underline"
                      data-testid={`link-tx-${tx.hash}`}
                    >
                      {compact ? shortenHash(tx.hash) : tx.hash}
                    </a>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={`${typeColor} capitalize`}
                    data-testid={`badge-type-${tx.type || 'other'}`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {tx.type || "other"}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <AddressLink 
                    address={tx.from} 
                    startChars={compact ? 4 : 6}
                    endChars={4}
                    testId={`link-from-${tx.hash}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <AddressLink 
                    address={tx.to} 
                    startChars={compact ? 4 : 6}
                    endChars={4}
                    testId={`link-to-${tx.hash}`}
                  />
                </TableCell>
                {showAmount && (
                  <TableCell className="text-right font-mono text-sm" data-testid={`text-amount-${tx.hash}`}>
                    {formatAmount(tx.value, tx.tokenSymbol)} {tx.tokenSymbol || "ETH"}
                  </TableCell>
                )}
                <TableCell className="text-right text-muted-foreground" data-testid={`text-block-${tx.blockNumber}`}>
                  {tx.blockNumber.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm" data-testid={`text-time-${tx.hash}`}>
                  {getTimeAgo(tx.timestamp)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
