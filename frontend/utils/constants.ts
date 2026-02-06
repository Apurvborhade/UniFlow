export const CHAINS = {
  arc: {
    id: 5042002,
    name: "ARC Testnet",
    rpcUrl: "https://rpc.testnet.arc.network",
    nativeCurrency: {
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
    },
    usdc: "0x3600000000000000000000000000000000000000",
  },

  sepolia: {
    id: 11155111,
    name: "Ethereum Sepolia",
    rpcUrl: "https://rpc.sepolia.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  },

  baseSepolia: {
    id: 84531,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    usdc: "0x5deac602762362fe5f135fa5904351916053cf70",
  },
} as const;

export const TREASURY_ADDRESS = "0xc1ee313c7434cd9f8aa9c1e331626495dd32fb77"