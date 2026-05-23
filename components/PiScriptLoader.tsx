'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Pi: any;
  }
}

interface PiScriptLoaderProps {
  onReady?: () => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

export function PiScriptLoader({ 
  onReady, 
  onError, 
  retryCount = 3, 
  retryDelay = 2000 
}: PiScriptLoaderProps = {}) {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retries, setRetries] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let timeout: NodeJS.Timeout | null = null

    const initPi = () => {
      if (typeof window !== 'undefined' && window.Pi && !window.Pi._initialized) {
        console.log('✅ Pi SDK chargé avec succès')
        try {
          window.Pi.init({
            version: '2.0',
            sandbox: process.env.NEXT_PUBLIC_PI_NETWORK_SANDBOX !== 'false'
          })
          window.Pi._initialized = true
          setIsReady(true)
          setIsLoading(false)
          onReady?.()
          return true
        } catch (err) {
          console.error('❌ Erreur lors de l\'initialisation Pi:', err)
          setError('Erreur d\'initialisation du SDK Pi')
          onError?.(err instanceof Error ? err : new Error('Erreur inconnue'))
          return false
        }
      }
      return false
    }

    const loadScript = () => {
      if (initPi()) return

      // Créer et charger le script manuellement si nécessaire
      if (!window.Pi) {
        const script = document.createElement('script')
        script.src = 'https://sdk.minepi.com/pi-sdk.js'
        script.async = true
        script.onload = () => {
          console.log('📦 Script Pi SDK chargé, tentative d\'initialisation...')
          setTimeout(() => initPi(), 100)
        }
        script.onerror = () => {
          console.error('❌ Échec du chargement du script Pi SDK')
          if (retries < retryCount) {
            setRetries(prev => prev + 1)
            setTimeout(loadScript, retryDelay)
          } else {
            setError('Impossible de charger le SDK Pi après plusieurs tentatives')
            setIsLoading(false)
            onError?.(new Error('SDK Pi loading failed'))
          }
        }
        document.head.appendChild(script)
      }
    }

    // Vérification périodique
    interval = setInterval(() => {
      if (initPi() && interval) clearInterval(interval)
    }, 500)

    // Timeout global
    timeout = setTimeout(() => {
      if (!isReady && isLoading) {
        console.warn('⚠️ Pi SDK non chargé après 10 secondes')
        setError('Délai d\'attente dépassé pour le chargement du SDK Pi')
        setIsLoading(false)
        onError?.(new Error('Pi SDK timeout'))
        if (interval) clearInterval(interval)
      }
    }, 10000)

    loadScript()

    return () => {
      if (interval) clearInterval(interval)
      if (timeout) clearTimeout(timeout)
    }
  }, [onReady, onError, retries, retryCount, retryDelay, isLoading, isReady])

  // Ne rien afficher, ce composant est uniquement pour le chargement
  return null
}

// Hook personnalisé pour utiliser le Pi SDK facilement
export function usePiSDK() {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPi = () => {
      if (typeof window !== 'undefined' && window.Pi && window.Pi._initialized) {
        setIsReady(true)
        setIsLoading(false)
        return true
      }
      return false
    }

    if (checkPi()) return

    const interval = setInterval(() => {
      if (checkPi()) clearInterval(interval)
    }, 200)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      setIsLoading(false)
      setError('Pi SDK non disponible')
    }, 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return { isReady, isLoading, error }
}