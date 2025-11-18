/**
 * ENHANCED AI ON-CHAIN SUMMARIZER (PROFESSIONAL ENTERPRISE VERSION)
 * 
 * Uses Google Gemini AI 2.5 Flash to provide deep on-chain intelligence.
 * Analyzes and explains:
 * - Token purpose and utility
 * - Contract risk assessment
 * - Owner distribution and centralization
 * - Anomaly detection (minting abuse, suspicious patterns, tax tokens, proxy updates)
 * 
 * All analysis based on real blockchain data with graceful fallback handling.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface EnhancedTokenData {
  // Basic Info
  name?: string;
  symbol?: string;
  chain: string;
  totalSupply?: string;
  circulatingSupply?: string;
  decimals?: number;

  // Market Data
  price?: number | null;
  priceChange24h?: number | null;
  marketCap?: number | null;
  volume24h?: number | null;
  totalLiquidity: number;

  // Risk Factors
  riskScore: number;
  hasOwnerPrivileges?: boolean;
  hasMintAuthority?: boolean;
  hasUnlimitedMint?: boolean;
  isProxy?: boolean;
  isVerified?: boolean;
  riskFactors: Array<{ name: string; severity: string; description: string }>;

  // Holder Analysis
  topHolderPercentage?: number;
  top10HolderPercentage?: number;
  holderCount?: number;

  // Transaction Patterns
  recentTransactionCount?: number;
  hasLargeRecentMints?: boolean;
  hasSuspiciousTransfers?: boolean;
}

/**
 * Build comprehensive analysis prompt for Gemini AI
 * Includes all relevant on-chain data for deep insights
 */
function buildEnhancedPrompt(data: EnhancedTokenData): string {
  // Format numbers for readability
  const formatNumber = (num?: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const formatCurrency = (num?: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    return `$${formatNumber(num)}`;
  };

  // Build risk assessment section
  const criticalRisks = data.riskFactors.filter(f => f.severity === 'high');
  const mediumRisks = data.riskFactors.filter(f => f.severity === 'medium');
  
  const riskSummary = `
Risk Score: ${data.riskScore}/100 (${data.riskScore >= 70 ? 'Low Risk' : data.riskScore >= 40 ? 'Medium Risk' : 'High Risk'})
Critical Risks (${criticalRisks.length}): ${criticalRisks.map(r => r.name).join(', ') || 'None'}
Medium Risks (${mediumRisks.length}): ${mediumRisks.map(r => r.name).join(', ') || 'None'}
`.trim();

  // Build anomaly detection section
  const anomalies: string[] = [];
  if (data.hasUnlimitedMint) {
    anomalies.push('CRITICAL: Unlimited minting detected - supply can be inflated indefinitely');
  }
  if (data.isProxy) {
    anomalies.push('WARNING: Upgradeable proxy - contract logic can be changed');
  }
  if (data.topHolderPercentage && data.topHolderPercentage > 20) {
    anomalies.push(`ALERT: Single holder owns ${data.topHolderPercentage.toFixed(1)}% - extreme dump risk`);
  }
  if (data.totalLiquidity < 10000) {
    anomalies.push('CRITICAL: Extremely low liquidity - rug pull risk');
  }

  const prompt = `You are an expert blockchain analyst. Provide a professional, concise analysis of this token for investors.

TOKEN OVERVIEW:
Name: ${data.name || 'Unknown'} (${data.symbol || 'N/A'})
Blockchain: ${data.chain}
Contract Verified: ${data.isVerified ? 'Yes ✓' : 'No ✗'}

SUPPLY & CIRCULATION:
Total Supply: ${data.totalSupply ? formatNumber(parseFloat(data.totalSupply) / Math.pow(10, data.decimals || 18)) : 'N/A'}
Circulating Supply: ${data.circulatingSupply ? formatNumber(parseFloat(data.circulatingSupply) / Math.pow(10, data.decimals || 18)) : 'N/A'}
Decimals: ${data.decimals ?? 'N/A'}

MARKET DATA:
Price: ${formatCurrency(data.price)}
24h Change: ${data.priceChange24h ? `${data.priceChange24h > 0 ? '+' : ''}${data.priceChange24h.toFixed(2)}%` : 'N/A'}
Market Cap: ${formatCurrency(data.marketCap)}
24h Volume: ${formatCurrency(data.volume24h)}
Total Liquidity: ${formatCurrency(data.totalLiquidity)}

SECURITY ANALYSIS:
${riskSummary}
Owner Privileges: ${data.hasOwnerPrivileges ? 'Yes ⚠️' : 'No ✓'}
Mint Authority: ${data.hasMintAuthority ? (data.hasUnlimitedMint ? 'Unlimited ⚠️' : 'Capped ✓') : 'None ✓'}
Upgradeable: ${data.isProxy ? 'Yes ⚠️' : 'No ✓'}

HOLDER DISTRIBUTION:
Top Holder: ${data.topHolderPercentage ? `${data.topHolderPercentage.toFixed(1)}%` : 'N/A'}
Top 10 Holders: ${data.top10HolderPercentage ? `${data.top10HolderPercentage.toFixed(1)}%` : 'N/A'}
Total Holders: ${data.holderCount ? formatNumber(data.holderCount) : 'N/A'}

${anomalies.length > 0 ? `\nDETECTED ANOMALIES:\n${anomalies.join('\n')}` : ''}

CRITICAL RISK FACTORS:
${criticalRisks.map(r => `• ${r.name}: ${r.description}`).join('\n') || 'None identified'}

Provide a 3-4 sentence professional summary that:
1. States the token's purpose or utility (if determinable from data)
2. Assesses overall investment risk based on the data above
3. Highlights the most critical concern for investors
4. Provides an actionable recommendation (hold/trade with caution/avoid)

Be direct, factual, and professional. Focus on what matters most to investors.`;

  return prompt;
}

/**
 * ENHANCED AI TOKEN SUMMARY GENERATOR
 * 
 * Generates comprehensive, professional analysis using real blockchain data.
 * Includes anomaly detection and pattern recognition.
 * 
 * @param tokenData - Complete token analysis data from blockchain
 * @returns AI-generated summary or graceful fallback message
 */
export async function generateEnhancedSummary(
  tokenData: EnhancedTokenData
): Promise<string> {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_KEY || process.env.GEMINI_KEY.length === 0) {
      console.warn("GEMINI_KEY not configured - AI summary unavailable");
      return "AI summary unavailable - API key not configured. Configure GEMINI_KEY in Replit Secrets to enable AI analysis.";
    }

    // Build comprehensive prompt with all data
    const prompt = buildEnhancedPrompt(tokenData);

    // Generate AI analysis
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      console.warn("Gemini returned empty response");
      return "AI summary unavailable at the moment. Please try again later.";
    }

    return text.trim();
  } catch (error) {
    console.error("Enhanced AI summary generation failed:", error);

    // Provide detailed error messages for debugging
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return "AI summary unavailable - invalid API key. Please configure a valid GEMINI_KEY in Replit Secrets.";
      }
      if (error.message.includes('quota')) {
        return "AI summary unavailable - API quota exceeded. Please try again later.";
      }
      if (error.message.includes('rate limit')) {
        return "AI summary unavailable - rate limit exceeded. Please try again in a few minutes.";
      }
    }

    // Generic fallback
    return "AI summary unavailable at the moment. The system encountered an error processing the analysis.";
  }
}

/**
 * Generate quick risk assessment without AI
 * Used as fallback when AI is unavailable
 */
export function generateQuickRiskAssessment(data: EnhancedTokenData): string {
  const criticalRisks = data.riskFactors.filter(f => f.severity === 'high');
  const riskLevel = data.riskScore >= 70 ? 'LOW' : data.riskScore >= 40 ? 'MEDIUM' : 'HIGH';

  let assessment = `${data.name || 'Token'} (${data.symbol || 'UNKNOWN'}) - Risk Level: ${riskLevel}\n\n`;

  if (criticalRisks.length > 0) {
    assessment += `Critical Concerns:\n`;
    criticalRisks.forEach(risk => {
      assessment += `• ${risk.name}\n`;
    });
  } else {
    assessment += 'No critical risks identified.\n';
  }

  assessment += `\nLiquidity: $${data.totalLiquidity.toLocaleString()}`;
  
  if (data.topHolderPercentage && data.topHolderPercentage > 20) {
    assessment += `\n⚠️ Warning: Single holder owns ${data.topHolderPercentage.toFixed(1)}% of supply`;
  }

  return assessment;
}
