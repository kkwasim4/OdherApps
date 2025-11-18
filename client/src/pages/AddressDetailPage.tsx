import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Copy } from "lucide-react";
import { detectAddressType, shortenAddress } from "@/utils/addressUtils";
import { useToast } from "@/hooks/use-toast";

export default function AddressDetailPage() {
  const { address } = useParams();
  const { toast } = useToast();
  const addressType = detectAddressType(address || "");

  // Fetch address data
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/address", address],
    enabled: !!address && addressType !== "unknown",
  });

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Address copied to clipboard",
      });
    }
  };

  if (!address || addressType === "unknown") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Address</CardTitle>
            <CardDescription>The provided address is not valid</CardDescription>
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
        <h1 className="text-3xl font-bold mb-2">Address Details</h1>
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
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
            <CardDescription>Failed to fetch address information</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                {addressType === "evm" ? "EVM" : "Solana"} Address Information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className="text-2xl font-bold" data-testid="text-balance">
                    {data?.balance || "0"} {addressType === "evm" ? "ETH" : "SOL"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Chain</div>
                  <div className="text-lg font-semibold" data-testid="text-chain">
                    {data?.chain || addressType === "evm" ? "Ethereum" : "Solana"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tokens Owned */}
          <Card>
            <CardHeader>
              <CardTitle>Tokens</CardTitle>
              <CardDescription>Tokens owned by this address</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.tokens && data.tokens.length > 0 ? (
                <div className="space-y-2">
                  {data.tokens.map((token: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                      data-testid={`token-item-${idx}`}
                    >
                      <div>
                        <Link href={`/token/${token.address}`}>
                          <a className="font-semibold hover:underline">{token.name}</a>
                        </Link>
                        <div className="text-sm text-muted-foreground">{token.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{token.balance}</div>
                        <div className="text-sm text-muted-foreground">{token.symbol}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No tokens found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest activity for this address</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.transactions && data.transactions.length > 0 ? (
                <div className="space-y-2">
                  {data.transactions.map((tx: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                      data-testid={`tx-item-${idx}`}
                    >
                      <div className="flex-1">
                        <Link href={`/tx/${tx.hash}`}>
                          <a className="font-mono text-sm hover:underline">
                            {shortenAddress(tx.hash, 10, 8)}
                          </a>
                        </Link>
                        <div className="text-sm text-muted-foreground">{tx.timestamp}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{tx.value}</div>
                        <div className="text-sm text-muted-foreground">{tx.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No transactions found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
