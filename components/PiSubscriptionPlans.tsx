'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Loader2, Crown } from 'lucide-react'
import { usePiPaymentSimple } from '@/hooks/use-pi-payment-simple'

interface Plan {
  id: string
  name: string
  price: number
  duration: string
  description: string
  features: string[]
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'pro_weekly',
    name: 'Pro',
    price: 5.99,
    duration: '7 jours',
    description: 'Parfait pour tester',
    features: [
      'Analyses illimitées',
      'Support par email',
      'Export des rapports',
      'Accès à la communauté'
    ]
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    price: 19.99,
    duration: '30 jours',
    description: 'Notre meilleur plan',
    features: [
      'Tout ce qui est dans Pro',
      'Support prioritaire 24/7',
      'API personnalisée',
      'Rapports avancés',
      'Conseils personnalisés',
      'Pas de publicités'
    ],
    popular: true
  }
]

export function PiSubscriptionPlans() {
  const { initiatePayment, isProcessing, paymentStatus, resetStatus } = usePiPaymentSimple()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [localMessage, setLocalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubscribe = async (plan: Plan) => {
    setSelectedPlanId(plan.id)
    setLocalMessage(null)
    resetStatus()

    try {
      const result = await initiatePayment({
        amount: plan.price,
        planId: plan.id,
        memo: `Abonnement ${plan.name} - ${plan.duration}`
      })

      if (result.success && result.subscription) {
        localStorage.setItem('hinos_subscription', JSON.stringify(result.subscription))
        setLocalMessage({ type: 'success', text: `✅ Abonnement ${plan.name} activé avec succès !` })
        
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setLocalMessage({ type: 'error', text: result.error || '❌ Erreur lors du paiement' })
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      setLocalMessage({ type: 'error', text: '❌ Erreur inattendue. Veuillez réessayer.' })
    } finally {
      setSelectedPlanId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Plans d&apos;abonnement</h2>
        <p className="text-gray-600">Choisissez le plan qui vous convient le mieux</p>
      </div>

      {paymentStatus && !localMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-blue-800">{paymentStatus}</p>
          </div>
        </div>
      )}

      {localMessage && (
        <div className={`rounded-lg p-4 text-center ${
          localMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {localMessage.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {PLANS.map((plan) => (
          <div key={plan.id} className="relative">
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  ⭐ Populaire
                </span>
              </div>
            )}

            <Card className={`h-full transition-all ${
              plan.popular ? 'border-2 border-purple-500 shadow-xl' : 'border-gray-200'
            } ${selectedPlanId === plan.id ? 'opacity-75' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">{plan.name}</span>
                  {plan.popular && <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price}π
                  </div>
                  <p className="text-sm text-gray-600">pour {plan.duration}</p>
                </div>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isProcessing || selectedPlanId !== null}
                  className={`w-full py-6 text-base font-semibold ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md'
                      : 'bg-gray-800 hover:bg-gray-900'
                  } text-white transition-all`}
                >
                  {selectedPlanId === plan.id && isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      S&apos;abonner
                    </>
                  )}
                </Button>

                <ul className="space-y-3 pt-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}