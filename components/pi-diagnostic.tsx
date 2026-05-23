"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Copy, ExternalLink } from "lucide-react"
import { PI_NETWORK_CONFIG, BACKEND_CONFIG } from "@/lib/system-config"
import { useToast } from "@/hooks/use-toast"

interface DiagnosticResult {
  name: string
  status: "success" | "error" | "warning" | "checking"
  message: string
  details?: string
}

export function PiDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const { toast } = useToast()

  const runDiagnostics = async () => {
    setIsChecking(true)
    const diagnosticResults: DiagnosticResult[] = []

    // 1. Vérifier la disponibilité du SDK Pi
    diagnosticResults.push({
      name: "Pi SDK Disponible",
      status: typeof window !== "undefined" && (window as any).Pi ? "success" : "error",
      message: typeof window !== "undefined" && (window as any).Pi 
        ? "Pi SDK est chargé et disponible" 
        : "Pi SDK n'est pas disponible. Vérifiez que l'app s'exécute dans Pi Browser.",
      details: `SDK URL: ${PI_NETWORK_CONFIG.SDK_URL}`
    })

    // 2. Vérifier le mode Sandbox
    diagnosticResults.push({
      name: "Mode Sandbox",
      status: PI_NETWORK_CONFIG.SANDBOX ? "warning" : "success",
      message: PI_NETWORK_CONFIG.SANDBOX 
        ? "Mode Sandbox activé (tests uniquement)" 
        : "Mode Production activé",
      details: `SANDBOX: ${PI_NETWORK_CONFIG.SANDBOX}`
    })

    // 3. Vérifier la configuration du backend
    diagnosticResults.push({
      name: "Backend Configuré",
      status: BACKEND_CONFIG.BASE_URL ? "success" : "error",
      message: BACKEND_CONFIG.BASE_URL 
        ? "Backend URL configurée" 
        : "Backend URL manquante",
      details: `Base URL: ${BACKEND_CONFIG.BASE_URL}`
    })

    // 4. Vérifier la connexion backend
    try {
      const response = await fetch(`${BACKEND_CONFIG.BASE_URL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000)
      })
      
      diagnosticResults.push({
        name: "Backend Accessible",
        status: response.ok ? "success" : "error",
        message: response.ok 
          ? `Backend répond (${response.status})` 
          : `Backend inaccessible (${response.status})`,
        details: `Endpoint: ${BACKEND_CONFIG.BASE_URL}/health`
      })
    } catch (error) {
      diagnosticResults.push({
        name: "Backend Accessible",
        status: "error",
        message: "Impossible de contacter le backend",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      })
    }

    // 5. Vérifier l'authentification Pi
    if (typeof window !== "undefined" && (window as any).Pi) {
      try {
        const auth = await (window as any).Pi.authenticate([], () => {})
        diagnosticResults.push({
          name: "Authentification Pi",
          status: auth && auth.accessToken ? "success" : "error",
          message: auth && auth.accessToken 
            ? "Authentification réussie" 
            : "Échec de l'authentification",
          details: auth?.user?.uid ? `User ID: ${auth.user.uid}` : undefined
        })
      } catch (error) {
        diagnosticResults.push({
          name: "Authentification Pi",
          status: "error",
          message: "Erreur d'authentification",
          details: error instanceof Error ? error.message : "Erreur inconnue"
        })
      }
    }

    setResults(diagnosticResults)
    setIsChecking(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

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
    const variants: Record<string, any> = {
      success: "default",
      error: "destructive",
      warning: "secondary",
      checking: "outline"
    }
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copié",
      description: "Les informations ont été copiées dans le presse-papier",
    })
  }

  const hasErrors = results.some(r => r.status === "error")

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Diagnostic Pi Network</span>
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
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Des erreurs ont été détectées. Consultez le{" "}
              <a 
                href="/PI_WALLET_SETUP_GUIDE.md" 
                target="_blank" 
                className="underline font-semibold"
              >
                guide de configuration
              </a>
              {" "}pour résoudre les problèmes.
            </AlertDescription>
          </Alert>
        )}

        {results.map((result, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card"
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(result.status)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-sm">{result.name}</h4>
                {getStatusBadge(result.status)}
              </div>
              <p className="text-xs text-muted-foreground">{result.message}</p>
              {result.details && (
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
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

        <div className="pt-4 border-t space-y-3">
          <h4 className="font-semibold text-sm">Actions Recommandées</h4>
          
          {hasErrors && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="font-semibold">
                  Si vous voyez "The developer of this app has not set up the app wallet":
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Accédez à https://develop.pi</li>
                  <li>Sélectionnez votre application Hosni IA</li>
                  <li>Allez dans la section "Wallets"</li>
                  <li>Créez un nouveau wallet pour l'application</li>
                  <li>Configurez les clés API dans votre backend</li>
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
              onClick={() => window.open("/PI_WALLET_SETUP_GUIDE.md", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Guide de Configuration Complet
            </Button>
          </div>
        </div>

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
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  )
}
