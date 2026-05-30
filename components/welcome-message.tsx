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
import { useLanguage } from "@/contexts/LanguageContext"

interface WelcomeMessageProps {
  onStartChat?: () => void
  showExamples?: boolean
}

export function WelcomeMessage({ onStartChat, showExamples = true }: WelcomeMessageProps) {
  const { t } = useLanguage()
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const mainFeatures = [
    {
      icon: Lightbulb,
      title: t('strategicAdvice'),
      items: [t('brandStrategy'), t('marketResearch'), t('positioning')],
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Megaphone,
      title: t('digitalMarketing'),
      items: [t('socialMedia'), t('seo'), t('onlineAds'), t('contentMarketing')],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: ShoppingCart,
      title: t('salesCRM'),
      items: [t('salesTechniques'), t('customerLoyalty'), t('crmManagement')],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: t('analysis'),
      items: [t('dataInterpretation'), t('kpi'), t('performanceMeasurement')],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Rocket,
      title: t('innovation'),
      items: [t('trends'), t('ecommerce'), t('newTechnologies')],
      color: "from-red-500 to-rose-500"
    }
  ]

  const additionalFeatures = [
    { icon: TrendingUp, title: t('growth'), description: t('expansionStrategies') },
    { icon: Users, title: t('community'), description: t('communityManagement') },
    { icon: Target, title: t('targeting'), description: t('advancedSegmentation') },
    { icon: Star, title: t('branding'), description: t('brandIdentity') }
  ]

  const exampleQuestions = [
    t('question1'),
    t('question2'),
    t('question3'),
    t('question4')
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
          <span className="text-[10px] font-medium text-primary">{t('advancedAI')}</span>
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {t('expertTitle')}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
          {t('heroDescription')}
        </p>
      </div>

      {/* Key Features Card */}
      <Card className="border-2 border-primary/20 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-center flex items-center justify-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            {t('keyFeatures')}
            <Badge variant="outline" className="text-[9px]">5 {t('domains')}</Badge>
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
              {t('frequentQuestions')}
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
          {t('startConsultation')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}

      {/* Footer */}
      <p className="text-[10px] text-center text-muted-foreground italic">
        🤖 {t('availableFor')}
      </p>

      {/* Analytics Note */}
      <div className="text-center">
        <p className="text-[9px] text-muted-foreground">
          💡 {t('personalizedAdviceNote')}
        </p>
      </div>
    </div>
  )
}

// Version simplifiée pour l'affichage rapide
export function SimpleWelcomeMessage() {
  const { t } = useLanguage()
  
  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full mb-3">
        <Sparkles className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-medium text-primary">Hosni IA</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('expertShort')}
      </p>
    </div>
  )
}

// Version avec statistiques
export function WelcomeMessageWithStats() {
  const { t } = useLanguage()
  
  const stats = [
    { value: "1000+", label: t('companiesAccompanied') },
    { value: "98%", label: t('customerSatisfaction') },
    { value: "24/7", label: t('availability') }
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