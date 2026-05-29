'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Subscription {
  planId: string | null
  planName?: string
  isActive: boolean
  activatedAt: string | null
  expiresAt: string | null
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  duration: number
  features: string[]
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'pro_weekly',
    name: 'Pro',
    price: 5.99,
    duration: 7,
    features: ['Analyses illimitées', 'Support par email', 'Export des rapports', 'Accès à la communauté']
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    price: 19.99,
    duration: 30,
    features: ['Tout ce qui est dans Pro', 'Support prioritaire 24/7', 'API personnalisée', 'Rapports avancés']
  }
]

export function useSubscriptionSimple() {
  const [subscription, setSubscription] = useState<Subscription>({
    planId: null,
    isActive: false,
    activatedAt: null,
    expiresAt: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSubscription = useCallback(() => {
    try {
      const saved = localStorage.getItem('hinos_subscription')
      if (saved) {
        const sub = JSON.parse(saved)
        const now = new Date()
        const expiresAt = new Date(sub.expiresAt)
        
        // Trouver le nom du plan
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === sub.planId)
        
        setSubscription({
          planId: sub.planId,
          planName: plan?.name || (sub.planId === 'pro_weekly' ? 'Pro' : 'Premium'),
          isActive: expiresAt > now,
          activatedAt: sub.activatedAt,
          expiresAt: sub.expiresAt
        })
      } else {
        setSubscription({
          planId: null,
          isActive: false,
          activatedAt: null,
          expiresAt: null
        })
      }
    } catch (e) {
      console.error('Erreur chargement abonnement:', e)
      setError('Erreur lors du chargement de l\'abonnement')
      localStorage.removeItem('hinos_subscription')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveSubscription = useCallback((planId: string, txid?: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    if (!plan) return false

    const now = new Date()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + plan.duration)

    const subscriptionData = {
      planId,
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      txid
    }

    localStorage.setItem('hinos_subscription', JSON.stringify(subscriptionData))
    
    setSubscription({
      planId,
      planName: plan.name,
      isActive: true,
      activatedAt: subscriptionData.activatedAt,
      expiresAt: subscriptionData.expiresAt
    })
    
    return true
  }, [])

  const clearSubscription = useCallback(() => {
    localStorage.removeItem('hinos_subscription')
    setSubscription({
      planId: null,
      isActive: false,
      activatedAt: null,
      expiresAt: null
    })
  }, [])

  const refresh = useCallback(() => {
    setIsLoading(true)
    setError(null)
    loadSubscription()
  }, [loadSubscription])

  const getDaysRemaining = useCallback(() => {
    if (!subscription.expiresAt || !subscription.isActive) return null
    const now = new Date()
    const expires = new Date(subscription.expiresAt)
    const diff = expires.getTime() - now.getTime()
    if (diff <= 0) return 0
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [subscription.expiresAt, subscription.isActive])

  const getTimeRemainingText = useCallback(() => {
    const days = getDaysRemaining()
    if (days === null) return null
    if (days === 0) return "Expire aujourd'hui"
    if (days === 1) return "1 jour restant"
    return `${days} jours restants`
  }, [getDaysRemaining])

  const isExpired = useCallback(() => {
    if (!subscription.expiresAt) return true
    return new Date() > new Date(subscription.expiresAt)
  }, [subscription.expiresAt])

  const hasActivePlan = subscription.isActive && !isExpired()

  // Vérifier périodiquement si l'abonnement a expiré
  useEffect(() => {
    if (!subscription.isActive) return

    const interval = setInterval(() => {
      if (isExpired()) {
        setSubscription(prev => ({ ...prev, isActive: false }))
        localStorage.removeItem('hinos_subscription')
      }
    }, 60000) // Vérifier toutes les minutes

    return () => clearInterval(interval)
  }, [subscription.isActive, isExpired])

  useEffect(() => {
    loadSubscription()
  }, [loadSubscription])

  return {
    subscription,
    isLoading,
    error,
    refresh,
    saveSubscription,
    clearSubscription,
    getDaysRemaining,
    getTimeRemainingText,
    isExpired,
    hasActivePlan,
    plans: SUBSCRIPTION_PLANS
  }
}