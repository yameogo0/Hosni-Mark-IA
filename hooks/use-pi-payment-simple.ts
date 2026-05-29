'use client'

import { useState, useCallback } from 'react'

export function usePiPaymentSimple() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const initiatePayment = useCallback(async (config: any) => {
    setIsProcessing(true)
    setError(null)
    setPaymentStatus('🔄 Création du paiement...')

    try {
      // 1. Créer le paiement
      const createResponse = await fetch('/api/pi/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          planId: config.planId,
          amount: config.amount
        })
      })

      const createData = await createResponse.json()
      if (!createData.success) throw new Error(createData.error)
      
      const paymentId = createData.paymentId
      setPaymentStatus('📝 Paiement créé, en attente d\'approbation...')

      // 2. Attendre l'approbation du serveur
      const approveResponse = await fetch('/api/pi/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          paymentId
        })
      })

      await approveResponse.json()
      setPaymentStatus('✅ Paiement approuvé !')

      // 3. Finaliser le paiement
      setPaymentStatus('🔄 Finalisation...')
      const completeResponse = await fetch('/api/pi/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          paymentId,
          txid: `tx_${Date.now()}`,
          planId: config.planId
        })
      })

      const completeData = await completeResponse.json()
      
      if (completeData.success) {
        localStorage.setItem('hinos_subscription', JSON.stringify(completeData.subscription))
        setPaymentStatus('✅ Abonnement activé !')
        return { success: true, subscription: completeData.subscription }
      } else {
        throw new Error(completeData.error)
      }

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