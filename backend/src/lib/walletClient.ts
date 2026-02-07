import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "viem/chains";
import dotenv from 'dotenv'

dotenv.config();

export const account = privateKeyToAccount(
    `0x${process.env.USYC_WHITELISTED_WALLET_PRIVATE_KEY!}`
);

export const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(process.env.ARC_TESTNET_RPC_URL!),
});

export const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.ARC_TESTNET_RPC_URL!),
});