'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Pi: any;
    PiInitialized?: boolean;
  }
}

export function PiScriptLoader() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initPi = () => {
      if (typeof window !== 'undefined' && window.Pi && !window.PiInitialized) {
        console.log('✅ Pi SDK chargé avec succès')
        window.Pi.init({
          version: '2.0',
          sandbox: process.env.NEXT_PUBLIC_PI_NETWORK_SANDBOX !== 'false'
        })
        window.PiInitialized = true
        setIsReady(true)
        return true
      }
      return false
    }

    // Vérification immédiate
    if (initPi()) return

    // Vérification périodique
    const interval = setInterval(() => {
      if (initPi()) clearInterval(interval)
    }, 500)

    // Timeout après 10 secondes
    const timeout = setTimeout(() => {
      clearInterval(interval)
      console.warn('⚠️ Pi SDK non chargé après 10 secondes')
    }, 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return null
}