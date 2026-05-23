cat > hooks/use-pi-wallet.ts << 'EOF'
'use client'

import { useState, useEffect } from 'react'

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
}

export function usePiWallet() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<PiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isPiSDKReady, setIsPiSDKReady] = useState(false)

  // Vérifier si le SDK Pi est chargé
  useEffect(() => {
    const checkPiSDK = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        setIsPiSDKReady(true)
        console.log('✅ Pi SDK chargé dans usePiWallet')
        return true
      }
      return false
    }

    if (checkPiSDK()) return

    const interval = setInterval(() => {
      if (checkPiSDK()) clearInterval(interval)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Vérifier l'abonnement actuel
  const checkSubscription = () => {
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
      }
    }
    return null
  }

  // Sauvegarder l'abonnement
  const saveSubscription = (tier: string, paymentId?: string, txid?: string) => {
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
      status: 'active'
    }
    
    localStorage.setItem('hosni_subscription', JSON.stringify(subscriptionData))
    setSubscription(subscriptionData)
    return subscriptionData
  }

  // Connexion Pi Wallet
  const login = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (isPiSDKReady && window.Pi) {
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
        return true
      }
    } catch (err: any) {
      console.error('Erreur connexion:', err)
      setError(err.message || 'Erreur de connexion')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Déconnexion
  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setSubscription(null)
    localStorage.removeItem('hosni_user')
    localStorage.removeItem('hosni_subscription')
  }

  // Traitement du paiement
  const processPayment = async (data: { amount: number; memo: string; metadata: { tier: string } }) => {
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
        throw new Error('Erreur création paiement')
      }

      const paymentResult = await response.json()
      
      // Sauvegarder l'abonnement
      const subscriptionData = saveSubscription(data.metadata.tier, paymentResult.paymentId)
      
      return { success: true, subscription: subscriptionData }
    } catch (err: any) {
      console.error('Erreur paiement:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Vérifier si l'utilisateur a accès premium
  const hasPremiumAccess = () => {
    if (!subscription) return false
    const now = new Date()
    const expires = new Date(subscription.expiresAt)
    return subscription.status === 'active' && expires > now
  }

  // Obtenir le tier actuel
  const getCurrentTier = () => {
    if (!subscription) return 'basic'
    return subscription.tier === 'pro' ? 'Pro' : 
           subscription.tier === 'premium' ? 'Premium' : 'Basic'
  }

  // Temps restant
  const getTimeRemaining = () => {
    if (!subscription) return null
    const now = new Date()
    const expires = new Date(subscription.expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return null
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    return `${hours} heure${hours > 1 ? 's' : ''}`
  }

  // Charger la session persistante
  useEffect(() => {
    const savedUser = localStorage.getItem('hosni_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        setIsAuthenticated(true)
      } catch (e) {
        console.error('Erreur chargement session:', e)
      }
    }
    checkSubscription()
    setIsLoading(false)
  }, [])

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    subscription,
    isPiSDKReady,
    login,
    logout,
    processPayment,
    hasPremiumAccess,
    getCurrentTier,
    getTimeRemaining
  }
}
EOF