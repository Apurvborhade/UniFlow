import { getRequiredWalletId } from "./helper.js";

export type WalletChain = "ETH-SEPOLIA" | "BASE-SEPOLIA" | "AVAX-FUJI" | "ARC-TESTNET";

export type Chain = "ethereum" | "base" | "avalanche" | "arc";

export type ChainConfig = {
  chainName: string;
  usdc: string;
  walletId: string;
  domain: number;
  walletChain: WalletChain;
};

export const CHAIN_CONFIG: Record<Chain, ChainConfig> = {
  ethereum: {
    chainName: "Ethereum Sepolia",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    walletId: getRequiredWalletId("ETH_SEPOLIA_WALLET_ID"),
    domain: 0,
    walletChain: "ETH-SEPOLIA",
  },
  base: {
    chainName: "Base Sepolia",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    walletId: getRequiredWalletId("BASE_SEPOLIA_WALLET_ID"),
    domain: 6,
    walletChain: "BASE-SEPOLIA",
  },
  avalanche: {
    chainName: "Avalanche Fuji",
    usdc: "0x5425890298aed601595a70AB815c96711a31Bc65",
    walletId: getRequiredWalletId("AVAX_FUJI_WALLET_ID"),
    domain: 1,
    walletChain: "AVAX-FUJI",
  },
  arc: {
    chainName: "Arc Testnet",
    usdc: "0x3600000000000000000000000000000000000000",
    walletId: getRequiredWalletId("ARC_TESTNET_WALLET_ID"),
    domain: 26,
    walletChain: "ARC-TESTNET",
  },
};