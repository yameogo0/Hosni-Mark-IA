'use client'

import { useState, useCallback } from 'react'

export interface PiPaymentConfig {
  amount: number
  planId: string
  memo: string
}

export interface PiPaymentResult {
  success: boolean
  paymentId?: string
  txid?: string
  subscription?: {
    planId: string
    active: boolean
    activatedAt: string
    expiresAt: string
  }
  error?: string
}

export function usePiPaymentSimple() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const initiatePayment = useCallback(async (config: PiPaymentConfig): Promise<PiPaymentResult> => {
    setIsProcessing(true)
    setError(null)
    setPaymentStatus('🔄 Préparation du paiement...')

    try {
      // Vérifier que le SDK Pi est disponible
      if (typeof window === 'undefined' || !window.Pi) {
        throw new Error('Pi SDK non disponible. Veuillez utiliser le Pi Browser.')
      }

      console.log('💰 Création du paiement Pi:', config)

      // Créer une promesse pour gérer le paiement
      return new Promise((resolve, reject) => {
        window.Pi.createPayment(
          {
            amount: config.amount,
            memo: config.memo,
            metadata: { planId: config.planId }
          },
          {
            onReadyForServerApproval: async (paymentId: string) => {
              console.log('📝 Paiement approuvé côté serveur:', paymentId)
              setPaymentStatus('Approbation en cours...')
              
              // Appeler l'API pour approuver
              const response = await fetch('/api/pi/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'approve',
                  paymentId: paymentId
                })
              })
              
              if (!response.ok) {
                reject(new Error('Erreur approbation'))
              }
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              console.log('✅ Paiement finalisé:', paymentId, txid)
              setPaymentStatus('Finalisation...')
              
              const response = await fetch('/api/pi/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'complete',
                  paymentId: paymentId,
                  txid: txid,
                  planId: config.planId
                })
              })
              
              const data = await response.json()
              if (data.success) {
                const durationDays = config.planId === 'pro_weekly' ? 7 : 30
                const expiresAt = new Date()
                expiresAt.setDate(expiresAt.getDate() + durationDays)
                
                const subscriptionData = {
                  planId: config.planId,
                  active: true,
                  activatedAt: new Date().toISOString(),
                  expiresAt: expiresAt.toISOString()
                }
                localStorage.setItem('hinos_subscription', JSON.stringify(subscriptionData))
                setPaymentStatus('✅ Abonnement activé !')
                resolve({ success: true, paymentId, txid, subscription: subscriptionData })
              } else {
                reject(new Error('Erreur finalisation'))
              }
            },
            onCancel: (paymentId: string) => {
              console.log('❌ Paiement annulé:', paymentId)
              reject(new Error('Paiement annulé'))
            },
            onError: (err: Error) => {
              console.error('❌ Erreur Pi:', err)
              reject(err)
            }
          }
        )
      })
      
    } catch (err: any) {
      const errorMsg = err?.message || 'Erreur de paiement'
      console.error('❌ Erreur:', errorMsg)
      setError(errorMsg)
      setPaymentStatus('❌ ' + errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const resetStatus = useCallback(() => {
    setPaymentStatus('')
    setError(null)
    setIsProcessing(false)
  }, [])

  return {
    initiatePayment,
    isProcessing,
    paymentStatus,
    error,
    resetStatus
  }
}