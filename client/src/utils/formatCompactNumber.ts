/**
 * Format large numbers into compact notation (K, M, B, T)
 * 
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 * 
 * @example
 * formatCompactNumber(1234) // "1.23K"
 * formatCompactNumber(1234567) // "1.23M"
 * formatCompactNumber(1234567890) // "1.23B"
 */
export function formatCompactNumber(value: number, decimals: number = 2): string {
  if (value === 0) return "0";
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (absValue >= 1e12) {
    return sign + (absValue / 1e12).toFixed(decimals) + "T";
  } else if (absValue >= 1e9) {
    return sign + (absValue / 1e9).toFixed(decimals) + "B";
  } else if (absValue >= 1e6) {
    return sign + (absValue / 1e6).toFixed(decimals) + "M";
  } else if (absValue >= 1e3) {
    return sign + (absValue / 1e3).toFixed(decimals) + "K";
  } else {
    return sign + absValue.toFixed(decimals);
  }
}
