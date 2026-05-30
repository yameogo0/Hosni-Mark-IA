'use client'

import { useState, useCallback } from 'react'

// 🔥 Mode simulation - Activer pour éviter le vrai paiement et le compte à rebours
const SIMULATION_MODE = true

export function usePiPaymentSimple() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const initiatePayment = useCallback(async (config: any) => {
    setIsProcessing(true)
    setError(null)
    setPaymentStatus('🔄 Activation...')

    try {
      // 🔥 MODE SIMULATION - Pas de compte à rebours, succès immédiat
      if (SIMULATION_MODE) {
        console.log('🏖️ Mode simulation - Paiement simulé pour:', config.planId)
        
        // Petit délai pour l'effet visuel (sans compte à rebours)
        await new Promise(resolve => setTimeout(resolve, 800))
        
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
        
        return { 
          success: true, 
          subscription: subscriptionData,
          paymentId: 'sim_' + Date.now(),
          txid: 'sim_tx_' + Date.now()
        }
      }

      // 🔥 MODE RÉEL - (désactivé car SIMULATION_MODE = true)
      if (typeof window === 'undefined' || !window.Pi) {
        throw new Error('Pi SDK non disponible. Veuillez utiliser le Pi Browser.')
      }

      console.log('💰 Début du paiement réel pour:', config.planId)

      const paymentPromise = new Promise((resolve, reject) => {
        window.Pi.createPayment(
          {
            amount: config.amount,
            memo: config.memo,
            metadata: { planId: config.planId }
          },
          {
            onReadyForServerApproval: async (paymentId: string) => {
              console.log("📝 Approbation serveur:", paymentId)
              setPaymentStatus('Approbation en cours...')
              
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
                console.log("✅ Paiement approuvé")
              } catch (err) {
                reject(err)
              }
            },
            
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              console.log("📝 Finalisation:", paymentId, txid)
              setPaymentStatus('Finalisation en cours...')
              
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
                  console.log("✅ Paiement complété avec succès")
                  resolve(data)
                } else {
                  reject(new Error(data.error || 'Erreur finalisation'))
                }
              } catch (err) {
                reject(err)
              }
            },
            
            onCancel: (paymentId: string) => {
              console.log("❌ Paiement annulé:", paymentId)
              reject(new Error('Paiement annulé par l\'utilisateur'))
            },
            
            onError: (error: Error) => {
              console.error("❌ Erreur Pi SDK:", error)
              reject(error)
            }
          }
        )
      })

      await paymentPromise
      setPaymentStatus('✅ Abonnement activé avec succès !')
      return { success: true }

    } catch (err: any) {
      const errorMsg = err?.message || 'Erreur de paiement'
      console.error('❌ Erreur:', errorMsg)
      setError(errorMsg)
      setPaymentStatus(`❌ ${errorMsg}`)
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