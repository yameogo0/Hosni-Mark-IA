// hooks/use-pi-network-authentication.ts
'use client'

import { useState, useEffect } from 'react'

export const usePiNetworkAuthentication = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        // Attendre que Pi soit disponible
        if (!window.Pi) {
          console.log('Attente du SDK Pi...')
          setTimeout(init, 500)
          return
        }

        // Authentifier l'utilisateur
        console.log('Authentification Pi...')
        const auth = await window.Pi.authenticate(
          ['payments', 'username', 'wallet_address'],
          (payment: any) => {
            console.log('Paiement incomplet trouvé:', payment)
          }
        )

        if (auth && auth.accessToken) {
          setPiAccessToken(auth.accessToken)
          setIsAuthenticated(true)
          console.log('✅ Authentifié:', auth.user?.username)
        }
      } catch (error) {
        console.error('Erreur authentification:', error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  return {
    isAuthenticated,
    piAccessToken,
    isLoading,
    authMessage: isAuthenticated ? 'Connecté' : 'Connexion...',
    error: null
  }
}