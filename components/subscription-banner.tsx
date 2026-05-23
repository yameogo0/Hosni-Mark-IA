"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, ImageIcon, Infinity, Crown, Shield, Zap, MessageCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { COLORS } from "@/lib/app-config"

interface SubscriptionBannerProps {
  onSubscribeClick?: () => void
}

export function SubscriptionBanner({ onSubscribeClick }: SubscriptionBannerProps) {
  return (
    <Card className="mb-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-5 h-5 text-primary" />
          Abonnez-vous et Débloquez la Puissance Totale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free Tier */}
        <div className="bg-background/60 rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Accès Gratuit</h4>
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-start gap-1.5">
              <span className="text-primary mt-0.5">•</span>
              <span>10 questions par jour pour explorer les capacités de base</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-primary mt-0.5">•</span>
              <span>Accès aux réponses générales sur le marketing et le commerce</span>
            </li>
          </ul>
        </div>

        <Separator className="my-3" />

        {/* Premium Tiers */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-center mb-3">Offres Premium</h4>
          
          {/* Weekly Plan */}
          <div className="bg-background/80 rounded-lg p-3 border-2 border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <h5 className="font-semibold text-sm">Hebdomadaire</h5>
              </div>
              <Badge variant="outline" className="text-xs border-primary/40">
                5 Pi / semaine
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2 italic">
              Idéal pour tester ou résoudre un défi à court terme
            </p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-start gap-1.5">
                <Infinity className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span>Questions illimitées</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ImageIcon className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span>Recherche par Image – Analyse marketing détaillée</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span>Pas de restriction quotidienne</span>
              </li>
            </ul>
          </div>

          {/* Monthly Plan */}
          <div className="bg-primary/10 rounded-lg p-3 border-2 border-primary relative overflow-hidden">
            <Badge className="absolute top-2 right-2 text-xs" style={{ backgroundColor: "hsl(var(--primary))" }}>
              Populaire
            </Badge>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <h5 className="font-semibold text-sm">Mensuel "Pro"</h5>
              </div>
              <Badge variant="outline" className="text-xs border-primary/40">
                15 Pi / mois
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2 italic">
              Pour une croissance continue – Économisez plus!
            </p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5 font-bold">✓</span>
                <span>Tous les avantages de l&apos;offre hebdomadaire</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5 font-bold">✓</span>
                <span>Analyses plus approfondies et plans d&apos;action étendus</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Shield className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="font-medium">Support prioritaire</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Pi Network Payment Info */}
        <div className="bg-background/60 rounded-lg p-3 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <h5 className="font-semibold text-sm">Paiement Pi Network</h5>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Finance décentralisée et sécurisée. Abonnez-vous en quelques clics avec votre portefeuille Pi, sans intermédiaire.
          </p>
          
          {onSubscribeClick && (
            <Button
              className="w-full"
              style={{ backgroundColor: COLORS.PRIMARY }}
              onClick={onSubscribeClick}
            >
              <Crown className="w-4 h-4 mr-2" />
              S&apos;abonner maintenant
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
