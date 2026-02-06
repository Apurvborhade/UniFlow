// walletClient.ts
import { createWalletClient, custom } from "viem";
import type { Chain } from "viem";

export function getWalletClient(chain: Chain) {
  if (typeof window === "undefined") {
    throw new Error("Wallet client can only be used in browser");
  }

  if (!window.ethereum) {
    throw new Error("No Ethereum provider found");
  }

  return createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });
}
