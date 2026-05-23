"use client"

import { useState, useEffect } from "react"
import { BACKEND_CONFIG } from "@/lib/system-config"

// Wallet endpoints
const WALLET_URLS = {
  WALLET: `${BACKEND_CONFIG.BASE_URL}/v1/wallet`,
  CANCEL_SUBSCRIPTION: `${BACKEND_CONFIG.BASE_URL}/v1/subscription/cancel`,
} as const

const BACKEND_URLS = {
  WALLET: `${BACKEND_CONFIG.BASE_URL}/v1/wallet`,
  CANCEL_SUBSCRIPTION: `${BACKEND_CONFIG.BASE_URL}/v1/subscription/cancel`,
} as const

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

  const fetchWalletData = async () => {
    if (!accessToken) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(WALLET_URLS.WALLET, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch wallet data")
      }

      const data = await response.json()
      
      // Transform dates from strings to Date objects
      const transformedData: WalletData = {
        ...data,
        subscription: {
          ...data.subscription,
          startDate: data.subscription.startDate ? new Date(data.subscription.startDate) : undefined,
          endDate: data.subscription.endDate ? new Date(data.subscription.endDate) : undefined,
        },
        transactions: data.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        })),
      }

      setWalletData(transformedData)
    } catch (err) {
      console.error("Error fetching wallet data:", err)
      setError(err instanceof Error ? err.message : "Failed to load wallet")
      
      // Set mock data for development/testing
      setWalletData({
        balance: 125.5,
        userId: "user_12345",
        username: "demo_user",
        subscription: {
          isActive: true,
          plan: "monthly",
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          autoRenew: true,
        },
        transactions: [
          {
            id: "tx_001",
            type: "subscription",
            amount: 15,
            plan: "monthly",
            status: "completed",
            timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            description: "Abonnement Mensuel Pro",
          },
          {
            id: "tx_002",
            type: "image_analysis",
            amount: 2,
            status: "completed",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            description: "Analyse d'image marketing",
          },
          {
            id: "tx_003",
            type: "subscription",
            amount: 5,
            plan: "weekly",
            status: "completed",
            timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            description: "Abonnement Hebdomadaire",
          },
        ],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSubscription = async () => {
    if (!accessToken || !walletData?.subscription.isActive) {
      return
    }

    try {
      const response = await fetch(WALLET_URLS.CANCEL_SUBSCRIPTION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to cancel subscription")
      }

      // Refresh wallet data
      await fetchWalletData()
    } catch (err) {
      console.error("Error canceling subscription:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [accessToken])

  return {
    walletData,
    isLoading,
    error,
    refetch: fetchWalletData,
    cancelSubscription,
  }
}
