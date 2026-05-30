"use client"

import { Badge } from "@/components/ui/badge"
import { Crown, MessageCircle, Infinity, Clock, CheckCircle2, AlertCircle, TrendingUp, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { SubscriptionStatus } from "@/hooks/use-subscription-status"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

interface SubscriptionStatusProps {
  status: SubscriptionStatus;
  showDetails?: boolean;
  onUpgradeClick?: () => void;
}

export function SubscriptionStatusIndicator({ 
  status, 
  showDetails = false,
  onUpgradeClick 
}: SubscriptionStatusProps) {
  const { t } = useLanguage()
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [progressPercent, setProgressPercent] = useState(0)

  const isPremium = status.tier === "weekly" || status.tier === "monthly"
  const remainingQuestions = status.questionsLimit - status.questionsUsedToday
  const isNearLimit = remainingQuestions <= 3 && remainingQuestions > 0
  const isLimitReached = remainingQuestions <= 0

  useEffect(() => {
    if (isPremium && status.expiresAt) {
      const updateTimeRemaining = () => {
        const now = new Date()
        const expires = new Date(status.expiresAt!)
        const diff = expires.getTime() - now.getTime()
        
        if (diff <= 0) {
          setTimeRemaining(t('expired'))
          return
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60))
        
        if (days > 0) {
          setTimeRemaining(t('daysRemainingCount').replace('{days}', days.toString()))
        } else if (hours > 0) {
          setTimeRemaining(t('hoursRemaining').replace('{hours}', hours.toString()))
        } else {
          setTimeRemaining(t('lessThanHour'))
        }
      }
      
      updateTimeRemaining()
      const interval = setInterval(updateTimeRemaining, 60000)
      return () => clearInterval(interval)
    }
  }, [isPremium, status.expiresAt, t])

  useEffect(() => {
    if (!isPremium) {
      const percent = (status.questionsUsedToday / status.questionsLimit) * 100
      setProgressPercent(Math.min(percent, 100))
    }
  }, [isPremium, status.questionsUsedToday, status.questionsLimit])

  if (status.isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-background to-primary/5">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary/30 animate-pulse" />
            <span className="text-xs text-muted-foreground">{t('loading')}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-primary/20 bg-gradient-to-r from-background to-primary/5 transition-all hover:shadow-md`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {isPremium ? (
              <div className="relative">
                <Crown className="w-4 h-4 text-primary" />
                {status.tier === "monthly" && (
                  <span className="absolute -top-1 -right-2 text-[8px]">⭐</span>
                )}
              </div>
            ) : (
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
            )}
            <div className="flex flex-col">
              <span className="text-xs font-semibold">
                {isPremium ? (
                  <span className="text-primary">
                    {status.tier === "monthly" ? t('monthlyProPlan') : t('weeklyPremiumPlan')}
                  </span>
                ) : (
                  t('freeAccess')
                )}
              </span>
              {isPremium && timeRemaining && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {timeRemaining} {t('remaining')}
                </span>
              )}
              {!isPremium && showDetails && (
                <span className="text-[10px] text-muted-foreground">
                  {t('dailyLimit')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isPremium ? (
              <>
                <Badge variant="outline" className="gap-1 border-primary/40 bg-primary/5">
                  <Infinity className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium">{t('unlimited')}</span>
                </Badge>
                {status.tier === "monthly" && (
                  <Badge variant="outline" className="gap-1 border-amber-400/40 bg-amber-50">
                    <TrendingUp className="w-3 h-3 text-amber-600" />
                    <span className="text-xs text-amber-700">{t('pro')}</span>
                  </Badge>
                )}
              </>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant={isLimitReached ? "destructive" : isNearLimit ? "default" : "secondary"}
                  className={`text-xs ${isNearLimit && !isLimitReached ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                >
                  {isLimitReached ? (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  ) : isNearLimit ? (
                    <Zap className="w-3 h-3 mr-1" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  )}
                  {status.questionsUsedToday} / {status.questionsLimit}
                </Badge>
                {showDetails && !isLimitReached && (
                  <div className="w-20">
                    <Progress value={progressPercent} className="h-1" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Avertissement limite */}
        {!isPremium && isNearLimit && !isLimitReached && (
          <div className="mt-2 pt-2 border-t border-yellow-200">
            <p className="text-[10px] text-yellow-700 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {t('questionsRemainingToday').replace('{count}', remainingQuestions.toString())}
            </p>
          </div>
        )}

        {!isPremium && isLimitReached && onUpgradeClick && (
          <div className="mt-2 pt-2 border-t border-red-200">
            <p className="text-[10px] text-red-600 flex items-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3" />
              {t('dailyLimitReachedText')}
            </p>
            <button
              onClick={onUpgradeClick}
              className="text-[10px] text-primary hover:underline font-medium"
            >
              {t('upgradeToPremium')} →
            </button>
          </div>
        )}

        {/* Indicateur de session */}
        {showDetails && status.sessionCount && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-[9px] text-muted-foreground flex items-center gap-1">
              <MessageCircle className="w-2.5 h-2.5" />
              {t('currentSession')}: {status.sessionCount} {status.sessionCount > 1 ? t('messages') : t('message')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}