'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Loader2, Crown } from 'lucide-react'
import { usePiPaymentSimple } from '@/hooks/use-pi-payment-simple'
import { useLanguage } from '@/contexts/LanguageContext'

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
    duration: '7days',
    description: 'perfectForTest',
    features: [
      'unlimitedQuestions',
      'emailSupport',
      'exportReports',
      'communityAccess'
    ]
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    price: 19.99,
    duration: '30days',
    description: 'bestPlan',
    features: [
      'allProFeatures',
      'prioritySupport247',
      'customApi',
      'advancedReports',
      'personalizedAdvice',
      'noAds'
    ],
    popular: true
  }
]

export function PiSubscriptionPlans() {
  const { t } = useLanguage()
  const { initiatePayment, isProcessing, paymentStatus, resetStatus } = usePiPaymentSimple()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [localMessage, setLocalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Vérifier l'abonnement existant
  useEffect(() => {
    const saved = localStorage.getItem('hinos_subscription')
    if (saved) {
      try {
        const sub = JSON.parse(saved)
        if (sub.active && new Date(sub.expiresAt) > new Date()) {
          const planName = sub.planId === 'pro_weekly' ? 'Pro' : 'Premium'
          setLocalMessage({ type: 'success', text: t('subscriptionAlreadyActive').replace('{plan}', planName) })
        }
      } catch (e) {
        console.error('Erreur:', e)
      }
    }
  }, [t])

  const handleSubscribe = async (plan: Plan) => {
    setSelectedPlanId(plan.id)
    setLocalMessage(null)
    resetStatus()

    try {
      const result = await initiatePayment({
        amount: plan.price,
        planId: plan.id,
        memo: `${t('subscription')} ${plan.name} - ${t(plan.duration)}`
      })

      if (result.success && result.subscription) {
        localStorage.setItem('hinos_subscription', JSON.stringify(result.subscription))
        setLocalMessage({ type: 'success', text: t('subscriptionActivated').replace('{plan}', plan.name) })
        
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setLocalMessage({ type: 'error', text: result.error || t('paymentError') })
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      setLocalMessage({ type: 'error', text: t('unexpectedError') })
    } finally {
      setSelectedPlanId(null)
    }
  }

  const getFeatureText = (featureKey: string): string => {
    const featureMap: Record<string, string> = {
      unlimitedQuestions: t('unlimitedQuestions'),
      emailSupport: t('emailSupport'),
      exportReports: t('exportReports'),
      communityAccess: t('communityAccess'),
      allProFeatures: t('allProFeatures'),
      prioritySupport247: t('prioritySupport247'),
      customApi: t('customApi'),
      advancedReports: t('advancedReports'),
      personalizedAdvice: t('personalizedAdvice'),
      noAds: t('noAds')
    }
    return featureMap[featureKey] || featureKey
  }

  const getPlanDescription = (descriptionKey: string): string => {
    const descMap: Record<string, string> = {
      perfectForTest: t('perfectForTest'),
      bestPlan: t('bestPlan')
    }
    return descMap[descriptionKey] || descriptionKey
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{t('subscriptionPlans')}</h2>
        <p className="text-gray-600">{t('choosePlan')}</p>
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
                  ⭐ {t('popular')}
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
                <CardDescription>{getPlanDescription(plan.description)}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price}π
                  </div>
                  <p className="text-sm text-gray-600">{t('for')} {t(plan.duration)}</p>
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
                      {t('processing')}...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      {t('subscribe')}
                    </>
                  )}
                </Button>

                <ul className="space-y-3 pt-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{getFeatureText(feature)}</span>
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