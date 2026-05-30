'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Pi: any
  }
}

export function PiScriptLoader() {
  const [isPiReady, setIsPiReady] = useState(false)

  useEffect(() => {
    // Fonction pour charger le SDK
    const loadPiSDK = () => {
      // Vérifier si Pi est déjà disponible
      if (typeof window !== 'undefined' && window.Pi) {
        console.log('✅ Pi SDK déjà présent')
        window.Pi.init({
          version: '2.0',
          sandbox: false  // ← MODE PRODUCTION
        })
        setIsPiReady(true)
        return true
      }
      
      // Créer et charger le script
      const script = document.createElement('script')
      script.src = 'https://sdk.minepi.com/pi-sdk.js'
      script.async = true
      script.onload = () => {
        if (window.Pi) {
          console.log('✅ Pi SDK chargé avec succès')
          window.Pi.init({
            version: '2.0',
            sandbox: false  // ← MODE PRODUCTION
          })
          setIsPiReady(true)
        }
      }
      script.onerror = () => {
        console.error('❌ Erreur chargement Pi SDK')
      }
      document.head.appendChild(script)
    }

    loadPiSDK()
  }, [])

  return null
}