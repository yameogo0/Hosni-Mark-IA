"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  Crown,
  History,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Upload,
} from "lucide-react"
import { useWallet, type WalletData, type Transaction } from "@/hooks/use-wallet"
import { usePiNetworkAuthentication } from "@/hooks/use-pi-network-authentication"
import { COLORS } from "@/lib/app-config"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function WalletPage() {
  const { piAccessToken, isAuthenticated } = usePiNetworkAuthentication()
  const { walletData, isLoading, error, refetch } = useWallet(piAccessToken)
  const [showBalance, setShowBalance] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("month")

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              Vous devez être connecté pour accéder au wallet.
            </p>
            <Link href="/">
              <Button className="w-full" style={{ backgroundColor: COLORS.PRIMARY }}>
                Retour à l&apos;application
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalSpent = walletData.transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingTransactions = walletData.transactions.filter((t) => t.status === "pending")
  const completedTransactions = walletData.transactions.filter((t) => t.status === "completed")

  const transactionsByType = {
    subscription: completedTransactions.filter((t) => t.type === "subscription"),
    image_analysis: completedTransactions.filter((t) => t.type === "image_analysis"),
    continue: completedTransactions.filter((t) => t.type === "continue"),
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Mon Wallet Pi</h1>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={refetch}>
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Balance Card */}
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solde disponible</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold" style={{ color: COLORS.PRIMARY }}>
                  {showBalance ? walletData.balance.toFixed(2) : "•••"}
                </span>
                <span className="text-2xl text-muted-foreground">π</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="text-muted-foreground"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Dépensé</p>
                <p className="font-semibold">{totalSpent.toFixed(2)} π</p>
              </div>
              <div>
                <p className="text-muted-foreground">Transactions</p>
                <p className="font-semibold">{completedTransactions.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">En attente</p>
                <p className="font-semibold">{pendingTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subscription Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {walletData.subscription.isActive ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge style={{ backgroundColor: COLORS.PRIMARY }} className="mb-2">
                          {walletData.subscription.plan === "weekly" ? "Hebdomadaire" : "Mensuel Pro"}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Valide jusqu&apos;au{" "}
                          {walletData.subscription.endDate &&
                            new Intl.DateTimeFormat("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }).format(walletData.subscription.endDate)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <Link href="/" className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          Retour au chat
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="text-destructive bg-transparent"
                        // onClick to cancel subscription
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Pas d&apos;abonnement actif</p>
                    <Link href="/">
                      <Button style={{ backgroundColor: COLORS.PRIMARY }}>S&apos;abonner maintenant</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Historique des transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="subscription">Abonnement</TabsTrigger>
                    <TabsTrigger value="image">Images</TabsTrigger>
                    <TabsTrigger value="pending">Attente</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3">
                    {walletData.transactions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Aucune transaction</p>
                    ) : (
                      walletData.transactions.map((tx) => (
                        <TransactionRow key={tx.id} transaction={tx} />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="subscription" className="space-y-3">
                    {transactionsByType.subscription.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Aucune transaction</p>
                    ) : (
                      transactionsByType.subscription.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
                    )}
                  </TabsContent>

                  <TabsContent value="image" className="space-y-3">
                    {transactionsByType.image_analysis.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Aucune transaction</p>
                    ) : (
                      transactionsByType.image_analysis.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-3">
                    {pendingTransactions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Aucune transaction en attente</p>
                    ) : (
                      pendingTransactions.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" className="bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Dépôt Pi
                </Button>
                <Button className="w-full justify-start" variant="outline" className="bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Retrait Pi
                </Button>
                <Button className="w-full justify-start" variant="outline" className="bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Infos du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Utilisateur</p>
                  <p className="font-medium">@{walletData.username}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground">ID utilisateur</p>
                  <p className="font-mono text-xs break-all">{walletData.userId}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const getIcon = () => {
    switch (transaction.type) {
      case "subscription":
        return <Crown className="w-4 h-4" />
      case "image_analysis":
        return <Upload className="w-4 h-4" />
      case "continue":
        return <ArrowUpRight className="w-4 h-4" />
      default:
        return <Wallet className="w-4 h-4" />
    }
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case "completed":
        return "text-green-600"
      case "pending":
        return "text-yellow-600"
      case "failed":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {getIcon()}
        </div>
        <div>
          <p className="text-sm font-medium">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(transaction.timestamp)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">-{transaction.amount} π</p>
        <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
          {transaction.status === "completed"
            ? "Complété"
            : transaction.status === "pending"
              ? "En attente"
              : "Échoué"}
        </Badge>
      </div>
    </div>
  )
}
