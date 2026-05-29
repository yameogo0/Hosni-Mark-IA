'use client'

import { useState, useCallback } from 'react'

// 🔥 Désactiver la simulation pour les vrais paiements
const SIMULATION_MODE = false;

export function usePiPaymentSimple() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const initiatePayment = useCallback(async (config: any) => {
    setIsProcessing(true)
    setError(null)
    setPaymentStatus('🔄 Création du paiement...')

    try {
      // Vérifier que le SDK Pi est disponible
      if (typeof window === 'undefined' || !window.Pi) {
        throw new Error('Pi SDK non disponible. Veuillez utiliser le Pi Browser.')
      }

      // 1. Créer le paiement avec Pi SDK
      const paymentPromise = new Promise((resolve, reject) => {
        window.Pi.createPayment(
          {
            amount: config.amount,
            memo: config.memo,
            metadata: { planId: config.planId }
          },
          {
            // Phase I: Server-Side Approval
            onReadyForServerApproval: async (paymentId: string) => {
              console.log("📝 Phase I - Approbation serveur:", paymentId)
              setPaymentStatus('Approbation serveur...')
              
              try {
                const response = await fetch('/api/pi/payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'approve',
                    paymentId
                  })
                })
                
                if (!response.ok) {
                  throw new Error('Erreur approbation serveur')
                }
                console.log("✅ Phase I - Approuvé")
              } catch (err) {
                reject(err)
              }
            },
            
            // Phase III: Server-Side Completion
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              console.log("📝 Phase III - Finalisation:", paymentId, txid)
              setPaymentStatus('Finalisation...')
              
              try {
                const response = await fetch('/api/pi/payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'complete',
                    paymentId,
                    txid,
                    planId: config.planId
                  })
                })
                
                const data = await response.json()
                if (data.success) {
                  localStorage.setItem('hinos_subscription', JSON.stringify(data.subscription))
                  console.log("✅ Phase III - Complété")
                  resolve(data)
                } else {
                  reject(new Error(data.error))
                }
              } catch (err) {
                reject(err)
              }
            },
            
            onCancel: (paymentId: string) => {
              console.log("❌ Paiement annulé:", paymentId)
              reject(new Error('Paiement annulé'))
            },
            
            onError: (error: Error) => {
              console.error("❌ Erreur Pi:", error)
              reject(error)
            }
          }
        )
      })

      await paymentPromise
      setPaymentStatus('✅ Abonnement activé !')
      return { success: true }

    } catch (err: any) {
      const errorMsg = err?.message || 'Erreur de paiement'
      setError(errorMsg)
      setPaymentStatus('❌ ' + errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    initiatePayment,
    isProcessing,
    paymentStatus,
    error,
    resetStatus: () => {}
  }
}