
export async function handleDeposit({
  isConnected,
  connectWallet,
  selectedChains,
}: {
  isConnected: boolean
  connectWallet: () => Promise<void>
  selectedChains: string[]
}) {
    console.log('Selected chains for deposit:', {isConnected, selectedChains})
  if (!isConnected) {
    await connectWallet()
    return
  }

  await fetch("/api/treasury/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chains: selectedChains }),
  })
}
