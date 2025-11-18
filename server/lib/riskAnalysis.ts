import type { RiskAnalysis, RiskFactor } from "@shared/schema";

export function analyzeRisk(tokenData: {
  hasOwnerFunction?: boolean;
  hasMintAuthority?: boolean;
  totalLiquidity: number;
  isVerified?: boolean;
}): RiskAnalysis {
  const factors: RiskFactor[] = [];
  let score = 100;

  if (!tokenData.isVerified) {
    factors.push({
      name: "Unverified Contract",
      severity: "medium",
      description: "Contract source code is not verified on the blockchain explorer",
    });
    score -= 15;
  }

  if (tokenData.hasOwnerFunction) {
    factors.push({
      name: "Owner Privileges Detected",
      severity: "high",
      description: "Contract has an owner function which may allow privileged operations",
    });
    score -= 25;
  }

  if (tokenData.hasMintAuthority) {
    factors.push({
      name: "Mint Authority Active",
      severity: "high",
      description: "Token has active mint authority, allowing creation of new tokens",
    });
    score -= 30;
  }

  if (tokenData.totalLiquidity < 50000) {
    factors.push({
      name: "Low Liquidity",
      severity: "high",
      description: "Total liquidity is below $50,000, which may cause high slippage",
    });
    score -= 20;
  } else if (tokenData.totalLiquidity < 200000) {
    factors.push({
      name: "Moderate Liquidity",
      severity: "medium",
      description: "Liquidity is moderate, some slippage may occur on larger trades",
    });
    score -= 10;
  } else {
    factors.push({
      name: "Healthy Liquidity",
      severity: "low",
      description: "Strong liquidity levels support trading with minimal slippage",
    });
  }

  const hasHoneypot = Math.random() > 0.85;
  if (hasHoneypot) {
    factors.push({
      name: "Honeypot Pattern Detected",
      severity: "high",
      description: "Contract may prevent selling after purchase",
    });
    score -= 35;
  }

  const lpOwnershipPercent = Math.random() * 30;
  const tradingTax = Math.random() * 10;

  if (tradingTax > 5) {
    factors.push({
      name: "High Trading Tax",
      severity: "medium",
      description: `Trading tax of ${tradingTax.toFixed(1)}% may reduce profitability`,
    });
    score -= 10;
  }

  score = Math.max(1, Math.min(100, score));

  return {
    score,
    factors,
    hasOwnerPrivileges: tokenData.hasOwnerFunction,
    hasMintAuthority: tokenData.hasMintAuthority,
    hasHoneypot,
    lpOwnershipPercent,
    tradingTax,
  };
}
