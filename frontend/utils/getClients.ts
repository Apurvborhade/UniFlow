// getClients.ts
import { CHAINS } from "./constants";
import { publicClients } from "./publicClient";
import { toViemChain } from "./viemChains";
import { getWalletClient } from "./walletClient";

export function getClientsByChainId(chainId: number) {
  if (chainId === CHAINS.arc.id) {
    return {
      publicClient: publicClients.arc,
      walletClient: getWalletClient(toViemChain(CHAINS.arc)),
      config: CHAINS.arc,
    };
  }

  if (chainId === CHAINS.sepolia.id) {
    return {
      publicClient: publicClients.sepolia,
      walletClient: getWalletClient(toViemChain(CHAINS.sepolia)),
      config: CHAINS.sepolia,
    };
  }

  if (chainId === CHAINS.baseSepolia.id) {
    return {
      publicClient: publicClients.baseSepolia,
      walletClient: getWalletClient(toViemChain(CHAINS.baseSepolia)),
      config: CHAINS.baseSepolia,
    };
  }

  throw new Error("Unsupported chain");
}
