'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

declare global {
  interface Window {
    Pi: any
  }
}

interface PiUser {
  uid: string
  username: string
  accessToken: string
  walletAddress?: string
}

interface Subscription {
  tier: string
  activatedAt: string
  expiresAt: string
  status: 'active' | 'expired' | 'cancelled'
  planId?: string
  txid?: string
  paymentId?: string
}

interface PaymentData {
  amount: number
  memo: string
  metadata: { tier: string }
}

export function usePiWallet() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<PiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isPiSDKReady, setIsPiSDKReady] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const authAttempted = useRef(false)

  // Vérifier si le SDK Pi est chargé
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const checkPiSDK = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        setIsPiSDKReady(true)
        console.log('✅ Pi SDK chargé dans usePiWallet')
        if (interval) clearInterval(interval)
        return true
      }
      return false
    }

    if (checkPiSDK()) return

    interval = setInterval(() => {
      if (checkPiSDK() && interval) clearInterval(interval)
    }, 500)

    // Timeout après 10 secondes
    const timeout = setTimeout(() => {
      if (interval) clearInterval(interval)
      console.warn('⚠️ Pi SDK non détecté après 10 secondes')
      setIsPiSDKReady(false)
    }, 10000)

    return () => {
      if (interval) clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  // Vérifier l'abonnement actuel
  const checkSubscription = useCallback(() => {
    const saved = localStorage.getItem('hosni_subscription')
    if (saved) {
      try {
        const sub = JSON.parse(saved)
        const now = new Date()
        const expires = new Date(sub.expiresAt)
        
        if (expires > now) {
          setSubscription({ ...sub, status: 'active' })
          return sub
        } else {
          localStorage.removeItem('hosni_subscription')
          setSubscription(null)
          return null
        }
      } catch (e) {
        console.error('Erreur chargement abonnement:', e)
        localStorage.removeItem('hosni_subscription')
      }
    }
    return null
  }, [])

  // Sauvegarder l'abonnement
  const saveSubscription = useCallback((tier: string, paymentId?: string, txid?: string) => {
    const now = new Date()
    let expiresAt = new Date()
    
    if (tier === 'pro') {
      expiresAt.setDate(now.getDate() + 7)
    } else if (tier === 'premium') {
      expiresAt.setDate(now.getDate() + 30)
    } else {
      return null
    }
    
    const subscriptionData: Subscription = {
      tier,
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      planId: tier === 'pro' ? 'pro_weekly' : 'premium_monthly',
      paymentId,
      txid
    }
    
    localStorage.setItem('hosni_subscription', JSON.stringify(subscriptionData))
    setSubscription(subscriptionData)
    return subscriptionData
  }, [])

  // Connexion Pi Wallet
  const login = useCallback(async () => {
    if (authAttempted.current && isAuthenticated) return true
    
    setIsLoading(true)
    setError(null)

    try {
      if (isPiSDKReady && window.Pi) {
        console.log('🔐 Authentification Pi...')
        const scopes = ['username', 'payments', 'wallet_address']
        
        const auth = await window.Pi.authenticate(scopes, (err: any) => {
          console.error('Erreur auth Pi:', err)
          setError(err?.message || 'Erreur d\'authentification')
        })
        
        if (auth && auth.user) {
          const userData: PiUser = {
            uid: auth.user.uid,
            username: auth.user.username,
            accessToken: auth.accessToken,
            walletAddress: auth.user.wallet_address
          }
          setUser(userData)
          setIsAuthenticated(true)
          localStorage.setItem('hosni_user', JSON.stringify(userData))
          checkSubscription()
          authAttempted.current = true
          return true
        }
      } else {
        // Mode démo
        console.log('🏖️ Mode démo - Authentification simulée')
        const demoUser: PiUser = {
          uid: 'demo_' + Date.now(),
          username: 'demo_user',
          accessToken: 'demo_token',
          walletAddress: '0x' + Math.random().toString(36).slice(2, 10)
        }
        setUser(demoUser)
        setIsAuthenticated(true)
        localStorage.setItem('hosni_user', JSON.stringify(demoUser))
        checkSubscription()
        authAttempted.current = true
        return true
      }
    } catch (err: any) {
      console.error('Erreur connexion:', err)
      setError(err.message || 'Erreur de connexion')
      return false
    } finally {
      setIsLoading(false)
    }
    return false
  }, [isPiSDKReady, isAuthenticated, checkSubscription])

  // Déconnexion
  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    setSubscription(null)
    setBalance(null)
    localStorage.removeItem('hosni_user')
    localStorage.removeItem('hosni_subscription')
    authAttempted.current = false
    console.log('🔓 Déconnexion effectuée')
  }, [])

  // Récupérer le solde du wallet
  const fetchBalance = useCallback(async () => {
    if (!user?.accessToken) return null
    
    try {
      const response = await fetch('/api/pi/balance', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance)
        return data.balance
      }
    } catch (error) {
      console.error('Erreur récupération solde:', error)
    }
    return null
  }, [user?.accessToken])

  // Traitement du paiement
  const processPayment = useCallback(async (data: PaymentData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Appel à l'API de paiement
      const response = await fetch('/api/pi/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          planId: data.metadata.tier === 'pro' ? 'pro_weekly' : 'premium_monthly',
          amount: data.amount,
          userId: user?.uid
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erreur création paiement')
      }

      const paymentResult = await response.json()
      
      // Sauvegarder l'abonnement
      const subscriptionData = saveSubscription(data.metadata.tier, paymentResult.paymentId, paymentResult.txid)
      
      // Rafraîchir le solde
      await fetchBalance()
      
      return { success: true, subscription: subscriptionData, paymentId: paymentResult.paymentId }
    } catch (err: any) {
      console.error('Erreur paiement:', err)
      setError(err.message || 'Erreur de paiement')
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid, saveSubscription, fetchBalance])

  // Vérifier si l'utilisateur a accès premium
  const hasPremiumAccess = useCallback(() => {
    if (!subscription) return false
    const now = new Date()
    const expires = new Date(subscription.expiresAt)
    return subscription.status === 'active' && expires > now
  }, [subscription])

  // Obtenir le tier actuel
  const getCurrentTier = useCallback(() => {
    if (!subscription) return 'basic'
    return subscription.tier === 'pro' ? 'Pro' : 
           subscription.tier === 'premium' ? 'Premium' : 'Basic'
  }, [subscription])

  // Temps restant
  const getTimeRemaining = useCallback(() => {
    if (!subscription) return null
    const now = new Date()
    const expires = new Date(subscription.expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return null
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`
    
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }, [subscription])

  // Annuler l'abonnement
  const cancelSubscription = useCallback(async () => {
    if (!subscription) return { success: false, error: "Aucun abonnement actif" }
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          tier: subscription.tier
        })
      })
      
      if (response.ok) {
        localStorage.removeItem('hosni_subscription')
        setSubscription(null)
        return { success: true }
      } else {
        throw new Error("Erreur lors de l'annulation")
      }
    } catch (err: any) {
      console.error('Erreur annulation:', err)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [subscription, user?.uid])

  // Charger la session persistante
  useEffect(() => {
    const savedUser = localStorage.getItem('hosni_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        setIsAuthenticated(true)
        authAttempted.current = true
      } catch (e) {
        console.error('Erreur chargement session:', e)
        localStorage.removeItem('hosni_user')
      }
    }
    checkSubscription()
    setIsLoading(false)
  }, [checkSubscription])

  // Rafraîchir les données périodiquement
  useEffect(() => {
    if (isAuthenticated && user?.accessToken) {
      fetchBalance()
      const interval = setInterval(() => {
        fetchBalance()
        checkSubscription()
      }, 60000) // Toutes les minutes
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user?.accessToken, fetchBalance, checkSubscription])

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    subscription,
    isPiSDKReady,
    balance,
    login,
    logout,
    processPayment,
    hasPremiumAccess,
    getCurrentTier,
    getTimeRemaining,
    fetchBalance,
    cancelSubscription
  }
}