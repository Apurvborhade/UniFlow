"use client"

import { useChainId, useSwitchChain } from "wagmi";

export function ChainSwitcher() {
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();

  return (
    <select
      value={chainId}
      onChange={(e) => switchChain({ chainId: Number(e.target.value) })}
      className="rounded-full border px-3 py-2 text-sm bg-white"
    >
      {chains.map((chain) => (
        <option key={chain.id} value={chain.id}>
          {chain.name}
        </option>
      ))}
    </select>
  );
}
