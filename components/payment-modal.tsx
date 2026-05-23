"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Crown, Zap, CheckCircle2, AlertCircle, CreditCard, Shield, Clock } from "lucide-react"
import { usePiPayment, type SubscriptionPlan } from "@/hooks/use-pi-payment"
import { useState, useEffect, useCallback } from "react"
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
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmedPlan, setConfirmedPlan] = useState<SubscriptionPlan | null>(null)

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPlan(null)
      setShowSuccess(false)
      setShowConfirmation(false)
      setConfirmedPlan(null)
      clearError()
    }
  }, [isOpen, clearError])

  const handlePlanSelect = useCallback((plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowConfirmation(true)
  }, [])

  const handleConfirmPayment = useCallback(async () => {
    if (!confirmedPlan) return
    
    await initiatePayment(confirmedPlan, {
      onSuccess: () => {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          setShowConfirmation(false)
          setConfirmedPlan(null)
          onClose()
          onPaymentSuccess?.()
        }, 2000)
      },
      onCancel: () => {
        setShowConfirmation(false)
        setConfirmedPlan(null)
        setSelectedPlan(null)
      },
      onError: () => {
        setShowConfirmation(false)
        setConfirmedPlan(null)
      }
    })
  }, [confirmedPlan, initiatePayment, onClose, onPaymentSuccess])

  const handleClose = () => {
    if (!isProcessing) {
      clearError()
      setSelectedPlan(null)
      setShowSuccess(false)
      setShowConfirmation(false)
      setConfirmedPlan(null)
      onClose()
    }
  }

  const formatPrice = (amount: number) => {
    return amount.toFixed(2).replace('.', ',')
  }

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-green-700">Paiement Réussi !</h3>
              <p className="text-sm text-muted-foreground">
                Votre abonnement a été activé avec succès.
              </p>
              <p className="text-xs text-muted-foreground">
                Vous allez être redirigé dans quelques secondes...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (showConfirmation && confirmedPlan) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmation de paiement</DialogTitle>
            <DialogDescription>
              Vérifiez les détails de votre abonnement avant de confirmer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-semibold">{confirmedPlan.name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prix</span>
                <span className="text-xl font-bold" style={{ color: COLORS.PRIMARY }}>
                  {formatPrice(confirmedPlan.amount)} π
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Durée</span>
                <span>{confirmedPlan.duration === "weekly" ? "7 jours" : "30 jours"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>Paiement sécurisé via Pi Network</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmation(false)
                setConfirmedPlan(null)
              }}
              className="flex-1"
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="flex-1"
              style={{ backgroundColor: COLORS.PRIMARY }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirmer
                </>
              )}
            </Button>
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
            const isPro = plan.id === "monthly_pro"
            const isPopular = plan.id === "premium_monthly"

            return (
              <div
                key={plan.id}
                className={`relative border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                  isPopular ? "border-primary bg-primary/5" : "border-border bg-background"
                }`}
              >
                {isPopular && (
                  <Badge 
                    className="absolute -top-2 left-4 text-xs px-2 py-0.5"
                    style={{ backgroundColor: COLORS.PRIMARY }}
                  >
                    ⭐ Populaire
                  </Badge>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isPopular ? (
                        <Crown className="w-5 h-5 text-primary" />
                      ) : (
                        <Zap className="w-5 h-5 text-primary" />
                      )}
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                    </div>
                    {plan.duration === "weekly" && (
                      <Badge variant="outline" className="text-xs">
                        7 jours
                      </Badge>
                    )}
                    {plan.duration === "monthly" && (
                      <Badge variant="outline" className="text-xs">
                        30 jours
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground italic">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold" style={{ color: COLORS.PRIMARY }}>
                      {formatPrice(plan.amount)} π
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {plan.duration === "weekly" ? "semaine" : "mois"}
                    </span>
                  </div>

                  <ul className="space-y-2 pt-2">
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-muted-foreground pl-6">
                        +{plan.features.length - 4} autres avantages
                      </li>
                    )}
                  </ul>

                  <Button
                    className="w-full mt-2"
                    style={{ backgroundColor: COLORS.PRIMARY }}
                    onClick={() => {
                      setConfirmedPlan(plan)
                      setShowConfirmation(true)
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing && selectedPlan?.id === plan.id ? (
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
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[8px] font-bold" style={{ color: COLORS.PRIMARY }}>π</span>
            </div>
            <span>Paiement sécurisé et décentralisé</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Accès immédiat</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Sans engagement</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}