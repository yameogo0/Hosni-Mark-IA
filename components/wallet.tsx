"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Wallet as WalletIcon,
  Crown,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ImageIcon,
  Calendar,
  ArrowUpRight,
} from "lucide-react"
import { useWallet, type WalletData } from "@/hooks/use-wallet"
import { COLORS } from "@/lib/app-config"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"

interface WalletProps {
  accessToken: string | null
  onSubscribe?: () => void
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "subscription":
      return <Crown className="w-4 h-4" />
    case "image_analysis":
      return <ImageIcon className="w-4 h-4" />
    case "continue":
      return <ArrowUpRight className="w-4 h-4" />
    default:
      return <WalletIcon className="w-4 h-4" />
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-500" />
    case "failed":
      return <XCircle className="w-4 h-4 text-red-500" />
    default:
      return null
  }
}

export function Wallet({ accessToken, onSubscribe }: WalletProps) {
  const { walletData, isLoading, error, refetch, cancelSubscription } = useWallet(accessToken)
  const [isCanceling, setIsCanceling] = useState(false)

  const handleCancelSubscription = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler votre abonnement?")) {
      return
    }

    try {
      setIsCanceling(true)
      await cancelSubscription()
    } catch (err) {
      alert("Erreur lors de l'annulation de l'abonnement")
    } finally {
      setIsCanceling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !walletData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" className="ml-2 bg-transparent" onClick={refetch}>
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!walletData) {
    return null
  }

  return (
    <div className="space-y-4 p-4">
      {/* Balance Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-primary" />
              <span className="text-base">Mon Portefeuille Pi</span>
            </div>
            <Button variant="ghost" size="icon" onClick={refetch}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Solde disponible</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold" style={{ color: COLORS.PRIMARY }}>
                {walletData.balance.toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground">π</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-semibold">Informations du compte</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Utilisateur</p>
                <p className="font-medium">@{walletData.username}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ID</p>
                <p className="font-mono text-[10px]">{walletData.userId}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="w-5 h-5 text-primary" />
            Statut de l&apos;Abonnement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {walletData.subscription.isActive ? (
            <>
              <div className="flex items-center justify-between">
                <Badge style={{ backgroundColor: COLORS.PRIMARY }} className="text-xs">
                  {walletData.subscription.plan === "weekly" ? "Hebdomadaire" : "Mensuel Pro"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {walletData.subscription.autoRenew ? "Renouvellement auto" : "Annulation en cours"}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date de début</span>
                  <span className="font-medium">
                    {walletData.subscription.startDate && formatDate(walletData.subscription.startDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date de fin</span>
                  <span className="font-medium">
                    {walletData.subscription.endDate && formatDate(walletData.subscription.endDate)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                {onSubscribe && (
                  <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent" onClick={onSubscribe}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Changer de plan
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs text-destructive bg-transparent"
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                >
                  {isCanceling ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  Annuler
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Vous n&apos;avez pas d&apos;abonnement actif.</p>
              {onSubscribe && (
                <Button className="w-full" style={{ backgroundColor: COLORS.PRIMARY }} onClick={onSubscribe}>
                  <Crown className="w-4 h-4 mr-2" />
                  S&apos;abonner maintenant
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-5 h-5 text-primary" />
            Historique des Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {walletData.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune transaction</p>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {walletData.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${COLORS.PRIMARY}15` }}
                    >
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(transaction.timestamp)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <span className="text-sm font-semibold whitespace-nowrap">-{transaction.amount} π</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
