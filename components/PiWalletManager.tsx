'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, LogOut, RefreshCw, Copy, Check, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
  const [showBalance, setShowBalance] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

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

  const refreshBalance = useCallback(async () => {
    if (!user?.accessToken) return
    
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/pi/balance', {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      })
      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance)
        const updated = { ...user, balance: data.balance }
        setUser(updated)
        localStorage.setItem('pi_wallet_user', JSON.stringify(updated))
        toast({ title: "Solde actualisé", description: `Nouveau solde: ${data.balance} π` })
      }
    } catch (error) {
      console.error('Erreur rafraîchissement:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [user, toast])

  const handleConnect = useCallback(async () => {
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
          toast({ title: "Wallet connecté", description: `Bienvenue ${walletData.username} !` })
        }
      } else {
        throw new Error("Pi SDK non disponible. Veuillez utiliser le Pi Browser.")
      }
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error)
      setError(error.message || 'Erreur de connexion')
      toast({ title: "Erreur", description: error.message || "Impossible de connecter le wallet", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const handleDisconnect = useCallback(() => {
    setUser(null)
    setIsConnected(false)
    setBalance(null)
    setError(null)
    localStorage.removeItem('pi_wallet_user')
    toast({ title: "Déconnexion", description: "Wallet déconnecté avec succès" })
  }, [toast])

  const handleCopyAddress = useCallback(() => {
    if (user?.walletAddress && user.walletAddress !== 'Non disponible') {
      navigator.clipboard.writeText(user.walletAddress)
      setCopied(true)
      toast({ title: "Copié !", description: "Adresse du wallet copiée" })
      setTimeout(() => setCopied(false), 2000)
    }
  }, [user?.walletAddress, toast])

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
            {isLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Connexion...</> : <><Wallet className="w-4 h-4 mr-2" /> Connecter Wallet Pi</>}
          </Button>
          <p className="text-xs text-center text-amber-600">⚠️ Utilisez le Pi Browser pour vous connecter</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-900"><Wallet className="w-5 h-5" /><span className="font-medium">{user?.username}</span></div>
          <div className="flex items-center gap-2">
            <button onClick={refreshBalance} disabled={isRefreshing} className="p-1 hover:bg-green-200 rounded"><RefreshCw className={`w-4 h-4 text-green-600 ${isRefreshing ? 'animate-spin' : ''}`} /></button>
            <button onClick={() => setShowBalance(!showBalance)} className="p-1 hover:bg-green-200 rounded">{showBalance ? <EyeOff className="w-4 h-4 text-green-600" /> : <Eye className="w-4 h-4 text-green-600" />}</button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <p className="text-xs text-gray-500 mb-1">Solde disponible</p>
          <div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-green-700">{showBalance ? (balance !== null ? `${balance.toFixed(2)}` : 'Chargement...') : '••••••'}</span><span className="text-sm text-gray-500">π</span></div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <p className="text-xs text-gray-500 mb-1">Adresse du Wallet</p>
          <div className="flex items-center gap-2"><code className="flex-1 text-xs bg-gray-100 p-2 rounded break-all">{user?.walletAddress || 'Non disponible'}</code>
            {user?.walletAddress && user.walletAddress !== 'Non disponible' && (<button onClick={handleCopyAddress} className="p-2 hover:bg-gray-200 rounded">{copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3 border border-green-200"><p className="text-xs text-gray-500">ID Utilisateur</p><p className="font-mono text-xs truncate">{user?.uid}</p></div>
          <div className="bg-white rounded-lg p-3 border border-green-200"><p className="text-xs text-gray-500">État</p><p className="font-semibold text-green-600 flex items-center gap-1"><Shield className="w-3 h-3" /> Connecté</p></div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center text-xs text-green-700 border border-green-200">🔐 Mode Production - Transactions réelles</div>
        <Button onClick={handleDisconnect} variant="destructive" className="w-full"><LogOut className="w-4 h-4 mr-2" /> Déconnecter</Button>
      </CardContent>
    </Card>
  )
}