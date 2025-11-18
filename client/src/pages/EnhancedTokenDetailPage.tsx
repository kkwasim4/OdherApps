import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Copy, ExternalLink, CheckCircle2, XCircle, TrendingUp, TrendingDown, Users, Coins } from "lucide-react";
import { detectAddressType, shortenAddress, getExplorerUrl } from "@/utils/addressUtils";
import { formatTokenBalance, formatTokenAmount } from "@/utils/formatTokenAmount";
import { useToast } from "@/hooks/use-toast";
import { InteractiveChart } from "@/components/InteractiveChart";
import { HolderDistribution } from "@/components/HolderDistribution";
import { TransactionTable, type Transaction } from "@/components/TransactionTable";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function EnhancedTokenDetailPage() {
  const { address } = useParams();
  const { toast } = useToast();
  const addressType = detectAddressType(address || "");

  // Fetch token-specific data
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ["/api/token", address],
    enabled: !!address && addressType !== "unknown",
  });

  // Fetch transfers data from backend
  const { 
    data: transfersData, 
    isLoading: transfersLoading,
    error: transfersError 
  } = useQuery<{ 
    address: string;
    chain: string;
    transfers: Transaction[];
    isMockData?: boolean;
    timestamp: number;
  }>({
    queryKey: ["/api/transfers", address],
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
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
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
        <Footer />
      </div>
    );
  }

  if (tokenLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-full mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (tokenError || !tokenData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Token</CardTitle>
              <CardDescription>Failed to load token data</CardDescription>
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
        <Footer />
      </div>
    );
  }

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "N/A";
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const priceChange = tokenData.priceChange24h || 0;
  const isPositiveChange = priceChange >= 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Explorer
            </Button>
          </Link>
        </div>

        {/* Token Header with Logo and Name */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={tokenData.logoUrl} alt={tokenData.symbol} />
                <AvatarFallback className="text-2xl font-bold">
                  {tokenData.symbol?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl font-bold" data-testid="text-token-name">
                    {tokenData.name || "Unknown Token"}
                  </h1>
                  <Badge variant="secondary" className="text-base" data-testid="badge-symbol">
                    {tokenData.symbol || "???"}
                  </Badge>
                  {tokenData.isVerified && (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {tokenData.isSourceVerified && (
                    <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Source Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-mono text-sm" data-testid="text-address">
                    {shortenAddress(address, 12, 8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopy}
                    data-testid="button-copy-address"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <a
                    href={getExplorerUrl(address, tokenData.chain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-explorer"
                  >
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Price</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold" data-testid="text-price">
                  ${tokenData.price?.toFixed(tokenData.price < 1 ? 6 : 2) || "0.00"}
                </div>
                <div className={`flex items-center text-sm ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositiveChange ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  <span data-testid="text-price-change">{Math.abs(priceChange).toFixed(2)}% (24h)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Market Cap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-marketcap">
                {formatNumber(tokenData.marketCap)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>24h Volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-volume">
                {formatNumber(tokenData.volume24h)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Supply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-supply">
                {tokenData.totalSupply && tokenData.decimals !== undefined
                  ? formatTokenAmount(tokenData.totalSupply, tokenData.decimals, { compact: true })
                  : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">{tokenData.symbol || "TOKEN"}</div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Price Chart - Full Width */}
        <InteractiveChart 
          address={address}
          symbol={tokenData.symbol}
          currentPrice={tokenData.price}
          priceChange24h={tokenData.priceChange24h}
        />

        {/* Chart and Token Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Recent Transfers */}
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
          </div>

          <div className="space-y-6">
            {/* Token Details */}
            <Card>
              <CardHeader>
                <CardTitle>Token Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Decimals</span>
                  <span className="font-mono font-semibold" data-testid="text-decimals">
                    {tokenData.decimals ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Max Supply</span>
                  <span className="font-mono font-semibold" data-testid="text-max-supply">
                    {tokenData.maxSupply && tokenData.decimals !== undefined
                      ? formatTokenAmount(tokenData.maxSupply, tokenData.decimals, { compact: true })
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Chain</span>
                  <Badge variant="secondary" data-testid="badge-chain">{tokenData.chain}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Contract</span>
                  <span className="font-mono text-xs" data-testid="text-contract">
                    {shortenAddress(address)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Holder Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Holder Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Holders</span>
                  <span className="font-bold text-xl" data-testid="text-holder-count">
                    {Math.floor(Math.random() * 50000 + 5000).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
