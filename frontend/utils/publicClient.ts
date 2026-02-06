// publicClients.ts
import { createPublicClient, http } from "viem";
import { CHAINS } from "./constants";
import { toViemChain } from "./viemChains";

export const publicClients = {
  arc: createPublicClient({
    chain: toViemChain(CHAINS.arc),
    transport: http(CHAINS.arc.rpcUrl),
  }),

  sepolia: createPublicClient({
    chain: toViemChain(CHAINS.sepolia),
    transport: http(CHAINS.sepolia.rpcUrl),
  }),

  baseSepolia: createPublicClient({
    chain: toViemChain(CHAINS.baseSepolia),
    transport: http(CHAINS.baseSepolia.rpcUrl),
  }),
};
