import { createWalletClient, createPublicClient, http, custom } from 'viem'
import { base } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

export function getWalletClient() {
  if (typeof window === 'undefined') {
    throw new Error('Client-side only')
  }

  if (!window.ethereum) {
    throw new Error('Wallet not found')
  }

  return createWalletClient({
    chain: base,
    transport: custom(window.ethereum),
  })
}
