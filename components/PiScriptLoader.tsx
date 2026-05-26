'use client'

import { useEffect } from 'react'

export function PiScriptLoader() {
  useEffect(() => {
    console.log("🔄 PiScriptLoader - Chargement du SDK...")
    
    // Fonction pour initialiser Pi
    const initPi = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        console.log("✅ Pi SDK détecté, initialisation...")
        window.Pi.init({ version: '2.0', sandbox: false })
        return true
      }
      return false
    }

    // Vérifier immédiatement
    if (initPi()) return

    // Créer et charger le script
    const script = document.createElement('script')
    script.src = 'https://sdk.minepi.com/pi-sdk.js'
    script.async = true
    script.onload = () => {
      console.log("📦 Script Pi SDK chargé")
      setTimeout(() => initPi(), 100)
    }
    script.onerror = () => {
      console.error("❌ Erreur chargement Pi SDK")
    }
    document.head.appendChild(script)

    // Vérification périodique
    const interval = setInterval(() => {
      if (initPi()) clearInterval(interval)
    }, 500)

    return () => {
      clearInterval(interval)
      if (script && document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return null
}