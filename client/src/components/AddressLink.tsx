import { Link } from "wouter";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortenAddress, detectAddressType, isTxHash } from "@/utils/addressUtils";
import { useToast } from "@/hooks/use-toast";

interface AddressLinkProps {
  address: string;
  type?: "address" | "token" | "tx" | "auto";
  shorten?: boolean;
  startChars?: number;
  endChars?: number;
  showCopy?: boolean;
  className?: string;
  testId?: string;
}

export default function AddressLink({
  address,
  type = "auto",
  shorten = true,
  startChars = 6,
  endChars = 4,
  showCopy = false,
  className = "",
  testId,
}: AddressLinkProps) {
  const { toast } = useToast();

  if (!address) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied",
      description: `Address copied to clipboard`,
    });
  };

  // Auto-detect type if not specified
  let linkType = type;
  if (type === "auto") {
    if (isTxHash(address)) {
      linkType = "tx";
    } else {
      // For now, default to "address" since we can't determine contract vs EOA without RPC call
      // Could be enhanced later with a backend lookup
      linkType = "address";
    }
  }

  const displayText = shorten ? shortenAddress(address, startChars, endChars) : address;
  const href = linkType === "tx" ? `/tx/${address}` : linkType === "token" ? `/token/${address}` : `/address/${address}`;

  return (
    <span className="inline-flex items-center gap-2">
      <Link href={href}>
        <a
          className={`font-mono hover:underline hover:text-primary transition-colors ${className}`}
          data-testid={testId}
          title={address}
        >
          {displayText}
        </a>
      </Link>
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleCopy}
          data-testid={`${testId}-copy`}
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}
    </span>
  );
}
