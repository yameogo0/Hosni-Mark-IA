"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Crown, Zap, CheckCircle2, AlertCircle } from "lucide-react"
import { usePiPayment, type SubscriptionPlan } from "@/hooks/use-pi-payment"
import { useState } from "react"
import { COLORS } from "@/lib/app-config"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  accessToken: string | null
  onPaymentSuccess?: () => void
}

export function PaymentModal({ isOpen, onClose, accessToken, onPaymentSuccess }: PaymentModalProps) {
  const { initiatePayment, isProcessing, paymentError, clearError, plans } = usePiPayment(accessToken)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handlePayment = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    clearError()
    
    await initiatePayment(plan, {
      onSuccess: () => {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          onClose()
          onPaymentSuccess?.()
        }, 2000)
      },
      onCancel: () => {
        setSelectedPlan(null)
      },
      onError: () => {
        setSelectedPlan(null)
      }
    })
  }

  const handleClose = () => {
    if (!isProcessing) {
      clearError()
      setSelectedPlan(null)
      setShowSuccess(false)
      onClose()
    }
  }

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Paiement Réussi!</h3>
              <p className="text-sm text-muted-foreground">
                Votre abonnement a été activé avec succès.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Choisissez Votre Abonnement Premium
          </DialogTitle>
          <DialogDescription>
            Débloquez toutes les fonctionnalités de Hosni IA avec un paiement sécurisé Pi Network
          </DialogDescription>
        </DialogHeader>

        {paymentError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          {plans.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id
            const isPro = plan.id === "monthly_pro"

            return (
              <div
                key={plan.id}
                className={`relative border-2 rounded-lg p-4 transition-all ${
                  isPro ? "border-primary bg-primary/5" : "border-border bg-background"
                }`}
              >
                {isPro && (
                  <Badge 
                    className="absolute top-3 right-3 text-xs"
                    style={{ backgroundColor: COLORS.PRIMARY }}
                  >
                    Populaire
                  </Badge>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {isPro ? (
                      <Crown className="w-5 h-5 text-primary" />
                    ) : (
                      <Zap className="w-5 h-5 text-primary" />
                    )}
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground italic">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold" style={{ color: COLORS.PRIMARY }}>
                      {plan.amount} π
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {plan.duration === "weekly" ? "semaine" : "mois"}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    style={{ backgroundColor: COLORS.PRIMARY }}
                    onClick={() => handlePayment(plan)}
                    disabled={isProcessing}
                  >
                    {isProcessing && isSelected ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>Souscrire maintenant</>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border-t pt-4">
          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[8px] font-bold" style={{ color: COLORS.PRIMARY }}>π</span>
          </div>
          <span>Paiement sécurisé et décentralisé via Pi Network</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
