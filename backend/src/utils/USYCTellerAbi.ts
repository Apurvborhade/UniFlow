export const USYC_TELLER_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "_assets", type: "uint256" },
      { internalType: "address", name: "_receiver", type: "address" },
    ],
    name: "deposit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "address", name: "_receiver", type: "address" },
      { internalType: "address", name: "_account", type: "address" },
    ],
    name: "redeem",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;