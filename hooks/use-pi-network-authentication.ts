// hooks/use-pi-network-authentication.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// 🔥 Mode démo - Mettre à true pour les tests sans Pi Browser
// Mettre à false pour la production réelle
const DEMO_MODE = true;

// 🔥 Délai d'attente pour le SDK Pi (millisecondes)
const PI_SDK_TIMEOUT = 10000;

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
  const sdkCheckInterval = useRef<NodeJS.Timeout | null>(null)
  const sdkTimeout = useRef<NodeJS.Timeout | null>(null)

  // Nettoyage des timers
  const cleanup = useCallback(() => {
    if (sdkCheckInterval.current) {
      clearInterval(sdkCheckInterval.current)
      sdkCheckInterval.current = null
    }
    if (sdkTimeout.current) {
      clearTimeout(sdkTimeout.current)
      sdkTimeout.current = null
    }
  }, [])

  const authenticate = useCallback(async () => {
    if (authAttempted.current) {
      console.log('Authentification déjà tentée')
      return
    }
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
        
        // Attendre le SDK Pi avec un timeout
        let sdkLoaded = false
        
        await new Promise<void>((resolve, reject) => {
          sdkCheckInterval.current = setInterval(() => {
            if (window.Pi) {
              sdkLoaded = true
              cleanup()
              resolve()
            }
          }, 200)
          
          sdkTimeout.current = setTimeout(() => {
            if (!sdkLoaded) {
              cleanup()
              reject(new Error("Pi SDK non disponible après l'attente"))
            }
          }, PI_SDK_TIMEOUT)
        })
      }

      // Vérifier à nouveau après l'attente
      if (!window.Pi) {
        throw new Error("Pi SDK non disponible")
      }

      // Initialiser le SDK Pi
      console.log('Initialisation du SDK Pi...')
      setAuthMessage("Initialisation du SDK Pi...")
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
        throw new Error("Authentification échouée - pas de token")
      }
    } catch (error: any) {
      console.error('❌ Erreur authentification:', error)
      setError(error.message || "Erreur d'authentification")
      setAuthMessage("❌ Erreur de connexion")
      setIsAuthenticated(false)
      setPiAccessToken(null)
    } finally {
      cleanup()
      setIsLoading(false)
    }
  }, [cleanup])

  // Réinitialiser l'authentification
  const reauthenticate = useCallback(() => {
    authAttempted.current = false
    setIsAuthenticated(false)
    setPiAccessToken(null)
    setError(null)
    setAuthMessage("Reconnexion...")
    setIsLoading(true)
    authenticate()
  }, [authenticate])

  // Démarrer l'authentification au montage
  useEffect(() => {
    authenticate()
    return cleanup
  }, [authenticate, cleanup])

  return {
    isAuthenticated,
    piAccessToken,
    isLoading,
    authMessage,
    error,
    reauthenticate,
  }
}