'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    Pi: any
  }
}

export function PiScriptLoader() {
  useEffect(() => {
    // Étape 1: Charger le SDK (obligatoire)
    const script = document.createElement('script')
    script.src = 'https://sdk.minepi.com/pi-sdk.js'
    script.async = true
    script.onload = async () => {
      console.log('✅ Pi SDK chargé')
      
      // Étape 2: Initialiser (appelé une fois)
      if (window.Pi) {
        await window.Pi.init({ 
          version: "2.0", 
          sandbox: false  // false pour production
        })
        console.log('✅ Pi SDK initialisé')
      }
    }
    script.onerror = () => {
      console.error('❌ Erreur chargement Pi SDK')
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return null
}