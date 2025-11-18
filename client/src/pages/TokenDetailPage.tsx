import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { detectAddressType, shortenAddress, getExplorerUrl } from "@/utils/addressUtils";
import { formatTokenBalance } from "@/utils/formatTokenAmount";
import { useToast } from "@/hooks/use-toast";
import { HolderDistribution } from "@/components/HolderDistribution";

export default function TokenDetailPage() {
  const { address } = useParams();
  const { toast } = useToast();
  const addressType = detectAddressType(address || "");

  // Fetch token data
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/token", address],
    enabled: !!address && addressType !== "unknown",
  });

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Token address copied to clipboard",
      });
    }
  };

  if (!address || addressType === "unknown") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Address</CardTitle>
            <CardDescription>The provided address is not a valid token contract</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-4" data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {isLoading ? (
          <Skeleton className="h-12 w-64 mb-4" />
        ) : (
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold" data-testid="text-token-name">
              {data?.name || "Unknown Token"}
            </h1>
            {data?.isVerified && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <code className="bg-muted px-3 py-2 rounded text-sm font-mono" data-testid="text-address-full">
            {address}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            data-testid="button-copy-address"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            data-testid="button-view-explorer"
          >
            <a
              href={getExplorerUrl(address, data?.chain || "ethereum")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </a>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
            <CardDescription>Failed to fetch token information</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Token Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
              <CardDescription>
                {data?.chainType === "evm" ? "ERC-20" : "SPL"} Token on {data?.chain}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Symbol</div>
                  <div className="text-xl font-bold" data-testid="text-symbol">
                    {data?.symbol || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Decimals</div>
                  <div className="text-xl font-bold" data-testid="text-decimals">
                    {data?.decimals ?? "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Supply</div>
                  <div className="text-xl font-bold" data-testid="text-total-supply">
                    {data?.totalSupply && data?.decimals !== undefined
                      ? formatTokenBalance(data.totalSupply, data.decimals, data.symbol, { compact: true })
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Chain</div>
                  <div className="text-lg font-semibold" data-testid="text-chain">
                    {data?.chain || "Unknown"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Contract Address</div>
                  <div className="text-sm font-mono" data-testid="text-contract-short">
                    {shortenAddress(address, 10, 8)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Verification Status</div>
                  <div className="flex items-center gap-2">
                    {data?.isVerified ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Holder Distribution */}
          {data && (
            <HolderDistribution
              holders={[]}
              totalSupply={data.totalSupply}
              decimals={data.decimals}
              symbol={data.symbol}
            />
          )}

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Security Analysis</CardTitle>
              <CardDescription>Contract risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Risk analysis available on main token analysis page
              </div>
            </CardContent>
          </Card>

          {/* Recent Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transfers</CardTitle>
              <CardDescription>Latest token transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Transaction history feature coming soon
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
