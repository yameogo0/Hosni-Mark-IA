"use client"

import { PiDiagnostic } from "@/components/pi-diagnostic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RefreshCw, Shield, Wallet, Zap, CheckCircle, XCircle, HelpCircle, Server, Key, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

declare global {
  interface Window {
    Pi: any
  }
}

export default function DiagnosticPage() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sdkStatus, setSdkStatus] = useState<'checking' | 'loaded' | 'error'>('checking')
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking')
  const [walletStatus, setWalletStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    const checkSDK = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        setSdkStatus('loaded')
        console.log('✅ Pi SDK détecté sur page diagnostic')
        return true
      } else {
        setSdkStatus('error')
        return false
      }
    }

    const checkAPI = async () => {
      try {
        const response = await fetch('/api/pi/payment', { method: 'POST' })
        if (response.status === 405 || response.status === 400) {
          setApiStatus('ok')
        } else {
          setApiStatus('ok')
        }
      } catch {
        setApiStatus('error')
      }
    }

    const checkWalletConnection = () => {
      const saved = localStorage.getItem('pi_wallet_user')
      if (saved) {
        try {
          const user = JSON.parse(saved)
          if (user.uid) {
            setWalletStatus('connected')
            return
          }
        } catch (e) {
          console.error('Erreur lecture wallet:', e)
        }
      }
      setWalletStatus('disconnected')
    }

    checkSDK()
    checkAPI()
    checkWalletConnection()

    const interval = setInterval(() => {
      checkSDK()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const StatusBadge = ({ status, text }: { status: 'checking' | 'ok' | 'error' | 'connected' | 'disconnected'; text: string }) => {
    const getColor = () => {
      if (status === 'checking') return 'bg-yellow-100 text-yellow-700'
      if (status === 'ok' || status === 'connected') return 'bg-green-100 text-green-700'
      if (status === 'error' || status === 'disconnected') return 'bg-red-100 text-red-700'
      return 'bg-gray-100 text-gray-700'
    }

    const getIcon = () => {
      if (status === 'checking') return <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse" />
      if (status === 'ok' || status === 'connected') return <CheckCircle className="w-4 h-4" />
      if (status === 'error' || status === 'disconnected') return <XCircle className="w-4 h-4" />
      return null
    }

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getColor()}`}>
        {getIcon()}
        {text}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Diagnostic Pi Network
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Vérification complète de la configuration et résolution des problèmes
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>

        {/* État du SDK Pi */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              État du SDK Pi Network
            </CardTitle>
            <CardDescription>
              Vérification de la présence et de l'initialisation du SDK Pi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                {sdkStatus === 'checking' && (
                  <>
                    <div className="animate-pulse w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Vérification du SDK Pi en cours...</span>
                  </>
                )}
                {sdkStatus === 'loaded' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">✅ SDK Pi chargé avec succès</span>
                  </>
                )}
                {sdkStatus === 'error' && (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 font-medium">❌ SDK Pi non détecté</span>
                  </>
                )}
              </div>
              <StatusBadge status={sdkStatus} text={sdkStatus === 'loaded' ? 'OK' : sdkStatus === 'error' ? 'Erreur' : 'Vérification'} />
            </div>
          </CardContent>
        </Card>

        {/* Composant de diagnostic principal */}
        <PiDiagnostic />

        {/* Informations supplémentaires */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Besoin d'aide ?
            </CardTitle>
            <CardDescription>
              Solutions rapides pour les problèmes courants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100">
                <h3 className="font-semibold flex items-center gap-2 mb-2 text-blue-800">
                  <Wallet className="w-4 h-4" />
                  Wallet non connecté
                </h3>
                <p className="text-sm text-muted-foreground">
                  1. Assurez-vous d'être dans le <strong>Pi Browser</strong><br />
                  2. Videz le cache du navigateur<br />
                  3. Reconnectez votre wallet
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100">
                <h3 className="font-semibold flex items-center gap-2 mb-2 text-purple-800">
                  <Shield className="w-4 h-4" />
                  SDK non chargé
                </h3>
                <p className="text-sm text-muted-foreground">
                  1. Utilisez le <strong>Pi Browser</strong> (pas Chrome/Safari)<br />
                  2. Vérifiez votre connexion internet<br />
                  3. Rafraîchissez la page
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100">
                <h3 className="font-semibold flex items-center gap-2 mb-2 text-green-800">
                  <Key className="w-4 h-4" />
                  API Key manquante
                </h3>
                <p className="text-sm text-muted-foreground">
                  1. Ajoutez <code className="text-xs">GROQ_API_KEY</code> dans les variables d'environnement<br />
                  2. Redéployez l'application<br />
                  3. Vérifiez la validité de la clé
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100">
                <h3 className="font-semibold flex items-center gap-2 mb-2 text-orange-800">
                  <Globe className="w-4 h-4" />
                  Problème de connexion
                </h3>
                <p className="text-sm text-muted-foreground">
                  1. Vérifiez votre connexion internet<br />
                  2. Désactivez les bloqueurs de publicité<br />
                  3. Essayez en navigation privée
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Hosni IA - Expert Marketing & Commerce • Paiements sécurisés via Pi Network</p>
          <p className="mt-1">
            <a href="/" className="underline hover:text-foreground">Accueil</a>
            {" • "}
            <a href="/settings" className="underline hover:text-foreground">Wallet</a>
            {" • "}
            <a href="/subscription" className="underline hover:text-foreground">Abonnements</a>
          </p>
        </div>
      </div>
    </div>
  )
}