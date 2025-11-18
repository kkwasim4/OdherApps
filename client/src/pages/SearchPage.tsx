import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Shield, Users, Zap } from "lucide-react";
import { detectAddressType } from "@/utils/addressUtils";

export default function SearchPage() {
  const [searchInput, setSearchInput] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = searchInput.trim();
    
    if (!trimmedInput) return;

    const addressType = detectAddressType(trimmedInput);
    
    if (addressType === "unknown") {
      return;
    }

    setLocation(`/token/${trimmedInput}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* Hero Section with Search */}
          <section className="py-16 text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                OdherApps Explorer
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Analyze blockchain tokens with 100% live on-chain data across 23+ EVM networks and Solana
              </p>
            </div>

            {/* Search Box */}
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Search Token or Contract</CardTitle>
                <CardDescription className="text-center">
                  Enter any token address from Ethereum, BSC, Base, Solana, or other supported chains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter token address (0x... or Solana address)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-1"
                    data-testid="input-search"
                  />
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={!searchInput.trim()}
                    data-testid="button-search"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8">
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-primary">23+</div>
                <div className="text-sm text-muted-foreground">Supported Chains</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Live Data</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-primary">&lt;3s</div>
                <div className="text-sm text-muted-foreground">Analysis Time</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-primary">AI</div>
                <div className="text-sm text-muted-foreground">Powered Insights</div>
              </div>
            </div>
          </section>

          {/* Feature Highlights */}
          <section className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Comprehensive Token Analysis</h2>
              <p className="text-muted-foreground">
                Real-time blockchain data, risk assessment, and AI-powered insights
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Live Market Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Real-time prices, 24h historical charts, market cap, and volume from CoinGecko and DexScreener
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Contract verification, honeypot detection, tax analysis, and owner privilege scanning
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Holder Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Live on-chain holder analysis with whale, large, medium, and small holder categorization
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Token Flow Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Real-time inflow/outflow tracking across 24H, 12H, and 4H periods with net flow calculations
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* How It Works */}
          <section className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground">
                Three simple steps to comprehensive token intelligence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold">Enter Address</h3>
                <p className="text-sm text-muted-foreground">
                  Paste any token contract address from supported chains
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold">Analyze On-Chain</h3>
                <p className="text-sm text-muted-foreground">
                  We fetch 100% live data from blockchain RPC and APIs
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold">Review Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Get comprehensive reports with risk scores and AI summaries
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
