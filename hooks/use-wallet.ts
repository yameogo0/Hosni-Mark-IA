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

// 🔥 Mode démo - Activer pour les tests
const DEMO_MODE = true

// Données mock pour le mode démo
const getMockWalletData = (): WalletData => ({
  balance: 125.50,
  userId: "demo_" + Date.now(),
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
      type: "continue",
      amount: 1,
      status: "completed",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      description: "Consultation avancée",
    },
  ],
})

export const useWallet = (accessToken: string | null) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWalletData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Mode démo - retourner des données mock
      if (DEMO_MODE || !accessToken || accessToken.startsWith('demo_')) {
        console.log("🏖️ Mode démo - Données mock du wallet")
        await new Promise(resolve => setTimeout(resolve, 500))
        setWalletData(getMockWalletData())
        setIsLoading(false)
        return
      }

      // Appel API réel
      const response = await fetch('/api/wallet', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      const transformedData: WalletData = {
        balance: data.balance || 0,
        userId: data.userId || data.user_uid || "unknown",
        username: data.username || "user",
        subscription: {
          isActive: data.subscription?.isActive || false,
          plan: data.subscription?.plan,
          startDate: data.subscription?.startDate ? new Date(data.subscription.startDate) : undefined,
          endDate: data.subscription?.endDate ? new Date(data.subscription.endDate) : undefined,
          autoRenew: data.subscription?.autoRenew || false,
        },
        transactions: (data.transactions || []).map((t: any) => ({
          id: t.id || t.paymentId,
          type: t.type || "subscription",
          amount: t.amount,
          plan: t.plan,
          status: t.status || "completed",
          timestamp: new Date(t.timestamp || t.created_at),
          description: t.description || t.memo || "Transaction",
        })),
      }

      setWalletData(transformedData)
    } catch (err) {
      console.error("Error fetching wallet data:", err)
      setError(err instanceof Error ? err.message : "Failed to load wallet")
      // Fallback to mock data
      setWalletData(getMockWalletData())
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  const cancelSubscription = useCallback(async () => {
    if (DEMO_MODE) {
      console.log("🏖️ Mode démo - Annulation simulée")
      return { success: true }
    }

    if (!accessToken || !walletData?.subscription.isActive) {
      return { success: false, error: "No active subscription" }
    }

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: walletData.userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      await fetchWalletData()
      return { success: true }
    } catch (err) {
      console.error("Error canceling subscription:", err)
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" }
    }
  }, [accessToken, walletData?.subscription.isActive, walletData?.userId, fetchWalletData])

  useEffect(() => {
    fetchWalletData()
  }, [fetchWalletData])

  return {
    walletData,
    isLoading,
    error,
    refetch: fetchWalletData,
    cancelSubscription,
  }
}