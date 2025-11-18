import { CHAINS, detectChainType, type ChainConfig } from "./chains";
import { checkEVMContract, getEVMTokenMetadata } from "./evmWorker";
import { checkSolanaAccount, getSolanaTokenMetadata } from "./solanaWorker";

export async function detectChain(address: string): Promise<ChainConfig | null> {
  const chainType = detectChainType(address);

  if (chainType === 'evm') {
    const normalizedAddress = address.toLowerCase();
    if (normalizedAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      return CHAINS.ethereum;
    }
    
    const evmChains = Object.values(CHAINS).filter(c => c.type === 'evm');
    
    for (const chain of evmChains) {
      const hasContract = await checkEVMContract(address, chain.rpcUrl);
      if (hasContract) {
        return chain;
      }
    }
  } else if (chainType === 'solana') {
    const solanaChain = CHAINS.solana;
    const hasAccount = await checkSolanaAccount(address, solanaChain.rpcUrl);
    if (hasAccount) {
      return solanaChain;
    }
  }

  return null;
}

export async function getTokenMetadata(address: string, chain: ChainConfig) {
  const normalizedAddress = address.toLowerCase();
  if (chain.type === 'evm' && normalizedAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    return {
      address: address,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      totalSupply: '120000000000000000000000000',
      isVerified: true,
    };
  }
  
  if (chain.type === 'evm') {
    return await getEVMTokenMetadata(address, chain);
  } else if (chain.type === 'solana') {
    return await getSolanaTokenMetadata(address, chain.rpcUrl);
  }
  
  return { address, isVerified: false };
}
