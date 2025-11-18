import { useState, useRef, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/api/queryClient";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TokenOverviewCard } from "@/components/TokenOverviewCard";
import { PriceChart } from "@/components/PriceChart";
import { MetricCard } from "@/components/MetricCard";
import { TokenDetailsPanel } from "@/components/TokenDetailsPanel";
import { LiquidityPanel } from "@/components/LiquidityPanel";
import { RiskAnalysisCard } from "@/components/RiskAnalysisCard";
import { HolderTable } from "@/components/HolderTable";
import { AISummary } from "@/components/AISummary";
import { ExportButton } from "@/components/ExportButton";
import RecentTransfersSection from "@/components/RecentTransfersSection";
import { DAppActivityTable, type DAppActivity } from "@/components/DAppActivityTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Copy, ExternalLink, CheckCircle2, XCircle, Search, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatTokenAmount } from "@/utils/formatTokenAmount";
import { detectAddressType } from "@/utils/addressUtils";
import type { AnalysisResult } from "@shared/schema";

export default function TokenResultsPage() {
  const { address } = useParams<{ address: string }>();
  const [, setLocation] = useLocation();
  const [showAISummary, setShowAISummary] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const aiSummaryRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: analysis, isLoading, error, refetch } = useQuery<AnalysisResult>({
    queryKey: ["/api/analyze", address],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/analyze", { address });
      const result: AnalysisResult = await res.json();
      return result;
    },
    enabled: !!address,
    retry: 1,
  });

  // DApp Activity query
  const { data: dappActivity, isLoading: dappLoading } = useQuery<{
    activities: DAppActivity[];
    totalTxns: number;
    isMockData?: boolean;
    degradedMode?: boolean;
    rateLimited?: boolean;
    message?: string;
  }>({
    queryKey: ["/api/dapp-activity", address],
    enabled: !!address && !!analysis && analysis.metadata.chainType === 'evm',
    retry: 1,
  });

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = searchInput.trim();
    
    if (!trimmedInput) return;

    const addressType = detectAddressType(trimmedInput);
    
    if (addressType === "unknown") {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid token contract address",
        variant: "destructive",
      });
      return;
    }

    setLocation(`/token/${trimmedInput}`);
    setSearchInput("");
  };

  const handleAISummaryClick = () => {
    setShowAISummary(true);
    setTimeout(() => {
      aiSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const formatNumber = (value: number | undefined, decimals: number = 2): string => {
    if (value === undefined || value === null) return 'N/A';
    
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else if (value < 0.01) {
      return `$${value.toFixed(6)}`;
    }
    
    return `$${value.toFixed(decimals)}`;
  };

  useEffect(() => {
    if (address) {
      setShowAISummary(false);
    }
  }, [address]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Search Bar + Back Button */}
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline" size="icon" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <form onSubmit={handleNewSearch} className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="Search another token address..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
                data-testid="input-search-results"
              />
              <Button 
                type="submit" 
                disabled={!searchInput.trim()}
                data-testid="button-search-results"
              >
                <Search className="h-4 w-4 mr-2" />
                Analyze
              </Button>
            </form>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription data-testid="text-error-message">
                {error instanceof Error ? error.message : "An error occurred while analyzing the token. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <section className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <Skeleton className="h-48" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Skeleton className="h-48" />
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {analysis && !isLoading && (
            <section className="space-y-6" data-testid="section-analysis-results">
              {/* Top Section: Token Info + Price Chart + Token Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Token Info + Metric Cards */}
                <Card className="bg-muted/30">
                  <CardContent className="p-6">
                    {/* Token Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                        {analysis.metadata.symbol?.slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold" data-testid="text-token-name">
                            {analysis.metadata.name || "Unknown Token"}
                          </h3>
                          <Badge 
                            variant={analysis.metadata.isVerified ? "default" : "secondary"} 
                            className="gap-1"
                            data-testid="badge-verification"
                          >
                            {analysis.metadata.isVerified ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Verified
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Unverified
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="font-mono">
                            {analysis.metadata.symbol || "UNKNOWN"}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-xs">
                            {analysis.metadata.chainType === 'evm' ? 'EVM' : 'Solana'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Contract Address */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 font-mono text-xs mb-6">
                      <div className="flex-1 truncate" data-testid="text-contract-address">
                        {analysis.metadata.address.slice(0, 8)}...{analysis.metadata.address.slice(-6)}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleCopy(analysis.metadata.address, "Contract address")}
                        data-testid="button-copy-address"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        asChild
                        data-testid="button-explorer"
                      >
                        <a 
                          href={`https://etherscan.io/address/${analysis.metadata.address}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <MetricCard 
                        label="Price" 
                        value={formatNumber(analysis.metadata.price, 6)}
                        subtitle={analysis.metadata.priceChange24h !== undefined 
                          ? `${analysis.metadata.priceChange24h >= 0 ? '+' : ''}${analysis.metadata.priceChange24h.toFixed(2)}% (24h)` 
                          : undefined
                        }
                        testId="metric-price"
                      />
                      <MetricCard 
                        label="Market Cap" 
                        value={formatNumber(analysis.metadata.marketCap)}
                        testId="metric-market-cap"
                      />
                      <MetricCard 
                        label="24h Volume" 
                        value={formatNumber(analysis.metadata.volume24h)}
                        testId="metric-24h-volume"
                      />
                      <MetricCard 
                        label="Total Supply" 
                        value={analysis.metadata.totalSupply 
                          ? formatTokenAmount(analysis.metadata.totalSupply, analysis.metadata.decimals || 18, { compact: true })
                          : "N/A"
                        }
                        subtitle={analysis.metadata.symbol}
                        testId="metric-total-supply"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Center: Token Details + AI Summary */}
                <TokenDetailsPanel 
                  metadata={analysis.metadata}
                  onAISummary={analysis.aiSummary ? handleAISummaryClick : undefined}
                  hasAISummary={!!analysis.aiSummary}
                />

                {/* Right: Price Chart */}
                <PriceChart 
                  address={analysis.metadata.address}
                  symbol={analysis.metadata.symbol}
                  currentPrice={analysis.metadata.price}
                  priceChange24h={analysis.metadata.priceChange24h}
                />
              </div>

              {/* Liquidity + Risk Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LiquidityPanel
                  liquidity={analysis.liquidity}
                  totalLiquidityUSD={analysis.totalLiquidityUSD}
                />
                <RiskAnalysisCard risk={analysis.risk} />
              </div>

              {/* AI Summary (if shown) */}
              {showAISummary && analysis.aiSummary && (
                <div ref={aiSummaryRef}>
                  <AISummary summary={analysis.aiSummary} />
                </div>
              )}

              {/* Bottom Section: Token Holders + DApp Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Token Holders Table */}
                <HolderTable 
                  holders={analysis.holders || []} 
                  decimals={analysis.metadata.decimals}
                  symbol={analysis.metadata.symbol}
                  totalHolders={analysis.holderMetadata?.totalHolders}
                  isLiveData={analysis.holderMetadata?.isLiveData}
                  error={analysis.holderMetadata?.error}
                />
                
                {/* Right Column: DApp Activity (EVM only) */}
                {analysis.metadata.chainType === 'evm' && (
                  <DAppActivityTable
                    activities={dappActivity?.activities || []}
                    isLoading={dappLoading}
                    chainType={analysis.metadata.chainType}
                    degradedMode={dappActivity?.degradedMode}
                    message={dappActivity?.message}
                  />
                )}
              </div>

              {/* Recent Transfers Section - Full Width */}
              <RecentTransfersSection address={analysis.metadata.address} />
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
