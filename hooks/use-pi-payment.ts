"use client"

import { useState } from "react"
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
      }) => Promise<any>
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

export function usePiPayment(accessToken: string | null) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const initiatePayment = async (
    plan: SubscriptionPlan,
    callbacks?: PaymentCallbacks
  ) => {
    if (!accessToken) {
      const error = "Non authentifié. Veuillez vous reconnecter."
      setPaymentError(error)
      callbacks?.onError?.(error)
      return
    }

    if (typeof window.Pi === "undefined") {
      const error = "Pi SDK non disponible. Veuillez rafraîchir la page."
      setPaymentError(error)
      callbacks?.onError?.(error)
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      console.log("[v0] Initiating Pi payment for plan:", plan.name)

      const paymentData = {
        amount: plan.amount,
        memo: `Abonnement ${plan.name} - Hosni IA`,
        metadata: {
          subscription_plan: plan.id,
          duration: plan.duration,
          timestamp: Date.now()
        }
      }

      await window.Pi.createPayment(paymentData, {
        // Step 1: Payment created, send to backend for approval
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("[v0] Payment ready for approval:", paymentId)
          
          try {
            const response = await fetch(BACKEND_URLS.APPROVE_PAYMENT(paymentId), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: accessToken,
              },
              body: JSON.stringify({
                plan_id: plan.id,
                amount: plan.amount
              })
            })

            if (!response.ok) {
              throw new Error("Échec de l'approbation du paiement")
            }

            console.log("[v0] Payment approved by backend")
          } catch (error) {
            console.error("[v0] Approval error:", error)
            throw error
          }
        },

        // Step 2: Payment completed on blockchain, finalize on backend
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log("[v0] Payment ready for completion:", paymentId, txid)
          
          try {
            const response = await fetch(BACKEND_URLS.COMPLETE_PAYMENT(paymentId), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: accessToken,
              },
              body: JSON.stringify({
                txid,
                plan_id: plan.id
              })
            })

            if (!response.ok) {
              throw new Error("Échec de la finalisation du paiement")
            }

            const data = await response.json()
            console.log("[v0] Payment completed successfully:", data)
            
            setIsProcessing(false)
            callbacks?.onSuccess?.()
          } catch (error) {
            console.error("[v0] Completion error:", error)
            setIsProcessing(false)
            const errorMsg = "Erreur lors de la finalisation du paiement"
            setPaymentError(errorMsg)
            callbacks?.onError?.(errorMsg)
          }
        },

        // User cancelled the payment
        onCancel: (paymentId: string) => {
          console.log("[v0] Payment cancelled:", paymentId)
          setIsProcessing(false)
          callbacks?.onCancel?.()
        },

        // Payment error occurred
        onError: (error: Error, payment?: { paymentId: string }) => {
          console.error("[v0] Payment error:", error, payment)
          setIsProcessing(false)
          const errorMsg = error.message || "Erreur lors du paiement"
          setPaymentError(errorMsg)
          callbacks?.onError?.(errorMsg)
        }
      })
    } catch (error) {
      console.error("[v0] Payment initialization error:", error)
      setIsProcessing(false)
      const errorMsg = error instanceof Error ? error.message : "Erreur lors de l'initialisation du paiement"
      setPaymentError(errorMsg)
      callbacks?.onError?.(errorMsg)
    }
  }

  const clearError = () => setPaymentError(null)

  return {
    initiatePayment,
    isProcessing,
    paymentError,
    clearError,
    plans: SUBSCRIPTION_PLANS
  }
}
