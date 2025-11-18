import NodeCache from "node-cache";

const metadataCache = new NodeCache({ stdTTL: 21600 });
const liquidityCache = new NodeCache({ stdTTL: 300 });
const riskCache = new NodeCache({ stdTTL: 1800 });
const transfersCache = new NodeCache({ stdTTL: 300 }); // 5 minutes for transfers data
const analysisCache = new NodeCache({ stdTTL: 300 }); // 5 minutes for analysis data (price history, etc.)

export const cache = {
  metadata: metadataCache,
  liquidity: liquidityCache,
  risk: riskCache,
  transfers: transfersCache,
  analysis: analysisCache,
};
