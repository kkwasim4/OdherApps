import { CheckCircle2, XCircle, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatTokenAmount } from "@/utils/formatTokenAmount";
import AddressLink from "@/components/AddressLink";
import type { TokenMetadata } from "@shared/schema";

interface TokenOverviewCardProps {
  metadata: TokenMetadata;
}

const CHAIN_COLORS: Record<string, string> = {
  ethereum: "bg-blue-500",
  bsc: "bg-yellow-500",
  polygon: "bg-purple-500",
  base: "bg-blue-600",
  optimism: "bg-red-500",
  solana: "bg-green-500",
};

export function TokenOverviewCard({ metadata }: TokenOverviewCardProps) {
  const { toast } = useToast();

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const truncateAddress = (addr: string) => {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getExplorerUrl = () => {
    const explorers: Record<string, string> = {
      ethereum: `https://etherscan.io/address/${metadata.address}`,
      bsc: `https://bscscan.com/address/${metadata.address}`,
      polygon: `https://polygonscan.com/address/${metadata.address}`,
      base: `https://basescan.org/address/${metadata.address}`,
      optimism: `https://optimistic.etherscan.io/address/${metadata.address}`,
      solana: `https://solscan.io/account/${metadata.address}`,
    };
    return explorers[metadata.chain.toLowerCase()] || "#";
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${CHAIN_COLORS[metadata.chain.toLowerCase()] || 'bg-gray-500'} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm uppercase">
                {metadata.chain.slice(0, 2)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold" data-testid="text-token-name">
                {metadata.name || "Unknown Token"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {metadata.symbol || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={metadata.isVerified ? "default" : "secondary"} className="gap-1.5">
              {metadata.isVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  Unverified
                </>
              )}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {metadata.chainType === 'evm' ? 'EVM' : 'Solana'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 font-mono text-sm">
          <div className="flex-1 truncate" data-testid="text-contract-address">
            <AddressLink 
              address={metadata.address} 
              type="token"
              shorten={false}
              testId="link-contract-address"
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleCopy(metadata.address, "Contract address")}
            data-testid="button-copy-address"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            asChild
            data-testid="button-view-explorer"
          >
            <a href={getExplorerUrl()} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Supply
            </p>
            <p className="text-lg font-semibold font-mono" data-testid="text-total-supply">
              {metadata.totalSupply && metadata.decimals !== undefined
                ? `${formatTokenAmount(metadata.totalSupply, metadata.decimals, { compact: true })}${metadata.symbol ? ` ${metadata.symbol}` : ''}`
                : "N/A"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Circulating Supply
            </p>
            <p className="text-lg font-semibold font-mono" data-testid="text-circulating-supply">
              {metadata.circulatingSupply && metadata.decimals !== undefined
                ? `${formatTokenAmount(metadata.circulatingSupply, metadata.decimals, { compact: true })}${metadata.symbol ? ` ${metadata.symbol}` : ''}`
                : "N/A"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Decimals
            </p>
            <p className="text-lg font-semibold font-mono" data-testid="text-decimals">
              {metadata.decimals ?? "N/A"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Holders
            </p>
            <p className="text-lg font-semibold font-mono" data-testid="text-holders">
              {metadata.holderCount ? metadata.holderCount.toLocaleString() : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
