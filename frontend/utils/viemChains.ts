// viemChains.ts
import { Chain } from "viem";
import { CHAINS } from "./constants";

export function toViemChain(chain: typeof CHAINS[keyof typeof CHAINS]): Chain {
  return {
    id: chain.id,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: {
      default: { http: [chain.rpcUrl] },
      public: { http: [chain.rpcUrl] },
    },
  };
}
