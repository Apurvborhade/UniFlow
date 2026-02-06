"use client";

import { useEffect, useState } from "react";
import { getWalletClient } from "@/lib/viem";

export function useWallet() {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasProvider, setHasProvider] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setHasProvider(true);
    }
    
  }, []);

  async function connect() {
    if (!window.ethereum) {
      alert("Please install a wallet");
      return
      
    }
    
    setIsConnecting(true);

    const walletClient = getWalletClient();
    const [account] = await walletClient.requestAddresses();

    setAddress(account);
    setIsConnecting(false);
  }

  return {
    address,
    isConnected: !!address,
    isConnecting,
    connect,
  };
}
