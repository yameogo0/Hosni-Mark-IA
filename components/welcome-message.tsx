"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Lightbulb, 
  Megaphone, 
  ShoppingCart, 
  BarChart3, 
  Rocket, 
  Sparkles,
  TrendingUp,
  Users,
  Target,
  MessageCircle,
  ArrowRight,
  Star
} from "lucide-react"
import { useState } from "react"
import { COLORS } from "@/lib/app-config"

interface WelcomeMessageProps {
  onStartChat?: () => void
  showExamples?: boolean
}

export function WelcomeMessage({ onStartChat, showExamples = true }: WelcomeMessageProps) {
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const mainFeatures = [
    {
      icon: Lightbulb,
      title: "Conseils Stratégiques",
      items: ["Stratégie de marque", "Études de marché", "Positionnement"],
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Megaphone,
      title: "Marketing Numérique",
      items: ["Social Media", "SEO", "Publicités en ligne", "Marketing de contenu"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: ShoppingCart,
      title: "Vente & CRM",
      items: ["Techniques de vente", "Fidélisation client", "Gestion relation client"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Analyse",
      items: ["Interprétation de données", "KPI", "Mesure de performance"],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Rocket,
      title: "Innovation",
      items: ["Tendances", "E-commerce", "Nouvelles technologies"],
      color: "from-red-500 to-rose-500"
    }
  ]

  const additionalFeatures = [
    { icon: TrendingUp, title: "Croissance", description: "Stratégies d'expansion" },
    { icon: Users, title: "Community", description: "Gestion de communauté" },
    { icon: Target, title: "Ciblage", description: "Segmentation avancée" },
    { icon: Star, title: "Branding", description: "Identité de marque" }
  ]

  const exampleQuestions = [
    "Comment lancer une campagne Facebook Ads efficace ?",
    "Quelles sont les meilleures stratégies de fidélisation ?",
    "Comment analyser mes KPIs marketing ?",
    "Stratégies pour augmenter mes ventes en ligne"
  ]

  const displayedFeatures = showAllFeatures ? [...mainFeatures, ...additionalFeatures.map(f => ({
    icon: f.icon,
    title: f.title,
    items: [f.description],
    color: "from-gray-500 to-gray-600"
  }))] : mainFeatures

  return (
    <div className="space-y-5 mb-4 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-primary">IA avancée</span>
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Votre Expert en Marketing & Commerce
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
          Transformez votre vision commerciale en succès concret avec des analyses, 
          conseils personnalisés et solutions innovantes.
        </p>
      </div>

      {/* Key Features Card */}
      <Card className="border-2 border-primary/20 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-center flex items-center justify-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Fonctionnalités Clés
            <Badge variant="outline" className="text-[9px]">5 domaines</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayedFeatures.map((feature, idx) => (
            <div 
              key={feature.title} 
              className={`flex gap-3 items-start group transition-all duration-300 hover:translate-x-1 ${
                idx === 0 ? 'animate-slide-up' : ''
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-10 flex items-center justify-center shadow-sm`}>
                <feature.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold mb-0.5">{feature.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {feature.items.join(", ")}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Example Questions */}
      {showExamples && (
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-center flex items-center justify-center gap-2">
              <MessageCircle className="w-3 h-3 text-primary" />
              Questions fréquentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {exampleQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => onStartChat?.(question)}
                  className="text-left p-2 rounded-lg bg-background hover:bg-primary/5 transition-all duration-200 group border border-border/50 hover:border-primary/30"
                >
                  <p className="text-[10px] text-muted-foreground group-hover:text-foreground line-clamp-2">
                    {question}
                  </p>
                  <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      {onStartChat && (
        <Button
          onClick={() => onStartChat()}
          className="w-full transition-all hover:shadow-md"
          style={{ backgroundColor: COLORS.PRIMARY }}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Commencer votre consultation
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}

      {/* Footer */}
      <p className="text-[10px] text-center text-muted-foreground italic">
        🤖 Disponible pour entrepreneurs, marketeurs et chefs d&apos;entreprise
      </p>

      {/* Analytics Note */}
      <div className="text-center">
        <p className="text-[9px] text-muted-foreground">
          💡 Tous les conseils sont personnalisés selon votre secteur d&apos;activité
        </p>
      </div>
    </div>
  )
}

// Version simplifiée pour l'affichage rapide
export function SimpleWelcomeMessage() {
  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full mb-3">
        <Sparkles className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-medium text-primary">Hosni IA</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Votre expert en marketing et commerce 24/7
      </p>
    </div>
  )
}

// Version avec statistiques
export function WelcomeMessageWithStats() {
  const stats = [
    { value: "1000+", label: "Entreprises accompagnées" },
    { value: "98%", label: "Satisfaction client" },
    { value: "24/7", label: "Disponibilité" }
  ]

  return (
    <div className="space-y-4">
      <WelcomeMessage />
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center p-2 rounded-lg bg-primary/5">
            <p className="text-sm font-bold text-primary">{stat.value}</p>
            <p className="text-[9px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}