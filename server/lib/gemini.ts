import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with API key from Replit Secrets
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");
// Use gemini-2.5-flash - the latest fast model (Gemini 1.5 models retired April 2025)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateTokenSummary(tokenData: {
  name?: string;
  symbol?: string;
  chain: string;
  totalSupply?: string;
  riskScore: number;
  totalLiquidity: number;
  hasOwnerPrivileges?: boolean;
  hasMintAuthority?: boolean;
  riskFactors: Array<{ name: string; severity: string; description: string }>;
}): Promise<string> {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_KEY) {
      console.warn("GEMINI_KEY not configured");
      return "AI summary unavailable - API key not configured";
    }

    const prompt = `Analyze this token and provide a concise, clear summary for investors (2-3 sentences):

Token: ${tokenData.name || 'Unknown'} (${tokenData.symbol || 'N/A'})
Blockchain: ${tokenData.chain}
Total Supply: ${tokenData.totalSupply || 'Unknown'}
Risk Score: ${tokenData.riskScore}/100
Total Liquidity: $${tokenData.totalLiquidity.toLocaleString()}
Owner Privileges: ${tokenData.hasOwnerPrivileges ? 'Yes' : 'No'}
Mint Authority: ${tokenData.hasMintAuthority ? 'Yes' : 'No'}
Risk Factors: ${tokenData.riskFactors.map(f => `${f.name} (${f.severity})`).join(', ') || 'None'}

Provide a brief summary that highlights the most important information for someone considering this token. Focus on liquidity health, key risks, and overall assessment. Be direct and professional.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      console.warn("Gemini returned empty response");
      return "AI summary unavailable - empty response";
    }

    return text;
  } catch (error) {
    console.error("Error generating AI summary with Gemini:", error);
    
    // Provide more detailed error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return "AI summary unavailable - invalid API key";
      }
      if (error.message.includes('quota')) {
        return "AI summary unavailable - quota exceeded";
      }
      if (error.message.includes('rate limit')) {
        return "AI summary unavailable - rate limit exceeded";
      }
    }
    
    return "AI summary unavailable";
  }
}
