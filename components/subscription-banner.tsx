"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, ImageIcon, Infinity, Crown, Shield, Zap, MessageCircle, CheckCircle2, Clock, Wallet, TrendingUp } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { COLORS } from "@/lib/app-config"
import { useState, useEffect } from "react"

interface SubscriptionBannerProps {
  onSubscribeClick?: () => void
  currentPlan?: "free" | "weekly" | "monthly" | null
  daysLeft?: number
}

export function SubscriptionBanner({ onSubscribeClick, currentPlan, daysLeft }: SubscriptionBannerProps) {
  const [savedPlan, setSavedPlan] = useState<"free" | "weekly" | "monthly" | null>(null)
  const [savedDaysLeft, setSavedDaysLeft] = useState<number | null>(null)

  useEffect(() => {
    // Vérifier l'abonnement dans localStorage
    const saved = localStorage.getItem('hinos_subscription')
    if (saved) {
      try {
        const sub = JSON.parse(saved)
        if (sub.active && new Date(sub.expiresAt) > new Date()) {
          const plan = sub.planId === 'pro_weekly' ? 'weekly' : 'monthly'
          setSavedPlan(plan)
          const days = Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 3600 * 24))
          setSavedDaysLeft(days)
        }
      } catch (e) {
        console.error('Erreur lecture abonnement:', e)
      }
    }
  }, [])

  const activePlan = currentPlan || savedPlan
  const activeDaysLeft = daysLeft || savedDaysLeft

  const plans = [
    {
      id: "free",
      name: "Gratuit",
      price: 0,
      period: "toujours",
      features: [
        { text: "10 questions par jour", icon: <MessageCircle className="w-3 h-3" /> },
        { text: "Accès aux réponses générales", icon: <Sparkles className="w-3 h-3" /> }
      ],
      icon: <MessageCircle className="w-4 h-4 text-muted-foreground" />
    },
    {
      id: "weekly",
      name: "Hebdomadaire",
      price: 5,
      period: "semaine",
      features: [
        { text: "Questions illimitées", icon: <Infinity className="w-3 h-3" /> },
        { text: "Recherche par image", icon: <ImageIcon className="w-3 h-3" /> },
        { text: "Pas de restriction quotidienne", icon: <Zap className="w-3 h-3" /> }
      ],
      icon: <Zap className="w-4 h-4 text-primary" />
    },
    {
      id: "monthly",
      name: "Mensuel Pro",
      price: 15,
      period: "mois",
      features: [
        { text: "Tous les avantages hebdomadaires", icon: <CheckCircle2 className="w-3 h-3" /> },
        { text: "Analyses approfondies", icon: <TrendingUp className="w-3 h-3" /> },
        { text: "Support prioritaire", icon: <Shield className="w-3 h-3" /> }
      ],
      icon: <Crown className="w-4 h-4 text-primary" />
    }
  ]

  return (
    <Card className="mb-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-5 h-5 text-primary" />
          {activePlan && activePlan !== "free" ? (
            <span>🎉 Votre abonnement {activePlan === "weekly" ? "Hebdomadaire" : "Pro"} est actif !</span>
          ) : (
            "Abonnez-vous et Débloquez la Puissance Totale"
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan actif */}
        {activePlan && activePlan !== "free" && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold text-sm text-green-800">Abonnement actif</h4>
              </div>
              <Badge className="bg-green-600 text-white text-xs">
                {activePlan === "weekly" ? "Hebdomadaire" : "Mensuel Pro"}
              </Badge>
            </div>
            {activeDaysLeft !== null && activeDaysLeft > 0 && (
              <div className="flex items-center gap-2 text-xs text-green-700">
                <Clock className="w-3 h-3" />
                <span>{activeDaysLeft} jour{activeDaysLeft > 1 ? 's' : ''} restant{activeDaysLeft > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}

        {/* Plans */}
        {!activePlan || activePlan === "free" ? (
          <>
            <div className="space-y-3">
              {plans.filter(p => p.id !== "free").map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-background/80 rounded-lg p-3 border-2 transition-all hover:shadow-md ${
                    plan.id === "monthly" ? "border-primary/30 bg-primary/5" : "border-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {plan.icon}
                      <h5 className="font-semibold text-sm">{plan.name}</h5>
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/40">
                      {plan.price} π / {plan.period}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 italic">
                    {plan.id === "weekly" 
                      ? "Idéal pour tester ou résoudre un défi à court terme"
                      : "Pour une croissance continue – Économisez plus!"}
                  </p>
                  <ul className="space-y-1 text-xs">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-primary mt-0.5 flex-shrink-0">{feature.icon}</span>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            {/* Pi Network Payment Info */}
            <div className="bg-background/60 rounded-lg p-3 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-primary" />
                <h5 className="font-semibold text-sm">Paiement Pi Network</h5>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Finance décentralisée et sécurisée. Abonnez-vous en quelques clics avec votre portefeuille Pi, sans intermédiaire.
              </p>
              
              {onSubscribeClick && (
                <Button
                  className="w-full transition-all hover:shadow-md"
                  style={{ backgroundColor: COLORS.PRIMARY }}
                  onClick={onSubscribeClick}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  S&apos;abonner maintenant
                </Button>
              )}
            </div>
          </>
        ) : (
          // Si déjà abonné, afficher un message
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-primary">Vous avez déjà accès à toutes les fonctionnalités premium !</p>
            <p className="text-xs text-muted-foreground mt-1">Profitez pleinement de Hosni IA</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => window.location.href = "/"}
            >
              Retour au chat
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}