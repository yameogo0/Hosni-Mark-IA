"use client"

import { useState, useCallback } from "react"
import { BACKEND_URLS } from "@/lib/system-config"

// Extend Window interface for Pi SDK
declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>
      authenticate: (scopes: string[]) => Promise<any>
      createPayment: (paymentData: {
        amount: number
        memo: string
        metadata: Record<string, any>
      }, callbacks: {
        onReadyForServerApproval: (paymentId: string) => void
        onReadyForServerCompletion: (paymentId: string, txid: string) => void
        onCancel: (paymentId: string) => void
        onError: (error: Error, payment?: { paymentId: string }) => void
      }) => void
    }
  }
}

export interface SubscriptionPlan {
  id: string
  name: string
  duration: "weekly" | "monthly"
  amount: number
  description: string
  features: string[]
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "weekly",
    name: "Hebdomadaire",
    duration: "weekly",
    amount: 5,
    description: "Idéal pour tester ou résoudre un défi à court terme",
    features: [
      "Questions illimitées",
      "Recherche par Image",
      "Analyse marketing détaillée",
      "Pas de restriction quotidienne"
    ]
  },
  {
    id: "monthly_pro",
    name: "Mensuel Pro",
    duration: "monthly",
    amount: 15,
    description: "Pour une croissance continue – Économisez plus!",
    features: [
      "Tous les avantages hebdomadaires",
      "Analyses plus approfondies",
      "Plans d'action étendus",
      "Support prioritaire"
    ]
  }
]

interface PaymentCallbacks {
  onSuccess?: () => void
  onCancel?: () => void
  onError?: (error: string) => void
}

// Helper pour obtenir l'URL d'approbation
const getApproveUrl = (paymentId: string): string => {
  if (BACKEND_URLS?.APPROVE_PAYMENT) {
    return typeof BACKEND_URLS.APPROVE_PAYMENT === 'function'
      ? BACKEND_URLS.APPROVE_PAYMENT(paymentId)
      : `${BACKEND_URLS.APPROVE_PAYMENT}/${paymentId}`;
  }
  return `/api/pi/payment/${paymentId}/approve`;
};

// Helper pour obtenir l'URL de complétion
const getCompleteUrl = (paymentId: string): string => {
  if (BACKEND_URLS?.COMPLETE_PAYMENT) {
    return typeof BACKEND_URLS.COMPLETE_PAYMENT === 'function'
      ? BACKEND_URLS.COMPLETE_PAYMENT(paymentId)
      : `${BACKEND_URLS.COMPLETE_PAYMENT}/${paymentId}`;
  }
  return `/api/pi/payment/${paymentId}/complete`;
};

export function usePiPayment(accessToken: string | null) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null)

  const clearError = useCallback(() => setPaymentError(null), [])

  const initiatePayment = useCallback(async (
    plan: SubscriptionPlan,
    callbacks?: PaymentCallbacks
  ) => {
    // Validation de l'authentification
    if (!accessToken) {
      const error = "Non authentifié. Veuillez vous reconnecter."
      setPaymentError(error)
      callbacks?.onError?.(error)
      return
    }

    // Vérification du SDK Pi
    if (typeof window === 'undefined' || typeof window.Pi === "undefined") {
      const error = "Pi SDK non disponible. Veuillez rafraîchir la page ou utiliser le Pi Browser."
      setPaymentError(error)
      callbacks?.onError?.(error)
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      console.log("💰 Initiating Pi payment for plan:", plan.name)

      const paymentData = {
        amount: plan.amount,
        memo: `Abonnement ${plan.name} - Hosni IA`,
        metadata: {
          subscription_plan: plan.id,
          duration: plan.duration,
          timestamp: Date.now(),
          plan_name: plan.name,
          amount: plan.amount
        }
      }

      // Créer une promesse pour gérer le paiement
      const paymentPromise = new Promise<void>((resolve, reject) => {
        window.Pi.createPayment(paymentData, {
          // Step 1: Payment created, send to backend for approval
          onReadyForServerApproval: async (paymentId: string) => {
            console.log("📝 Payment ready for approval:", paymentId)
            setLastPaymentId(paymentId)
            
            try {
              const approveUrl = getApproveUrl(paymentId)
              const response = await fetch(approveUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  plan_id: plan.id,
                  amount: plan.amount
                })
              })

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || "Échec de l'approbation du paiement")
              }

              console.log("✅ Payment approved by backend")
            } catch (error) {
              console.error("❌ Approval error:", error)
              reject(error)
            }
          },

          // Step 2: Payment completed on blockchain, finalize on backend
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log("🔗 Payment ready for completion:", paymentId, txid)
            
            try {
              const completeUrl = getCompleteUrl(paymentId)
              const response = await fetch(completeUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  txid,
                  plan_id: plan.id,
                  payment_id: paymentId
                })
              })

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || "Échec de la finalisation du paiement")
              }

              const data = await response.json()
              console.log("🎉 Payment completed successfully:", data)
              
              // Sauvegarder l'abonnement dans localStorage
              const subscriptionData = {
                planId: plan.id,
                planName: plan.name,
                amount: plan.amount,
                activatedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + (plan.duration === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString(),
                txid,
                paymentId
              }
              localStorage.setItem('hinos_subscription', JSON.stringify(subscriptionData))
              
              resolve()
            } catch (error) {
              console.error("❌ Completion error:", error)
              reject(error)
            }
          },

          // User cancelled the payment
          onCancel: (paymentId: string) => {
            console.log("❌ Payment cancelled:", paymentId)
            reject(new Error("PAYMENT_CANCELLED"))
          },

          // Payment error occurred
          onError: (error: Error, payment?: { paymentId: string }) => {
            console.error("❌ Payment error:", error, payment)
            reject(error)
          }
        })
      })

      await paymentPromise
      
      setIsProcessing(false)
      callbacks?.onSuccess?.()
      
    } catch (error) {
      console.error("❌ Payment initialization error:", error)
      setIsProcessing(false)
      
      let errorMsg = "Erreur lors du paiement"
      if (error instanceof Error) {
        if (error.message === "PAYMENT_CANCELLED") {
          errorMsg = "Paiement annulé"
          callbacks?.onCancel?.()
        } else {
          errorMsg = error.message
        }
      }
      
      setPaymentError(errorMsg)
      callbacks?.onError?.(errorMsg)
    }
  }, [accessToken])

  // Vérifier si le SDK Pi est disponible
  const isPiSDKAvailable = typeof window !== 'undefined' && typeof window.Pi !== 'undefined'

  return {
    initiatePayment,
    isProcessing,
    paymentError,
    clearError,
    plans: SUBSCRIPTION_PLANS,
    lastPaymentId,
    isPiSDKAvailable
  }
}

// Hook simplifié pour les paiements (sans SDK, mode simulation)
export function useSimulatedPayment() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const initiatePayment = async (plan: SubscriptionPlan, callbacks?: PaymentCallbacks) => {
    setIsProcessing(true)
    setPaymentError(null)

    try {
      console.log("💰 [SIMULATION] Initiating payment for plan:", plan.name)
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Sauvegarder l'abonnement dans localStorage
      const subscriptionData = {
        planId: plan.id,
        planName: plan.name,
        amount: plan.amount,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (plan.duration === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        txid: `simulated_${Date.now()}`,
        paymentId: `simulated_payment_${Date.now()}`
      }
      localStorage.setItem('hinos_subscription', JSON.stringify(subscriptionData))
      
      console.log("✅ [SIMULATION] Payment completed successfully")
      
      setIsProcessing(false)
      callbacks?.onSuccess?.()
      
    } catch (error) {
      console.error("❌ [SIMULATION] Payment error:", error)
      setIsProcessing(false)
      const errorMsg = error instanceof Error ? error.message : "Erreur lors du paiement"
      setPaymentError(errorMsg)
      callbacks?.onError?.(errorMsg)
    }
  }

  return {
    initiatePayment,
    isProcessing,
    paymentError,
    clearError: () => setPaymentError(null),
    plans: SUBSCRIPTION_PLANS
  }
}