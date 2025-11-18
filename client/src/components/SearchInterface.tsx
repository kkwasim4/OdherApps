import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchInterfaceProps {
  onSearch: (address: string) => void;
  isLoading?: boolean;
  detectedChain?: string;
}

const EXAMPLE_ADDRESSES = [
  { label: "Odher", address: "0xDC003d34ab695457E039585b45BbA214b8da1B8A" },
  { label: "Ethereum", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" },
  { label: "Solana", address: "So11111111111111111111111111111111111111111" },
];

export function SearchInterface({ onSearch, isLoading, detectedChain }: SearchInterfaceProps) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError("Please enter a contract address");
      return;
    }

    if (address.length < 32) {
      setError("Invalid contract address format");
      return;
    }

    setError("");
    onSearch(address.trim());
  };

  const handleExampleClick = (exampleAddress: string) => {
    setAddress(exampleAddress);
    setError("");
    onSearch(exampleAddress);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Powered by On-Chain Intelligence</span>
        </div>
        
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
          Analyze Any Contract in <span className="text-primary">Seconds</span>
        </h1>
        
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Enter any contract address from 23 EVM networks or Solana. Get verified data, DEX liquidity, and risk warnings instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Enter contract address (EVM or Solana)"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError("");
            }}
            className="h-14 pl-12 pr-4 text-base"
            disabled={isLoading}
            data-testid="input-contract-address"
            autoFocus
          />
          {detectedChain && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Badge variant="secondary" className="font-mono text-xs">
                {detectedChain}
              </Badge>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive" data-testid="text-error">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base font-semibold"
          disabled={isLoading}
          data-testid="button-analyze"
        >
          {isLoading ? "Analyzing..." : "Analyze Token"}
        </Button>
      </form>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">Try examples:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLE_ADDRESSES.map((example) => (
            <button
              key={example.address}
              onClick={() => handleExampleClick(example.address)}
              className="px-3 py-1.5 rounded-full text-sm bg-secondary hover-elevate active-elevate-2 transition-colors"
              disabled={isLoading}
              data-testid={`button-example-${example.label}`}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
