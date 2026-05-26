'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown, Loader2 } from "lucide-react"
import { usePiPaymentSimple } from "@/hooks/use-pi-payment-simple"

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess?: () => void
}

export function SubscriptionModal({ isOpen, onClose, onPaymentSuccess }: SubscriptionModalProps) {
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
      onPaymentSuccess?.()
      setTimeout(() => onClose(), 2000)
    }
    setSelectedPlan(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Abonnements Premium
          </DialogTitle>
          <DialogDescription>
            Choisissez votre formule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            onClick={() => handleSubscribe('pro_weekly', 5.99, 'Pro')}
            disabled={isProcessing}
            className="w-full"
            variant="outline"
          >
            {isProcessing && selectedPlan === 'pro_weekly' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Pro - 5.99 π / semaine
          </Button>

          <Button
            onClick={() => handleSubscribe('premium_monthly', 19.99, 'Premium')}
            disabled={isProcessing}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isProcessing && selectedPlan === 'premium_monthly' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Premium - 19.99 π / mois
          </Button>
        </div>

        {paymentStatus && (
          <p className="text-sm text-center text-muted-foreground">{paymentStatus}</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

import { useState } from 'react'