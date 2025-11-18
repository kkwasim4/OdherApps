/**
 * Formats a raw token amount using its decimals to a human-readable string
 * 
 * @param amount - Raw token amount as a string or number
 * @param decimals - Number of decimals for the token (e.g., 18 for most ERC20)
 * @param options - Formatting options
 * @returns Formatted token amount
 * 
 * @example
 * formatTokenAmount("1000000000000000000", 18) // "1"
 * formatTokenAmount("120000000000000000000000000", 18) // "120,000,000"
 */
export function formatTokenAmount(
  amount: string | number | undefined,
  decimals: number | undefined,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
  } = {}
): string {
  if (amount === undefined || amount === null || decimals === undefined || decimals === null) {
    return "N/A";
  }

  try {
    const rawAmount = typeof amount === 'string' ? amount : amount.toString();
    
    const amountBigInt = BigInt(rawAmount);
    const divisor = BigInt(10 ** decimals);
    const wholePart = amountBigInt / divisor;
    const remainder = amountBigInt % divisor;
    
    const wholeNumber = Number(wholePart);
    const fractionalNumber = Number(remainder) / Number(divisor);
    const value = wholeNumber + fractionalNumber;

    if (isNaN(value) || !isFinite(value)) {
      return "N/A";
    }

    if (options.compact && value >= 1_000_000) {
      if (value >= 1_000_000_000_000) {
        return `${(value / 1_000_000_000_000).toFixed(2)}T`;
      } else if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(2)}B`;
      } else if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(2)}M`;
      }
    }

    const maxFractionDigits = options.maximumFractionDigits ?? (value < 1 ? 6 : 2);

    return value.toLocaleString("en-US", {
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
      maximumFractionDigits: maxFractionDigits,
    });
  } catch (error) {
    console.error("Error formatting token amount:", error);
    return "N/A";
  }
}

/**
 * Formats a token balance with optional symbol
 * 
 * @param balance - Raw token balance
 * @param decimals - Token decimals
 * @param symbol - Token symbol (optional)
 * @param compact - Whether to use compact notation (M, B, T) for large numbers
 * @returns Formatted balance with symbol
 * 
 * @example
 * formatTokenBalance("1000000000000000000", 18, "ETH") // "1 ETH"
 * formatTokenBalance("12000000000000000000000000", 18, "ETH", true) // "12.00M ETH"
 */
export function formatTokenBalance(
  balance: string | number | undefined,
  decimals: number | undefined,
  symbol?: string,
  compact: boolean = true
): string {
  const formatted = formatTokenAmount(balance, decimals, {
    minimumFractionDigits: 0,
    compact: compact,
  });

  if (formatted === "N/A") {
    return "N/A";
  }

  return symbol ? `${formatted} ${symbol}` : formatted;
}
