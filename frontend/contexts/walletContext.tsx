'use client'

import { createContext, useContext, useState } from 'react'
import { getWalletClient } from '@/lib/viem'

type WalletContextType = {
  address: `0x${string}` | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | null>(null)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  async function connect() {
    if (!window.ethereum) {
      alert('Please install a wallet')
      return
    }

    setIsConnecting(true)
    const walletClient = getWalletClient()
    const [account] = await walletClient.requestAddresses()
    setAddress(account)
    setIsConnecting(false)
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        connect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider')
  return ctx
}
