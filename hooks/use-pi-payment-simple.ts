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
      // Vérifier si le SDK Pi est disponible
      if (typeof window === 'undefined' || !window.Pi) {
        throw new Error('SDK Pi non disponible')
      }

      console.log('💰 Création du paiement Pi:', config)

      // Créer le paiement avec les callbacks officiels
      const paymentResult = await new Promise<{ paymentId: string; txid: string }>((resolve, reject) => {
        window.Pi.createPayment(
          {
            amount: config.amount,
            memo: config.memo,
            metadata: { planId: config.planId }
          },
          {
            onReadyForServerApproval: async (paymentId: string) => {
              console.log('📝 Approbation serveur:', paymentId)
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
              console.log('✅ Finalisation:', paymentId, txid)
              setPaymentStatus('Finalisation en cours...')
              
              // Appeler l'API pour compléter
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
                resolve({ paymentId, txid })
              } else {
                reject(new Error('Erreur finalisation'))
              }
            },
            onCancel: (paymentId: string) => {
              console.log('❌ Paiement annulé:', paymentId)
              reject(new Error('Paiement annulé par l\'utilisateur'))
            },
            onError: (err: Error) => {
              console.error('❌ Erreur Pi:', err)
              reject(err)
            }
          }
        )
      })

      // Calculer la date d'expiration
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
      setPaymentStatus('✅ Abonnement activé avec succès !')
      
      return {
        success: true,
        paymentId: paymentResult.paymentId,
        txid: paymentResult.txid,
        subscription: subscriptionData
      }
      
    } catch (err: any) {
      const errorMsg = err?.message || 'Erreur d\'activation'
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