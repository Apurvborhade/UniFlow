"use client"
import { WagmiProvider, createConfig, http } from "wagmi";
import { arcTestnet, mainnet,sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const config = createConfig(
    getDefaultConfig({
        // Your dApps chains
        chains: [arcTestnet, sepolia],
        transports: {
            // RPC URL for each chain
            [arcTestnet.id]: http(
                `https://arc-testnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
            ),
            [sepolia.id]: http(
                `https://sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
            ),
        },

        // Required API Keys
        walletConnectProjectId: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',

        // Required App Info
        appName: "Uniflow",

        // Optional App Info
        appDescription: "Uniflow",
        appUrl: "https://family.co", // your app's url
        appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
    }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: any }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider>{children}</ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};