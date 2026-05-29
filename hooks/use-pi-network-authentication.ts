/// hooks/use-pi-network-authentication.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// 🔥 Mode démo - Mettre à true pour les tests sans Pi Browser
const DEMO_MODE = true;

interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
      authenticate: (scopes: string[], onIncompletePaymentFound?: (payment: any) => void) => Promise<PiAuthResult>;
    };
  }
}

export const usePiNetworkAuthentication = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authMessage, setAuthMessage] = useState("Connexion...")
  const authAttempted = useRef(false)

  const authenticate = useCallback(async () => {
    if (authAttempted.current) return
    authAttempted.current = true

    try {
      // Mode démo pour les tests
      if (DEMO_MODE) {
        console.log("🏖️ Mode démo - Authentification automatique")
        setTimeout(() => {
          setPiAccessToken("demo_token_" + Date.now())
          setIsAuthenticated(true)
          setAuthMessage("✅ Connecté (mode démo)")
          setIsLoading(false)
        }, 500)
        return
      }

      // Attendre que Pi soit disponible
      if (!window.Pi) {
        console.log('Attente du SDK Pi...')
        setTimeout(authenticate, 500)
        return
      }

      // Initialiser le SDK Pi
      await window.Pi.init({ version: "2.0", sandbox: false })

      // Authentifier l'utilisateur
      console.log('Authentification Pi...')
      setAuthMessage("Authentification en cours...")
      
      const auth = await window.Pi.authenticate(
        ['payments', 'username', 'wallet_address'],
        (payment: any) => {
          console.log('Paiement incomplet trouvé:', payment)
        }
      )

      if (auth && auth.accessToken) {
        setPiAccessToken(auth.accessToken)
        setIsAuthenticated(true)
        setAuthMessage(`✅ Connecté: ${auth.user?.username}`)
        console.log('✅ Authentifié:', auth.user?.username)
      } else {
        throw new Error("Authentification échouée")
      }
    } catch (error: any) {
      console.error('❌ Erreur authentification:', error)
      setError(error.message || "Erreur d'authentification")
      setAuthMessage("❌ Erreur de connexion")
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    authenticate()
  }, [authenticate])

  return {
    isAuthenticated,
    piAccessToken,
    isLoading,
    authMessage,
    error,
    reauthenticate: authenticate,
  }
}