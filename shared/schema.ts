import { z } from "zod";

export const chainConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  rpcUrl: z.string(),
  explorerUrl: z.string(),
  nativeCurrency: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
  }),
  type: z.enum(['evm', 'solana']),
});

export type ChainConfig = z.infer<typeof chainConfigSchema>;

export const tokenMetadataSchema = z.object({
  address: z.string(),
  chain: z.string(),
  chainType: z.enum(['evm', 'solana']),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.number().optional(),
  totalSupply: z.string().optional(),
  maxSupply: z.string().optional(),
  circulatingSupply: z.string().optional(),
  isVerified: z.boolean().optional(),
  holderCount: z.number().optional(),
  logoUrl: z.string().optional(),
  price: z.number().optional(),
  priceChange24h: z.number().optional(),
  marketCap: z.number().optional(),
  volume24h: z.number().optional(),
  isSourceVerified: z.boolean().optional(),
  // Enhanced metadata from CoinGecko
  fullyDilutedValuation: z.number().optional(),
  categories: z.array(z.string()).optional(),
  websites: z.array(z.string()).optional(),
  twitter: z.string().optional(),
  telegram: z.string().optional(),
  description: z.string().optional(),
});

export type TokenMetadata = z.infer<typeof tokenMetadataSchema>;

export const liquidityDataSchema = z.object({
  dex: z.string(),
  pair: z.string(),
  liquidityUSD: z.number(),
  volume24h: z.number().optional(),
  poolAddress: z.string().optional(),
});

export type LiquidityData = z.infer<typeof liquidityDataSchema>;

export const riskFactorSchema = z.object({
  name: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  description: z.string(),
});

export type RiskFactor = z.infer<typeof riskFactorSchema>;

export const riskAnalysisSchema = z.object({
  score: z.number().min(1).max(100),
  factors: z.array(riskFactorSchema),
  hasOwnerPrivileges: z.boolean().optional(),
  hasHoneypot: z.boolean().optional(),
  hasMintAuthority: z.boolean().optional(),
  lpOwnershipPercent: z.number().optional(),
  tradingTax: z.number().optional(),
});

export type RiskAnalysis = z.infer<typeof riskAnalysisSchema>;

export const holderDataSchema = z.object({
  address: z.string(),
  balance: z.string(),
  percentage: z.number(),
});

export type HolderData = z.infer<typeof holderDataSchema>;

export const flowPeriodSchema = z.object({
  inflow: z.string(),
  outflow: z.string(),
  netFlow: z.string(),
  inflowUSD: z.number().optional(),
  outflowUSD: z.number().optional(),
  netFlowUSD: z.number().optional(),
  transferCount: z.number(),
  uniqueAddresses: z.number(),
});

export type FlowPeriod = z.infer<typeof flowPeriodSchema>;

export const tokenFlowMetricsSchema = z.object({
  period24h: flowPeriodSchema,
  period12h: flowPeriodSchema,
  period4h: flowPeriodSchema,
  timestamp: z.number(),
});

export type TokenFlowMetrics = z.infer<typeof tokenFlowMetricsSchema>;

export const analysisResultSchema = z.object({
  metadata: tokenMetadataSchema,
  liquidity: z.array(liquidityDataSchema),
  totalLiquidityUSD: z.number(),
  risk: riskAnalysisSchema,
  holders: z.array(holderDataSchema).optional(),
  holderMetadata: z.object({
    totalHolders: z.number().optional(),
    blockRange: z.object({
      from: z.number(),
      to: z.number(),
      scanned: z.number(),
    }).optional(),
    completeness: z.enum(['partial', 'recent']).optional(),
    isLiveData: z.boolean(),
    error: z.string().optional().nullable(),
  }).optional(),
  flowMetrics: tokenFlowMetricsSchema.optional(),
  aiSummary: z.string().optional(),
  timestamp: z.number(),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const addressParamSchema = z.object({
  address: z.string()
    .min(20, "Invalid address length")
    .refine(
      (addr) => evmAddressRegex.test(addr) || solanaAddressRegex.test(addr),
      "Address must be valid EVM (0x + 40 hex chars) or Solana (base58, 32-44 chars) format"
    ),
});

export const analyzeRequestSchema = z.object({
  address: z.string().min(1, "Contract address is required"),
});

export type AddressParam = z.infer<typeof addressParamSchema>;
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
