"use client"

import { Badge } from "@/components/ui/badge"
import { Crown, MessageCircle, Infinity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { SubscriptionStatus } from "@/hooks/use-subscription-status"

interface SubscriptionStatusProps {
  status: SubscriptionStatus;
}

export function SubscriptionStatusIndicator({ status }: SubscriptionStatusProps) {
  const isPremium = status.tier === "weekly" || status.tier === "monthly";
  
  if (status.isLoading) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-background to-primary/5">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isPremium ? (
              <Crown className="w-4 h-4 text-primary" />
            ) : (
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
            )}
            <div className="flex flex-col">
              <span className="text-xs font-semibold">
                {isPremium ? (
                  <span className="text-primary">
                    {status.tier === "monthly" ? "Plan Pro (Mensuel)" : "Plan Premium (Hebdo)"}
                  </span>
                ) : (
                  "Accès Gratuit"
                )}
              </span>
              {isPremium && (
                <span className="text-[10px] text-muted-foreground">
                  Questions illimitées • Analyse d&apos;images
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isPremium ? (
              <Badge variant="outline" className="gap-1 border-primary/40">
                <Infinity className="w-3 h-3" />
                <span className="text-xs">Illimité</span>
              </Badge>
            ) : (
              <div className="flex flex-col items-end">
                <Badge 
                  variant={status.questionsUsedToday >= status.questionsLimit ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {status.questionsUsedToday} / {status.questionsLimit}
                </Badge>
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  questions aujourd&apos;hui
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
