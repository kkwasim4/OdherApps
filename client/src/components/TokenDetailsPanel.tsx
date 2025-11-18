import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ExternalLink } from "lucide-react";
import { FaTwitter, FaTelegram } from "react-icons/fa";
import { formatTokenAmount } from "@/utils/formatTokenAmount";
import { formatCompactNumber } from "@/utils/formatCompactNumber";
import AddressLink from "@/components/AddressLink";
import type { TokenMetadata } from "@shared/schema";

interface TokenDetailsPanelProps {
  metadata: TokenMetadata;
  onAISummary?: () => void;
  hasAISummary?: boolean;
}

export function TokenDetailsPanel({ metadata, onAISummary, hasAISummary }: TokenDetailsPanelProps) {
  const DetailRow = ({ label, value, testId }: { label: string; value: string; testId?: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-muted last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold font-mono" data-testid={testId}>{value}</span>
    </div>
  );

  const DetailRowWithLink = ({ label, children, testId }: { label: string; children: React.ReactNode; testId?: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-muted last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div data-testid={testId}>{children}</div>
    </div>
  );

  const DetailRowFullWidth = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="py-2 border-b border-muted last:border-0">
      <span className="text-sm text-muted-foreground block mb-2">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Token Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <DetailRow 
            label="Name" 
            value={metadata.name || "Unknown"} 
            testId="text-detail-name"
          />
          <DetailRow 
            label="Symbol" 
            value={metadata.symbol || "N/A"} 
            testId="text-detail-symbol"
          />
          
          {/* Price & Market Data */}
          {metadata.price !== undefined && (
            <DetailRow 
              label="Price" 
              value={`$${formatCompactNumber(metadata.price)}`}
              testId="text-detail-price"
            />
          )}
          {metadata.fullyDilutedValuation !== undefined && (
            <DetailRow 
              label="FDV" 
              value={`$${formatCompactNumber(metadata.fullyDilutedValuation)}`}
              testId="text-detail-fdv"
            />
          )}
          {metadata.marketCap !== undefined && (
            <DetailRow 
              label="Market Cap" 
              value={`$${formatCompactNumber(metadata.marketCap)}`}
              testId="text-detail-marketcap"
            />
          )}
          
          {/* Supply Data */}
          {metadata.circulatingSupply && metadata.decimals !== undefined && (
            <DetailRow 
              label="Circulating" 
              value={formatTokenAmount(metadata.circulatingSupply, metadata.decimals, { compact: true })}
              testId="text-detail-circulating"
            />
          )}
          <DetailRow 
            label="Total Supply" 
            value={metadata.totalSupply && metadata.decimals !== undefined
              ? formatTokenAmount(metadata.totalSupply, metadata.decimals, { compact: true })
              : "N/A"
            } 
            testId="text-detail-total-supply"
          />
          {metadata.holderCount !== undefined && (
            <DetailRow 
              label="Holders" 
              value={formatCompactNumber(metadata.holderCount)}
              testId="text-detail-holders"
            />
          )}
          
          {/* Logo */}
          {metadata.logoUrl && (
            <DetailRowWithLink label="Logo" testId="text-detail-logo">
              <img src={metadata.logoUrl} alt={metadata.symbol || "Token"} className="w-8 h-8 rounded-full" />
            </DetailRowWithLink>
          )}
          
          <DetailRow 
            label="Decimals" 
            value={metadata.decimals?.toString() || "N/A"} 
            testId="text-detail-decimals"
          />
          
          <DetailRowWithLink 
            label="Contract" 
            testId="text-detail-contract"
          >
            <AddressLink 
              address={metadata.address}
              type="address"
              shorten={true}
              className="text-sm font-semibold"
            />
          </DetailRowWithLink>

          {/* Categories */}
          {metadata.categories && metadata.categories.length > 0 && (
            <DetailRowFullWidth label="Categories">
              <div className="flex flex-wrap gap-1">
                {metadata.categories.map((category, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs" data-testid={`badge-category-${idx}`}>
                    {category}
                  </Badge>
                ))}
              </div>
            </DetailRowFullWidth>
          )}

          {/* Websites */}
          {metadata.websites && metadata.websites.length > 0 && (
            <DetailRowFullWidth label="Websites">
              <div className="space-y-1">
                {metadata.websites.slice(0, 3).map((website, idx) => (
                  <a
                    key={idx}
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    data-testid={`link-website-${idx}`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate">{website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                  </a>
                ))}
              </div>
            </DetailRowFullWidth>
          )}

          {/* Social Links */}
          {(metadata.twitter || metadata.telegram) && (
            <DetailRowFullWidth label="Social">
              <div className="flex gap-2">
                {metadata.twitter && (
                  <a
                    href={`https://twitter.com/${metadata.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    data-testid="link-twitter"
                  >
                    <FaTwitter className="w-4 h-4" />
                    <span>@{metadata.twitter}</span>
                  </a>
                )}
                {metadata.telegram && (
                  <a
                    href={`https://t.me/${metadata.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    data-testid="link-telegram"
                  >
                    <FaTelegram className="w-4 h-4" />
                    <span>{metadata.telegram}</span>
                  </a>
                )}
              </div>
            </DetailRowFullWidth>
          )}
        </CardContent>
      </Card>

      {onAISummary && (
        <Button 
          onClick={onAISummary} 
          className="w-full gap-2"
          variant="outline"
          data-testid="button-ai-summary"
        >
          <Sparkles className="w-4 h-4" />
          {hasAISummary ? 'View AI Summary' : 'Generate AI Summary'}
        </Button>
      )}
    </div>
  );
}
