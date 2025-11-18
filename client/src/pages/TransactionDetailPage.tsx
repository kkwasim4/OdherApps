import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, ExternalLink, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { isTxHash, shortenAddress } from "@/utils/addressUtils";
import { useToast } from "@/hooks/use-toast";

export default function TransactionDetailPage() {
  const { hash } = useParams();
  const { toast } = useToast();
  const isValid = isTxHash(hash || "");

  // Fetch transaction data
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/tx", hash],
    enabled: !!hash && isValid,
  });

  const handleCopy = () => {
    if (hash) {
      navigator.clipboard.writeText(hash);
      toast({
        title: "Transaction Hash Copied",
        description: "TX hash copied to clipboard",
      });
    }
  };

  if (!hash || !isValid) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Transaction Hash</CardTitle>
            <CardDescription>The provided transaction hash is not valid</CardDescription>
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
        <h1 className="text-3xl font-bold mb-4">Transaction Details</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <code className="bg-muted px-3 py-2 rounded text-sm font-mono" data-testid="text-tx-hash">
            {hash}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            data-testid="button-copy-hash"
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
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
            <CardDescription>Failed to fetch transaction information</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Transaction Status
                {data?.status === "success" ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Block Number</div>
                  <div className="text-lg font-bold" data-testid="text-block-number">
                    {data?.blockNumber || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Timestamp</div>
                  <div className="text-lg font-semibold" data-testid="text-timestamp">
                    {data?.timestamp || "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* From/To */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">From</div>
                  <Link href={`/address/${data?.from || ""}`}>
                    <a className="font-mono text-sm hover:underline" data-testid="link-from">
                      {data?.from ? shortenAddress(data.from, 16, 12) : "N/A"}
                    </a>
                  </Link>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">To</div>
                  <Link href={`/address/${data?.to || ""}`}>
                    <a className="font-mono text-sm hover:underline" data-testid="link-to">
                      {data?.to ? shortenAddress(data.to, 16, 12) : "N/A"}
                    </a>
                  </Link>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Value</div>
                    <div className="text-lg font-bold" data-testid="text-value">
                      {data?.value || "0"} {data?.chain?.includes("Solana") ? "SOL" : "ETH"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Gas Used</div>
                    <div className="text-lg font-semibold" data-testid="text-gas-used">
                      {data?.gasUsed || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Gas Price</div>
                    <div className="text-lg font-semibold" data-testid="text-gas-price">
                      {data?.gasPrice || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Nonce</div>
                    <div className="text-lg font-semibold" data-testid="text-nonce">
                      {data?.nonce ?? "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Event Logs</CardTitle>
              <CardDescription>Decoded transaction events</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.logs && data.logs.length > 0 ? (
                <div className="space-y-3">
                  {data.logs.map((log: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 border rounded-lg bg-muted/30"
                      data-testid={`log-item-${idx}`}
                    >
                      <div className="font-semibold mb-2">{log.event || "Unknown Event"}</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {log.args && Object.entries(log.args).map(([key, value]: [string, any]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No event logs available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
