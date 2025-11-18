import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/api/queryClient";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchInterface } from "@/components/SearchInterface";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { StatsGrid } from "@/components/StatsGrid";
import { TokenOverviewCard } from "@/components/TokenOverviewCard";
import { InteractiveChart } from "@/components/InteractiveChart";
import { MetricCard } from "@/components/MetricCard";
import { TokenDetailsPanel } from "@/components/TokenDetailsPanel";
import { LiquidityPanel } from "@/components/LiquidityPanel";
import { RiskAnalysisCard } from "@/components/RiskAnalysisCard";
import { HolderDistribution } from "@/components/HolderDistribution";
import { AISummary } from "@/components/AISummary";
import { ExportButton } from "@/components/ExportButton";
import RecentTransfersSection from "@/components/RecentTransfersSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Copy, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatTokenAmount } from "@/utils/formatTokenAmount";
import AddressLink from "@/components/AddressLink";
import type { AnalysisResult } from "@shared/schema";

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showAISummary, setShowAISummary] = useState(false);
  const aiSummaryRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (address: string) => {
      const res = await apiRequest("POST", "/api/analyze", { address });
      const result: AnalysisResult = await res.json();
      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setShowAISummary(false);
    },
  });

  const handleSearch = (address: string) => {
    analyzeMutation.mutate(address);
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          <section className="py-8">
            <SearchInterface
              onSearch={handleSearch}
              isLoading={analyzeMutation.isPending}
              detectedChain={analysis?.metadata.chain}
            />
          </section>

          {analyzeMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription data-testid="text-error-message">
                {analyzeMutation.error instanceof Error ? analyzeMutation.error.message : "An error occurred. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {analyzeMutation.isPending && (
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

          {analysis && !analyzeMutation.isPending && (
            <section className="space-y-6" data-testid="section-analysis-results">
              {/* Interactive Price Chart - Full Width */}
              <InteractiveChart 
                address={analysis.metadata.address}
                symbol={analysis.metadata.symbol}
                currentPrice={analysis.metadata.price}
                priceChange24h={analysis.metadata.priceChange24h}
              />

              {/* Token Details Section */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left: Quick Stats */}
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
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

                {/* Right: Token Details Panel */}
                <TokenDetailsPanel 
                  metadata={analysis.metadata}
                  onAISummary={analysis.aiSummary ? handleAISummaryClick : undefined}
                  hasAISummary={!!analysis.aiSummary}
                />
              </div>

              {/* Analysis Results Header */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Analysis Results</h2>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive on-chain analysis for {analysis.metadata.symbol || analysis.metadata.name}
                  </p>
                </div>
                <ExportButton analysis={analysis} />
              </div>

              {/* Compact Token Overview */}
              <Card className="bg-accent/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold">
                        {analysis.metadata.symbol?.slice(0, 2).toUpperCase() || '??'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{analysis.metadata.name}</h3>
                        <Badge variant="outline" className="font-mono text-xs">
                          {analysis.metadata.chain.toUpperCase()}
                        </Badge>
                        <Badge 
                          variant={analysis.metadata.chainType === 'evm' ? "default" : "secondary"}
                          className="font-mono text-xs"
                        >
                          {analysis.metadata.chainType === 'evm' ? 'EVM' : 'Solana'}
                        </Badge>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {analysis.metadata.address}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6 ml-auto">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase mb-1">Total Supply</div>
                        <div className="text-sm font-semibold font-mono">
                          {analysis.metadata.totalSupply 
                            ? formatTokenAmount(analysis.metadata.totalSupply, analysis.metadata.decimals || 18, { compact: true })
                            : "N/A"
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase mb-1">Circulating</div>
                        <div className="text-sm font-semibold font-mono">
                          {analysis.metadata.circulatingSupply 
                            ? formatTokenAmount(analysis.metadata.circulatingSupply, analysis.metadata.decimals || 18, { compact: true })
                            : "N/A"
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase mb-1">Decimals</div>
                        <div className="text-sm font-semibold font-mono">
                          {analysis.metadata.decimals ?? "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase mb-1">Holders</div>
                        <div className="text-sm font-semibold font-mono">
                          {analysis.metadata.holderCount ? analysis.metadata.holderCount.toLocaleString() : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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

              {/* Holder Distribution */}
              {analysis.holders && analysis.holders.length > 0 && (
                <HolderDistribution 
                  holders={analysis.holders} 
                  decimals={analysis.metadata.decimals}
                  symbol={analysis.metadata.symbol}
                />
              )}

              {/* Recent Transfers Section */}
              <RecentTransfersSection address={analysis.metadata.address} />
            </section>
          )}

          {!analysis && !analyzeMutation.isPending && (
            <>
              <section id="features">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    Complete On-Chain Intelligence
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Everything you need to analyze tokens across multiple blockchains in one platform
                  </p>
                </div>
                <FeatureHighlights />
              </section>

              <section>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    Platform Coverage
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Comprehensive analysis across the entire blockchain ecosystem
                  </p>
                </div>
                <StatsGrid />
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
