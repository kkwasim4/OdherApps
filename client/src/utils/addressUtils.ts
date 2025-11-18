/**
 * Address utility functions for multi-chain support
 */

export type AddressType = "evm" | "solana" | "unknown";

/**
 * Detects the type of blockchain address
 * @param address - The address to detect
 * @returns "evm", "solana", or "unknown"
 */
export function detectAddressType(address: string): AddressType {
  if (!address) return "unknown";

  // EVM address: 0x followed by 40 hex characters
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return "evm";
  }

  // Solana address: 32-44 base58 characters
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return "solana";
  }

  return "unknown";
}

/**
 * Detects if a string is a transaction hash
 * @param hash - The hash to check
 * @returns true if it's a valid tx hash
 */
export function isTxHash(hash: string): boolean {
  if (!hash) return false;

  // EVM tx hash: 0x followed by 64 hex characters
  if (/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return true;
  }

  // Solana tx signature: 88-character base58 string
  if (/^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(hash)) {
    return true;
  }

  return false;
}

/**
 * Shortens an address for display
 * @param address - Full address
 * @param startChars - Characters to show at start (default: 6)
 * @param endChars - Characters to show at end (default: 4)
 * @returns Shortened address like "0x1234...abcd"
 */
export function shortenAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Gets the explorer URL for an address based on chain
 * @param address - The address
 * @param chain - The blockchain name
 * @returns External explorer URL
 */
export function getExplorerUrl(address: string, chain: string): string {
  const lowerChain = chain.toLowerCase();

  // Solana
  if (lowerChain.includes("solana")) {
    return `https://solscan.io/address/${address}`;
  }

  // EVM chains
  const explorerMap: Record<string, string> = {
    ethereum: "https://etherscan.io",
    base: "https://basescan.org",
    bsc: "https://bscscan.com",
    polygon: "https://polygonscan.com",
    optimism: "https://optimistic.etherscan.io",
    arbitrum: "https://arbiscan.io",
    avalanche: "https://snowtrace.io",
    fantom: "https://ftmscan.com",
  };

  const baseUrl = explorerMap[lowerChain] || "https://etherscan.io";
  return `${baseUrl}/address/${address}`;
}
