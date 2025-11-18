import { ethers } from "ethers";
import type { ChainConfig } from "./chains";
import { isContractVerified, getTokenInfo, getTokenHolderCount } from "./etherscanApi";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function owner() view returns (address)",
  "function balanceOf(address) view returns (uint256)",
];

export interface EVMTokenMetadata {
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: string;
  hasOwnerFunction?: boolean;
  isVerified?: boolean;
  holderCount?: number;
}

export async function getEVMTokenMetadata(
  address: string,
  chain: ChainConfig
): Promise<EVMTokenMetadata> {
  try {
    const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
    const contract = new ethers.Contract(address, ERC20_ABI, provider);

    const [name, symbol, decimals, totalSupply, code] = await Promise.allSettled([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
      provider.getCode(address),
    ]);

    let hasOwnerFunction = false;
    try {
      await contract.owner();
      hasOwnerFunction = true;
    } catch {
      // No owner function
    }

    const chainId = chain.id.toLowerCase();
    
    const [isVerified, tokenInfo, holderCount] = await Promise.allSettled([
      isContractVerified(chainId, address),
      getTokenInfo(chainId, address),
      getTokenHolderCount(chainId, address)
    ]);

    const verificationStatus = isVerified.status === 'fulfilled' && isVerified.value;
    const etherscanTokenInfo = tokenInfo.status === 'fulfilled' ? tokenInfo.value : null;
    const etherscanHolderCount = holderCount.status === 'fulfilled' ? (holderCount.value ?? undefined) : undefined;

    console.log(`[EVMWorker] Contract ${address} on ${chain.name}: ${verificationStatus ? 'VERIFIED' : 'UNVERIFIED'}`);

    return {
      address,
      name: name.status === 'fulfilled' ? name.value : (etherscanTokenInfo?.tokenName || undefined),
      symbol: symbol.status === 'fulfilled' ? symbol.value : (etherscanTokenInfo?.symbol || undefined),
      decimals: decimals.status === 'fulfilled' ? Number(decimals.value) : (etherscanTokenInfo?.divisor ? parseInt(etherscanTokenInfo.divisor) : undefined),
      totalSupply: totalSupply.status === 'fulfilled' ? totalSupply.value.toString() : (etherscanTokenInfo?.totalSupply || undefined),
      hasOwnerFunction,
      isVerified: verificationStatus,
      holderCount: etherscanHolderCount,
    };
  } catch (error) {
    console.error(`Error fetching EVM token metadata for ${address} on ${chain.name}:`, error);
    return { address, isVerified: false };
  }
}

export async function checkEVMContract(address: string, rpcUrl: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch {
    return false;
  }
}
