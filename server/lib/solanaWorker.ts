import { Connection, PublicKey } from "@solana/web3.js";

export interface SolanaTokenMetadata {
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: string;
  hasMintAuthority?: boolean;
  isVerified?: boolean;
}

export async function getSolanaTokenMetadata(
  address: string,
  rpcUrl: string
): Promise<SolanaTokenMetadata> {
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubkey = new PublicKey(address);

    const accountInfo = await connection.getParsedAccountInfo(pubkey);

    if (!accountInfo.value) {
      return { address, isVerified: false };
    }

    const data = accountInfo.value.data;
    
    if (typeof data === 'object' && 'parsed' in data) {
      const parsed = data.parsed;
      
      if (parsed.type === 'mint') {
        const info = parsed.info;
        return {
          address,
          decimals: info.decimals,
          totalSupply: info.supply,
          hasMintAuthority: info.mintAuthority !== null,
          isVerified: true,
        };
      }
    }

    return { address, isVerified: true };
  } catch (error) {
    console.error(`Error fetching Solana token metadata for ${address}:`, error);
    return { address, isVerified: false };
  }
}

export async function checkSolanaAccount(address: string, rpcUrl: string): Promise<boolean> {
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubkey = new PublicKey(address);
    const accountInfo = await connection.getAccountInfo(pubkey);
    return accountInfo !== null;
  } catch {
    return false;
  }
}
