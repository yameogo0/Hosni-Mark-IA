'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Transaction {
  id: string
  type: "subscription" | "image_analysis" | "continue"
  amount: number
  plan?: "weekly" | "monthly"
  status: "completed" | "pending" | "failed"
  timestamp: Date
  description: string
}

export interface WalletData {
  balance: number
  userId: string
  username: string
  subscription: {
    isActive: boolean
    plan?: "weekly" | "monthly"
    startDate?: Date
    endDate?: Date
    autoRenew: boolean
  }
  transactions: Transaction[]
}

export const useWallet = (accessToken: string | null) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWalletData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    // Mode démo
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setWalletData({
      balance: 25.50,
      userId: "demo_" + Date.now(),
      username: "demo_user",
      subscription: {
        isActive: false,
        autoRenew: false
      },
      transactions: []
    })
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchWalletData()
  }, [fetchWalletData])

  return {
    walletData,
    isLoading,
    error,
    refetch: fetchWalletData,
    cancelSubscription: async () => ({ success: true })
  }
}
