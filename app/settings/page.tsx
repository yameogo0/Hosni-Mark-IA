"use client"

import { PiWalletManager } from "@/components/PiWalletManager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Wallet, Crown, Settings, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { usePiPaymentSimple } from "@/hooks/use-pi-payment-simple"

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'wallet' | 'subscription' | 'account'>('wallet')
  const { initiatePayment, isProcessing, paymentStatus } = usePiPaymentSimple()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSubscribe = async (planId: string, amount: number, name: string) => {
    setSelectedPlan(planId)
    const result = await initiatePayment({
      amount,
      planId,
      memo: `Abonnement ${name}`
    })

    if (result.success) {
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
    setSelectedPlan(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/")} className="shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Paramètres
            </h1>
            <p className="text-sm text-muted-foreground">Gérez votre wallet Pi et vos abonnements</p>
          </div>
        </div>

        <div className="flex gap-2 border-b pb-2">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'wallet' ? 'bg-primary text-white shadow-md' : 'hover:bg-muted'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Wallet Pi
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'subscription' ? 'bg-primary text-white shadow-md' : 'hover:bg-muted'
            }`}
          >
            <Crown className="w-4 h-4" />
            Abonnement
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'account' ? 'bg-primary text-white shadow-md' : 'hover:bg-muted'
            }`}
          >
            <Settings className="w-4 h-4" />
            Compte
          </button>
        </div>

        {activeTab === 'wallet' && <PiWalletManager />}
        
        {activeTab === 'subscription' && (
          <Card>
            <CardHeader>
              <CardTitle>Plans d'abonnement</CardTitle>
              <CardDescription>Accédez à des fonctionnalités premium avec Hosni IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentStatus && (
                <div className="bg-blue-50 p-3 rounded-lg text-center text-blue-700 text-sm">
                  {paymentStatus}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="text-xl font-bold">Pro</h3>
                  <p className="text-2xl font-bold text-primary mt-2">5.99π</p>
                  <p className="text-sm text-muted-foreground">pour 7 jours</p>
                  <Button 
                    onClick={() => handleSubscribe('pro_weekly', 5.99, 'Pro')}
                    disabled={isProcessing}
                    className="mt-4 w-full"
                  >
                    {isProcessing && selectedPlan === 'pro_weekly' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    S'abonner
                  </Button>
                </div>
                <div className="border-2 border-primary rounded-lg p-4 text-center relative">
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-3 py-0.5 rounded-full text-xs">
                    Populaire
                  </span>
                  <h3 className="text-xl font-bold">Premium</h3>
                  <p className="text-2xl font-bold text-primary mt-2">19.99π</p>
                  <p className="text-sm text-muted-foreground">pour 30 jours</p>
                  <Button 
                    onClick={() => handleSubscribe('premium_monthly', 19.99, 'Premium')}
                    disabled={isProcessing}
                    className="mt-4 w-full bg-primary"
                  >
                    {isProcessing && selectedPlan === 'premium_monthly' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    S'abonner
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'account' && (
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du compte</CardTitle>
              <CardDescription>Gérez vos préférences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Version 1.0.0 • Propulsé par Pi Network
              </p>
              <Link href="/diagnostic" className="text-sm text-primary hover:underline">
                🔍 Diagnostic Pi Network
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}