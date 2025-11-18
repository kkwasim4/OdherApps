/**
 * DAPP ACTIVITY SCANNER
 * 
 * Analyzes smart contract interactions to identify top DApps/contracts
 * that users interact with when holding/trading a specific token.
 * 
 * Features:
 * - Scans token transfer events to find associated contract addresses
 * - Groups interactions by contract address
 * - Calculates transaction count and gas spent per contract
 * - Returns ranked list of most active DApps
 * 
 * 100% Real blockchain data - no mocks or placeholders
 */

import { ethers } from 'ethers';
import { executeWithFailover } from './rpcFailover';

export interface DAppActivity {
  rank: number;
  contractAddress: string;
  contractName?: string;
  txnCount: number;
  gasSpent: string; // in ETH
  gasSpentUSD?: number;
}

export interface DAppActivityResult {
  activities: DAppActivity[];
  totalTxns: number;
  scanBlocks: number;
  timestamp: number;
  degradedMode?: boolean; // True when rate limits forced smaller scans
  rateLimited?: boolean; // True when rate limiting was encountered
  message?: string; // User-friendly message about data quality
}

const ERC20_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// Common contract names (can be extended with Etherscan API)
const KNOWN_CONTRACTS: Record<string, string> = {
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap V2: Router',
  '0xe592427a0aece92de3edee1f18e0157c05861564': 'Uniswap V3: Router',
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap V3: Router 2',
  '0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b': 'Uniswap V3: Universal Router',
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'Uniswap V3: Universal Router 2',
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': 'Uniswap V2 Router',
  '0x1111111254EEB25477B68fb85Ed929f73A960582': '1inch V5: Aggregation Router',
  '0x11111112542D85B3EF69AE05771c2dCCff4fAa26': '1inch V4: Aggregation Router',
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff': '0x: Exchange Proxy',
  '0x216B4B4Ba9F3e719726886d34a177484278Bfcae': 'TokenSets',
};

/**
 * Extract max block range from Alchemy/provider error message
 */
function extractMaxBlockRange(errorMessage: string): number | null {
  const match = errorMessage.match(/(\d+)\s+block\s+range/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Scan recent transactions to identify top DApps interacting with this token
 * Adaptive to provider block-range limits (e.g., Alchemy free tier = 10 blocks)
 */
export async function scanDAppActivity(
  tokenAddress: string,
  chainId: string,
  scanDepth: number = 10000
): Promise<DAppActivityResult> {
  console.log(`[DAppActivity] Starting scan for ${tokenAddress}, depth: ${scanDepth} blocks`);

  return await executeWithFailover(chainId, async (provider) => {
    const startTime = Date.now();
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - scanDepth);

    console.log(`[DAppActivity] Scanning blocks ${fromBlock} to ${latestBlock}`);

    // Adaptive chunk size - start small for free tier compatibility
    let chunkSize = 50; // Conservative initial chunk
    let maxChunkSize = 2000;
    let minChunkSize = 10; // Alchemy free tier minimum
    
    const allLogs: any[] = [];
    let consecutiveErrors = 0;
    let rateLimited = false;
    let degradedMode = false;
    
    // Use while-loop with explicit cursor to avoid coverage gaps
    let currentBlock = fromBlock;
    
    while (currentBlock <= latestBlock) {
      const end = Math.min(currentBlock + chunkSize - 1, latestBlock);
      
      try {
        const filter = {
          address: tokenAddress,
          topics: [ERC20_TRANSFER_TOPIC],
          fromBlock: currentBlock,
          toBlock: end,
        };

        const chunkLogs = await provider.getLogs(filter);
        allLogs.push(...chunkLogs);
        
        // Success - gradually increase chunk size and advance cursor
        if (chunkSize < maxChunkSize && consecutiveErrors === 0) {
          chunkSize = Math.min(chunkSize * 2, maxChunkSize);
        }
        consecutiveErrors = 0;
        
        if (chunkLogs.length > 0) {
          console.log(`[DAppActivity] Chunk ${currentBlock}-${end}: ${chunkLogs.length} transfers`);
        }
        
        // Advance to next chunk ONLY on success
        currentBlock = end + 1;
        
        // Small delay to avoid rate limiting
        await sleep(50);
        
      } catch (error: any) {
        consecutiveErrors++;
        const errorMsg = error.message || '';
        
        // Detect block range limit
        const maxRange = extractMaxBlockRange(errorMsg);
        if (maxRange && maxRange < chunkSize) {
          console.log(`[DAppActivity] Detected max block range: ${maxRange}, adjusting chunk size...`);
          chunkSize = maxRange;
          minChunkSize = maxRange;
          maxChunkSize = maxRange;
          degradedMode = true;
          // Don't advance cursor - retry with new chunk size
          await sleep(200);
          continue;
        }
        
        // Detect rate limiting
        if (errorMsg.includes('429') || errorMsg.includes('compute units') || errorMsg.includes('rate limit')) {
          console.log(`[DAppActivity] Rate limited, reducing chunk size and backing off...`);
          chunkSize = Math.max(minChunkSize, Math.floor(chunkSize / 2));
          rateLimited = true;
          degradedMode = true;
          await sleep(1000); // 1s backoff
          // Don't advance cursor - retry with new chunk size
          continue;
        }
        
        // After multiple consecutive errors, stop scanning
        if (consecutiveErrors >= 5) {
          console.warn(`[DAppActivity] Too many errors (${consecutiveErrors}), stopping scan at block ${currentBlock}. Used ${allLogs.length} logs.`);
          degradedMode = true; // Mark as degraded since we're aborting early
          break;
        }
        
        console.warn(`[DAppActivity] Failed chunk ${currentBlock}-${end}:`, errorMsg.substring(0, 100));
        
        // Reduce chunk size on any error and retry
        chunkSize = Math.max(minChunkSize, Math.floor(chunkSize / 2));
        await sleep(200);
        // Don't advance cursor - retry with smaller chunk
      }
    }

    // Calculate coverage before finalizing degradedMode
    const targetBlocks = latestBlock - fromBlock + 1;
    const actualBlocksScanned = Math.max(0, Math.min(currentBlock, latestBlock + 1) - fromBlock);
    const coveragePercent = Math.min(100, targetBlocks > 0 ? Math.round((actualBlocksScanned / targetBlocks) * 100) : 0);
    
    // Only keep degradedMode true if we actually have incomplete coverage
    if (degradedMode && coveragePercent >= 100) {
      degradedMode = false; // Full coverage achieved despite throttling
      rateLimited = false; // Clear since we got all data
    }
    
    console.log(`[DAppActivity] Found ${allLogs.length} total transfer events (${coveragePercent}% coverage)${degradedMode ? ' - degraded mode' : ''}`);

    // Group by transaction hash to get unique transactions
    const txHashes = new Set(allLogs.map(log => log.transactionHash));
    console.log(`[DAppActivity] ${txHashes.size} unique transactions`);

    // Fetch transaction details and group by "to" address (contract being called)
    const contractInteractions = new Map<string, {
      txnCount: number;
      gasSpent: bigint;
      txHashes: Set<string>;
    }>();

    let processedCount = 0;
    for (const txHash of Array.from(txHashes).slice(0, 100)) { // Limit to 100 for performance
      try {
        const [tx, receipt] = await Promise.all([
          provider.getTransaction(txHash),
          provider.getTransactionReceipt(txHash)
        ]);

        if (!tx || !receipt || !tx.to) continue;

        const contractAddr = tx.to.toLowerCase();
        
        if (!contractInteractions.has(contractAddr)) {
          contractInteractions.set(contractAddr, {
            txnCount: 0,
            gasSpent: BigInt(0),
            txHashes: new Set(),
          });
        }

        const data = contractInteractions.get(contractAddr)!;
        data.txHashes.add(txHash);
        data.txnCount = data.txHashes.size;
        data.gasSpent += BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice || tx.gasPrice || 0);

        processedCount++;
        
        if (processedCount % 20 === 0) {
          console.log(`[DAppActivity] Processed ${processedCount}/${Math.min(100, txHashes.size)} transactions`);
        }
      } catch (error) {
        // Skip failed transactions
        continue;
      }
    }

    // Convert to array and sort by transaction count
    const activities: DAppActivity[] = Array.from(contractInteractions.entries())
      .map(([address, data], index) => ({
        rank: 0, // Will be set after sorting
        contractAddress: address,
        contractName: KNOWN_CONTRACTS[address] || KNOWN_CONTRACTS[address.toLowerCase()],
        txnCount: data.txnCount,
        gasSpent: ethers.formatEther(data.gasSpent),
      }))
      .sort((a, b) => b.txnCount - a.txnCount)
      .slice(0, 10) // Top 10
      .map((activity, index) => ({
        ...activity,
        rank: index + 1,
      }));

    const totalTxns = allLogs.length;
    const scanTime = Date.now() - startTime;

    console.log(`[DAppActivity] Completed in ${scanTime}ms - found ${activities.length} active DApps`);

    // Build user-friendly message about data quality
    // Note: coverage already calculated above before degradedMode finalization
    
    // Final defensive check: ensure degradedMode is false if we achieved 100% coverage
    // This prevents any late error paths from incorrectly setting degradedMode=true
    if (coveragePercent >= 100) {
      degradedMode = false;
      rateLimited = false;
    }
    
    let message: string | undefined;
    
    if (degradedMode && coveragePercent < 100 && activities.length === 0) {
      message = `Limited data available (~${coveragePercent}% coverage). RPC provider constraints prevented full scan.`;
    } else if (degradedMode && coveragePercent < 100) {
      message = `Partial data shown (~${coveragePercent}% coverage). Full analysis requires upgraded RPC access.`;
    } else if (degradedMode) {
      // This should never happen now since we clear degradedMode at 100% coverage
      message = "Data collection throttled by RPC rate limits. Showing available results.";
    }

    return {
      activities,
      totalTxns,
      scanBlocks: latestBlock - fromBlock,
      timestamp: Date.now(),
      degradedMode,
      rateLimited,
      message,
    };
  });
}
