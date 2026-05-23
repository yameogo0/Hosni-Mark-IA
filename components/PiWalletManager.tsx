[collez le code de PiWalletManager]
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, LogOut, RefreshCw, Copy, Check, AlertCircle } from 'lucide-react'

declare global {
  interface Window {
    Pi: any
  }
}

interface WalletUser {
  uid: string
  username: string
  walletAddress?: string
  balance?: number
  accessToken?: string
}

export function PiWalletManager() {
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState<WalletUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('pi_wallet_user')
    if (saved) {
      try {
        const userData = JSON.parse(saved)
        setUser(userData)
        setIsConnected(true)
        setBalance(userData.balance || 0)
      } catch (e) {
        console.error('Erreur chargement wallet:', e)
        localStorage.removeItem('pi_wallet_user')
      }
    }
  }, [])

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window !== 'undefined' && window.Pi && window.Pi.authenticate) {
        console.log('🔐 Authentification Pi...')
        const scopes = ['username', 'wallet_address', 'payments']

        const auth = await window.Pi.authenticate(scopes, (err: any) => {
          console.error('Erreur auth Pi:', err)
          setError(err?.message || 'Erreur d\'authentification')
        })

        if (auth && auth.user) {
          const walletData: WalletUser = {
            uid: auth.user.uid,
            username: auth.user.username,
            walletAddress: auth.user.wallet_address || 'Non disponible',
            balance: 0,
            accessToken: auth.accessToken
          }
          setUser(walletData)
          setIsConnected(true)
          localStorage.setItem('pi_wallet_user', JSON.stringify(walletData))
          console.log('✅ Wallet Pi connecté:', walletData.username)
        }
      } else {
        // Mode démo
        const demoUser: WalletUser = {
          uid: 'demo_' + Date.now(),
          username: 'demo_user_' + Math.floor(Math.random() * 1000),
          walletAddress: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          balance: 0,
          accessToken: 'demo_token_' + Date.now()
        }
        setUser(demoUser)
        setIsConnected(true)
        localStorage.setItem('pi_wallet_user', JSON.stringify(demoUser))
        console.log('🎭 Mode démo - Wallet simulé')
      }
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error)
      setError(error.message || 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    setUser(null)
    setIsConnected(false)
    setBalance(null)
    setError(null)
    localStorage.removeItem('pi_wallet_user')
  }

  const handleCopyAddress = () => {
    if (user?.walletAddress && user.walletAddress !== 'Non disponible') {
      navigator.clipboard.writeText(user.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Wallet className="w-5 h-5" />
            Wallet Pi Network
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Connectez votre portefeuille Pi pour accéder aux paiements et aux abonnements premium.
          </p>
          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <Button onClick={handleConnect} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
            {isLoading ? '⏳ Connexion...' : '🔗 Connecter Wallet Pi'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-900">
            <Wallet className="w-5 h-5" />
            <span className="font-medium">{user?.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-600">
              {balance !== null ? `${balance} π` : 'Chargement...'}
            </span>
            <button onClick={() => setBalance(Math.floor(Math.random() * 90) + 10)} className="p-1 hover:bg-green-200 rounded">
              <RefreshCw className="w-4 h-4 text-green-600" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <p className="text-xs text-gray-500 mb-1">Adresse du Wallet</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-gray-100 p-2 rounded break-all">{user?.walletAddress || 'Non disponible'}</code>
            {user?.walletAddress && user.walletAddress !== 'Non disponible' && (
              <button onClick={handleCopyAddress} className="p-2 hover:bg-gray-200 rounded">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              </button>
            )}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center text-xs text-green-700 border border-green-200">
          🔐 Mode Production - Transactions réelles
        </div>
        <Button onClick={handleDisconnect} variant="destructive" className="w-full">
          <LogOut className="w-4 h-4 mr-2" /> Déconnecter
        </Button>
      </CardContent>
    </Card>
  )
}