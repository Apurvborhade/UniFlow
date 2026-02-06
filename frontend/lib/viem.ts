import { createWalletClient, createPublicClient, http, custom } from "viem";
import { base } from "viem/chains";

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export function getWalletClient() {
  return createWalletClient({
    chain: base,
    transport: custom(window.ethereum!),
  });
}
