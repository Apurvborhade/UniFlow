'use client'

import { useState } from 'react'

export function useDeposit() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function deposit(chains: string[]) {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/treasury/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chains }),
      })

      if (!res.ok) {
        throw new Error('Deposit failed')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return { deposit, loading, success, error }
}
