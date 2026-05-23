"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  ExternalLink,
  Wallet,
  Server,
  Key,
  Globe,
  Shield,
  Clock
} from "lucide-react"
import { PI_NETWORK_CONFIG, BACKEND_CONFIG } from "@/lib/system-config"
import { useToast } from "@/hooks/use-toast"

interface DiagnosticResult {
  name: string
  status: "success" | "error" | "warning" | "checking"
  message: string
  details?: string
  icon?: React.ReactNode
}

interface DiagnosticSummary {
  total: number
  success: number
  errors: number
  warnings: number
}

export function PiDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "checking":
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
    }
  }

  const getStatusBadge = (status: DiagnosticResult["status"]) => {
    const variants: Record<string, string> = {
      success: "bg-green-100 text-green-700 hover:bg-green-100",
      error: "bg-red-100 text-red-700 hover:bg-red-100",
      warning: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      checking: "bg-blue-100 text-blue-700 hover:bg-blue-100"
    }
    const labels: Record<string, string> = {
      success: "OK",
      error: "ERREUR",
      warning: "ATTENTION",
      checking: "VÉRIFICATION"
    }
    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getSummary = useCallback((): DiagnosticSummary => {
    return {
      total: results.length,
      success: results.filter(r => r.status === "success").length,
      errors: results.filter(r => r.status === "error").length,
      warnings: results.filter(r => r.status === "warning").length
    }
  }, [results])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copié !",
      description: "Les informations ont été copiées dans le presse-papier",
    })
  }

  const copyFullReport = () => {
    const report = results.map(r => 
      `[${r.status.toUpperCase()}] ${r.name}: ${r.message}${r.details ? `\n    Détails: ${r.details}` : ''}`
    ).join('\n')
    copyToClipboard(report)
  }

  const runDiagnostics = useCallback(async () => {
    setIsChecking(true)
    setProgress(0)
    const diagnosticResults: DiagnosticResult[] = []

    // 1. Vérifier la disponibilité du SDK Pi
    setProgress(10)
    await new Promise(r => setTimeout(r, 100))
    diagnosticResults.push({
      name: "SDK Pi Network",
      status: typeof window !== "undefined" && (window as any).Pi ? "success" : "error",
      message: typeof window !== "undefined" && (window as any).Pi 
        ? "SDK Pi est chargé et disponible" 
        : "SDK Pi non disponible. Vérifiez que l'app s'exécute dans Pi Browser.",
      details: `SDK URL: ${PI_NETWORK_CONFIG.SDK_URL}`,
      icon: <Wallet className="w-4 h-4" />
    })

    // 2. Vérifier le mode Sandbox
    setProgress(20)
    await new Promise(r => setTimeout(r, 100))
    diagnosticResults.push({
      name: "Mode Sandbox",
      status: PI_NETWORK_CONFIG.SANDBOX ? "warning" : "success",
      message: PI_NETWORK_CONFIG.SANDBOX 
        ? "Mode Sandbox activé (transactions simulées)" 
        : "Mode Production activé (transactions réelles)",
      details: `SANDBOX: ${PI_NETWORK_CONFIG.SANDBOX}`,
      icon: <Shield className="w-4 h-4" />
    })

    // 3. Vérifier la configuration du backend
    setProgress(30)
    await new Promise(r => setTimeout(r, 100))
    diagnosticResults.push({
      name: "Backend URL",
      status: BACKEND_CONFIG.BASE_URL ? "success" : "error",
      message: BACKEND_CONFIG.BASE_URL 
        ? "Backend URL configurée" 
        : "Backend URL manquante",
      details: `Base URL: ${BACKEND_CONFIG.BASE_URL || 'Non définie'}`,
      icon: <Server className="w-4 h-4" />
    })

    // 4. Vérifier la clé API
    setProgress(40)
    await new Promise(r => setTimeout(r, 100))
    const hasApiKey = !!process.env.NEXT_PUBLIC_GROQ_API_KEY || !!process.env.GROQ_API_KEY
    diagnosticResults.push({
      name: "Clé API",
      status: hasApiKey ? "success" : "error",
      message: hasApiKey 
        ? "Clé API configurée" 
        : "Clé API manquante (GROQ_API_KEY)",
      details: "Nécessaire pour le chat IA",
      icon: <Key className="w-4 h-4" />
    })

    // 5. Vérifier la connexion backend
    setProgress(60)
    try {
      const response = await fetch(`${BACKEND_CONFIG.BASE_URL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000)
      })
      
      diagnosticResults.push({
        name: "Backend Accessibilité",
        status: response.ok ? "success" : "error",
        message: response.ok 
          ? `Backend répond (${response.status})` 
          : `Backend inaccessible (${response.status})`,
        details: `Endpoint: ${BACKEND_CONFIG.BASE_URL}/health`,
        icon: <Globe className="w-4 h-4" />
      })
    } catch (error) {
      diagnosticResults.push({
        name: "Backend Accessibilité",
        status: "error",
        message: "Impossible de contacter le backend",
        details: error instanceof Error ? error.message : "Erreur inconnue",
        icon: <Globe className="w-4 h-4" />
      })
    }

    // 6. Vérifier l'authentification Pi
    setProgress(80)
    if (typeof window !== "undefined" && (window as any).Pi) {
      try {
        const auth = await (window as any).Pi.authenticate([], () => {})
        diagnosticResults.push({
          name: "Authentification Pi",
          status: auth && auth.accessToken ? "success" : "error",
          message: auth && auth.accessToken 
            ? "Authentification réussie" 
            : "Échec de l'authentification",
          details: auth?.user?.uid ? `User ID: ${auth.user.uid}` : "Non authentifié",
          icon: <Shield className="w-4 h-4" />
        })
      } catch (error) {
        diagnosticResults.push({
          name: "Authentification Pi",
          status: "error",
          message: "Erreur d'authentification",
          details: error instanceof Error ? error.message : "Erreur inconnue",
          icon: <Shield className="w-4 h-4" />
        })
      }
    } else {
      diagnosticResults.push({
        name: "Authentification Pi",
        status: "warning",
        message: "Impossible de vérifier l'authentification",
        details: "SDK Pi non disponible",
        icon: <Shield className="w-4 h-4" />
      })
    }

    // 7. Vérifier la latence
    setProgress(90)
    const startTime = performance.now()
    try {
      await fetch(`${BACKEND_CONFIG.BASE_URL}/health`, { signal: AbortSignal.timeout(3000) })
      const latency = Math.round(performance.now() - startTime)
      diagnosticResults.push({
        name: "Latence",
        status: latency < 500 ? "success" : latency < 2000 ? "warning" : "error",
        message: `Latence: ${latency}ms`,
        details: latency < 500 ? "Bonnes performances" : latency < 2000 ? "Performances moyennes" : "Latence élevée",
        icon: <Clock className="w-4 h-4" />
      })
    } catch {
      diagnosticResults.push({
        name: "Latence",
        status: "error",
        message: "Impossible de mesurer la latence",
        details: "Backend inaccessible",
        icon: <Clock className="w-4 h-4" />
      })
    }

    setProgress(100)
    setResults(diagnosticResults)
    setIsChecking(false)
  }, [])

  useEffect(() => {
    runDiagnostics()
  }, [runDiagnostics])

  const summary = getSummary()
  const hasErrors = summary.errors > 0

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Diagnostic Pi Network
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyFullReport}
              disabled={isChecking || results.length === 0}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copier rapport
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostics}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Relancer
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar pendant la vérification */}
        {isChecking && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Vérification en cours... {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Résumé rapide */}
        {!isChecking && results.length > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-600">{summary.success}</p>
              <p className="text-xs text-green-700">OK</p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-50">
              <p className="text-2xl font-bold text-yellow-600">{summary.warnings}</p>
              <p className="text-xs text-yellow-700">Alertes</p>
            </div>
            <div className="p-2 rounded-lg bg-red-50">
              <p className="text-2xl font-bold text-red-600">{summary.errors}</p>
              <p className="text-xs text-red-700">Erreurs</p>
            </div>
          </div>
        )}

        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Des erreurs ont été détectées. Consultez les recommandations ci-dessous.
            </AlertDescription>
          </Alert>
        )}

        {/* Résultats détaillés */}
        {results.map((result, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(result.status)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  {result.icon}
                  {result.name}
                </h4>
                {getStatusBadge(result.status)}
              </div>
              <p className="text-xs text-muted-foreground">{result.message}</p>
              {result.details && (
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto font-mono">
                    {result.details}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(result.details || "")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Actions Recommandées */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="font-semibold text-sm">Actions Recommandées</h4>
          
          {hasErrors && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="font-semibold">
                  Solutions pour les erreurs courantes :
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Assurez-vous d'être dans le <strong>Pi Browser</strong> (pas Chrome/Safari)</li>
                  <li>Vérifiez votre connexion internet</li>
                  <li>Videz le cache du navigateur</li>
                  <li>Reconnectez votre wallet Pi</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent"
              onClick={() => window.open("https://develop.pi", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir Pi Developer Portal
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent"
              onClick={() => window.open("/settings", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Configurer le Wallet
            </Button>
          </div>
        </div>

        {/* Informations Système */}
        <div className="pt-3 border-t">
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer font-semibold mb-2">
              Informations Système
            </summary>
            <div className="space-y-1 pl-4">
              <p>• User Agent: {typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}</p>
              <p>• SDK URL: {PI_NETWORK_CONFIG.SDK_URL}</p>
              <p>• Backend: {BACKEND_CONFIG.BASE_URL}</p>
              <p>• Mode: {PI_NETWORK_CONFIG.SANDBOX ? "Sandbox" : "Production"}</p>
              <p>• Dernier diagnostic: {new Date().toLocaleString()}</p>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  )
}