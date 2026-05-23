"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
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
  Eye,
  EyeOff,
  Shield,
  Zap,
  Info,
} from "lucide-react"
import { useWallet, type WalletData } from "@/hooks/use-wallet"
import { COLORS } from "@/lib/app-config"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WalletProps {
  accessToken: string | null
  onSubscribe?: () => void
  compact?: boolean
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

const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Complété"
    case "pending":
      return "En attente"
    case "failed":
      return "Échoué"
    default:
      return status
  }
}

export function Wallet({ accessToken, onSubscribe, compact = false }: WalletProps) {
  const { walletData, isLoading, error, refetch, cancelSubscription } = useWallet(accessToken)
  const [isCanceling, setIsCanceling] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)

  // Calculer le temps restant pour l'abonnement
  useEffect(() => {
    if (walletData?.subscription.isActive && walletData.subscription.endDate) {
      const updateTimeRemaining = () => {
        const now = new Date()
        const expires = new Date(walletData.subscription.endDate!)
        const diff = expires.getTime() - now.getTime()
        
        if (diff <= 0) {
          setTimeRemaining("Expiré")
          return
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60))
        
        if (days > 0) {
          setTimeRemaining(`${days} jour${days > 1 ? 's' : ''}`)
        } else if (hours > 0) {
          setTimeRemaining(`${hours} heure${hours > 1 ? 's' : ''}`)
        } else {
          setTimeRemaining("Moins d'une heure")
        }
      }
      
      updateTimeRemaining()
      const interval = setInterval(updateTimeRemaining, 60000)
      return () => clearInterval(interval)
    }
  }, [walletData?.subscription.isActive, walletData?.subscription.endDate])

  const handleCancelSubscription = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez l'accès aux fonctionnalités premium à la fin de la période en cours.")) {
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
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Chargement du portefeuille...</p>
        </div>
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

  if (compact) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WalletIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">
                {showBalance ? `${walletData.balance.toFixed(2)} π` : '••••••'}
              </span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            {walletData.subscription.isActive && (
              <Badge className="bg-green-500 text-white text-[10px]">
                <Crown className="w-2.5 h-2.5 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4">
        {/* Balance Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletIcon className="w-5 h-5 text-primary" />
                <span className="text-base">Mon Portefeuille Pi</span>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refetch}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rafraîchir le solde</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowBalance(!showBalance)}>
                      {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showBalance ? "Masquer le solde" : "Afficher le solde"}</TooltipContent>
                </Tooltip>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Solde disponible</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold" style={{ color: COLORS.PRIMARY }}>
                  {showBalance ? walletData.balance.toFixed(2) : "••••••"}
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
                  <Tooltip>
                    <TooltipTrigger>
                      <p className="font-mono text-[10px] truncate">{walletData.userId.slice(0, 8)}...</p>
                    </TooltipTrigger>
                    <TooltipContent>{walletData.userId}</TooltipContent>
                  </Tooltip>
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
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Badge style={{ backgroundColor: COLORS.PRIMARY }} className="text-xs">
                    {walletData.subscription.plan === "weekly" ? "Hebdomadaire" : "Mensuel Pro"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {walletData.subscription.autoRenew ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Renouvellement auto
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Annulation en cours
                      </span>
                    )}
                  </Badge>
                </div>

                {timeRemaining && (
                  <div className="flex items-center gap-2 text-xs bg-primary/5 p-2 rounded-lg">
                    <Clock className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">Temps restant :</span>
                    <span className="font-medium">{timeRemaining}</span>
                  </div>
                )}

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
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onSubscribe}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Changer de plan
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs text-destructive hover:text-destructive"
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

                {!walletData.subscription.autoRenew && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Info className="h-3 w-3 text-yellow-600" />
                    <AlertDescription className="text-xs text-yellow-700">
                      Votre abonnement ne sera pas renouvelé automatiquement. Vous perdrez l'accès premium à la date de fin.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center py-2">
                  Vous n&apos;avez pas d&apos;abonnement actif.
                </p>
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
              <Badge variant="secondary" className="text-[10px]">
                {walletData.transactions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {walletData.transactions.length === 0 ? (
              <div className="text-center py-8">
                <WalletIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">Aucune transaction</p>
                <p className="text-xs text-muted-foreground mt-1">Les paiements effectués apparaîtront ici</p>
              </div>
            ) : (
              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-3">
                  {walletData.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-start gap-3 pb-3 border-b last:border-0 hover:bg-muted/30 p-2 rounded-lg transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${COLORS.PRIMARY}15` }}
                      >
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="text-sm font-medium">{transaction.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-muted-foreground">{formatDateTime(transaction.timestamp)}</p>
                              <Badge variant="outline" className="text-[9px]">
                                {transaction.type === "subscription" ? "Abonnement" : 
                                 transaction.type === "image_analysis" ? "Analyse d'image" : "Continuation"}
                              </Badge>
                            </div>
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

        {/* Protection note */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
          <Shield className="w-3 h-3" />
          <span>Paiements sécurisés et décentralisés via Pi Network</span>
        </div>
      </div>
    </TooltipProvider>
  )
}