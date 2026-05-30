'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, LogOut, RefreshCw, Copy, Check, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const { t } = useLanguage()
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
        toast({ 
          title: t('refreshSuccess'), 
          description: `${t('newBalance')}: ${data.balance} π` 
        })
      }
    } catch (error) {
      console.error('Erreur rafraîchissement:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [user, toast, t])

  const handleConnect = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window !== 'undefined' && window.Pi && window.Pi.authenticate) {
        console.log('🔐 Authentification Pi...')
        const scopes = ['username', 'wallet_address', 'payments']
        const auth = await window.Pi.authenticate(scopes, (err: any) => {
          console.error('Erreur auth Pi:', err)
          setError(err?.message || t('authError'))
        })

        if (auth && auth.user) {
          const walletData: WalletUser = {
            uid: auth.user.uid,
            username: auth.user.username,
            walletAddress: auth.user.wallet_address || t('notAvailable'),
            balance: 0,
            accessToken: auth.accessToken
          }
          setUser(walletData)
          setIsConnected(true)
          localStorage.setItem('pi_wallet_user', JSON.stringify(walletData))
          toast({ 
            title: t('walletConnected'), 
            description: `${t('welcome')} ${walletData.username} !` 
          })
        }
      } else {
        throw new Error(t('piSDKRequired'))
      }
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error)
      setError(error.message || t('connectionError'))
      toast({ 
        title: t('error'), 
        description: error.message || t('connectionError'), 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, t])

  const handleDisconnect = useCallback(() => {
    setUser(null)
    setIsConnected(false)
    setBalance(null)
    setError(null)
    localStorage.removeItem('pi_wallet_user')
    toast({ 
      title: t('disconnected'), 
      description: t('walletDisconnected') 
    })
  }, [toast, t])

  const handleCopyAddress = useCallback(() => {
    if (user?.walletAddress && user.walletAddress !== t('notAvailable')) {
      navigator.clipboard.writeText(user.walletAddress)
      setCopied(true)
      toast({ title: t('copied'), description: t('addressCopied') })
      setTimeout(() => setCopied(false), 2000)
    }
  }, [user?.walletAddress, toast, t])

  if (!isConnected) {
    return (
      <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Wallet className="w-5 h-5" />
            {t('wallet')} Pi Network
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            {t('connectWalletDesc')}
          </p>
          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <Button onClick={handleConnect} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
            {isLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> {t('connecting')}...</> : <><Wallet className="w-4 h-4 mr-2" /> {t('connectWallet')}</>}
          </Button>
          <p className="text-xs text-center text-amber-600">⚠️ {t('usePiBrowser')}</p>
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
            <button onClick={refreshBalance} disabled={isRefreshing} className="p-1 hover:bg-green-200 rounded" title={t('refreshBalance')}>
              <RefreshCw className={`w-4 h-4 text-green-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowBalance(!showBalance)} className="p-1 hover:bg-green-200 rounded" title={showBalance ? t('hideBalance') : t('showBalance')}>
              {showBalance ? <EyeOff className="w-4 h-4 text-green-600" /> : <Eye className="w-4 h-4 text-green-600" />}
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <p className="text-xs text-gray-500 mb-1">{t('availableBalance')}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-green-700">
              {showBalance ? (balance !== null ? `${balance.toFixed(2)}` : t('loading')) : '••••••'}
            </span>
            <span className="text-sm text-gray-500">π</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <p className="text-xs text-gray-500 mb-1">{t('walletAddress')}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-gray-100 p-2 rounded break-all">
              {user?.walletAddress || t('notAvailable')}
            </code>
            {user?.walletAddress && user.walletAddress !== t('notAvailable') && (
              <button onClick={handleCopyAddress} className="p-2 hover:bg-gray-200 rounded" title={t('copyAddress')}>
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <p className="text-xs text-gray-500">{t('userId')}</p>
            <p className="font-mono text-xs truncate">{user?.uid}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <p className="text-xs text-gray-500">{t('status')}</p>
            <p className="font-semibold text-green-600 flex items-center gap-1">
              <Shield className="w-3 h-3" /> {t('connected')}
            </p>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center text-xs text-green-700 border border-green-200">
          🔐 {t('productionMode')}
        </div>
        <Button onClick={handleDisconnect} variant="destructive" className="w-full">
          <LogOut className="w-4 h-4 mr-2" /> {t('disconnect')}
        </Button>
      </CardContent>
    </Card>
  )
}