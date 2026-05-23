"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Megaphone, ShoppingCart, BarChart3, Rocket } from "lucide-react"

export function WelcomeMessage() {
  const keyFeatures = [
    {
      icon: Lightbulb,
      title: "Conseils Stratégiques",
      items: ["Stratégie de marque", "Études de marché", "Positionnement"]
    },
    {
      icon: Megaphone,
      title: "Marketing Numérique",
      items: ["Social Media", "SEO", "Publicités en ligne", "Marketing de contenu"]
    },
    {
      icon: ShoppingCart,
      title: "Vente & CRM",
      items: ["Techniques de vente", "Fidélisation client", "Gestion relation client"]
    },
    {
      icon: BarChart3,
      title: "Analyse",
      items: ["Interprétation de données", "KPI", "Mesure de performance"]
    },
    {
      icon: Rocket,
      title: "Innovation",
      items: ["Tendances", "E-commerce", "Nouvelles technologies"]
    }
  ]

  return (
    <div className="space-y-4 mb-4">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold text-primary">
          Votre Expert en Marketing & Commerce
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
          Transformez votre vision commerciale en succès concret avec des analyses, 
          conseils personnalisés et solutions innovantes.
        </p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-center">Fonctionnalités Clés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {keyFeatures.map((feature) => (
            <div key={feature.title} className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold mb-1">{feature.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {feature.items.join(", ")}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-[10px] text-center text-muted-foreground italic">
        Disponible pour entrepreneurs, marketeurs et chefs d&apos;entreprise
      </p>
    </div>
  )
}
