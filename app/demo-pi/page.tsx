// app/demo-pi/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Wallet, Crown, CheckCircle2, Loader2 } from 'lucide-react'

export default function DemoPiPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const testPiSDK = async () => {
    setStatus('loading')
    setMessage('Vérification du SDK Pi...')

    try {
      if (typeof window !== 'undefined' && window.Pi) {
        setMessage('SDK Pi détecté ! Tentative d\'authentification...')
        
        const scopes = ['username', 'wallet_address']
        const auth = await window.Pi.authenticate(scopes)
        
        if (auth && auth.user) {
          setStatus('success')
          setMessage(`Authentifié avec succès ! Bienvenue ${auth.user.username}`)
        } else {
          throw new Error('Authentification échouée')
        }
      } else {
        setStatus('error')
        setMessage('SDK Pi non détecté. Veuillez ouvrir cette page dans le Pi Browser.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erreur lors de l\'authentification Pi')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Démo Pi Network</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Test d'intégration Pi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cette page permet de tester l'intégration du SDK Pi Network.
            </p>

            <Button 
              onClick={testPiSDK} 
              disabled={status === 'loading'}
              className="w-full"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Tester l'authentification Pi
                </>
              )}
            </Button>

            {message && (
              <div className={`p-4 rounded-lg ${
                status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <div className="flex items-center gap-2">
                  {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  <span className="text-sm">{message}</span>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center pt-4">
              <p>Assurez-vous d'être dans le <strong>Pi Browser</strong> pour que le test fonctionne.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}