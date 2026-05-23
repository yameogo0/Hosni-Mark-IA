'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Pi: any;
  }
}

export function PiScriptLoader() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initPi = () => {
      if (typeof window !== 'undefined' && window.Pi && !window.Pi._initialized) {
        console.log('✅ Pi SDK chargé avec succès')
        window.Pi.init({
          version: '2.0',
          sandbox: process.env.NEXT_PUBLIC_PI_NETWORK_SANDBOX !== 'false'
        })
        window.Pi._initialized = true
        setIsReady(true)
        return true
      }
      return false
    }

    if (initPi()) return

    const interval = setInterval(() => {
      if (initPi()) clearInterval(interval)
    }, 500)

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
