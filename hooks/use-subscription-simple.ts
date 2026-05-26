'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Subscription {
  planId: string | null
  isActive: boolean
  activatedAt: string | null
  expiresAt: string | null
}

export function useSubscriptionSimple() {
  const [subscription, setSubscription] = useState<Subscription>({
    planId: null,
    isActive: false,
    activatedAt: null,
    expiresAt: null
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadSubscription = useCallback(() => {
    const saved = localStorage.getItem('hinos_subscription')
    if (saved) {
      try {
        const sub = JSON.parse(saved)
        const now = new Date()
        const expiresAt = new Date(sub.expiresAt)
        
        setSubscription({
          planId: sub.planId,
          isActive: expiresAt > now,
          activatedAt: sub.activatedAt,
          expiresAt: sub.expiresAt
        })
      } catch (e) {
        console.error('Erreur chargement:', e)
        localStorage.removeItem('hinos_subscription')
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadSubscription()
  }, [loadSubscription])

  const refresh = useCallback(() => {
    setIsLoading(true)
    loadSubscription()
  }, [loadSubscription])

  const getDaysRemaining = useCallback(() => {
    if (!subscription.expiresAt) return null
    const now = new Date()
    const expires = new Date(subscription.expiresAt)
    const diff = expires.getTime() - now.getTime()
    if (diff <= 0) return null
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [subscription.expiresAt])

  const isExpired = useCallback(() => {
    if (!subscription.expiresAt) return true
    return new Date() > new Date(subscription.expiresAt)
  }, [subscription.expiresAt])

  return {
    subscription,
    isLoading,
    refresh,
    getDaysRemaining,
    isExpired,
    hasActivePlan: subscription.isActive
  }
}