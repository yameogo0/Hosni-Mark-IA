export const dynamic = 'force-dynamic'
export const revalidate = 0

'use client'

import type React from "react"
import { useState, useEffect, useCallback, Suspense } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, User, Bot, Sparkles, AlertCircle, WalletIcon, Loader2, Crown } from "lucide-react"
import { useChatbot } from "@/hooks/use-chatbot"
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom"
import { useSubscriptionStatus } from "@/hooks/use-subscription-status"
import { APP_CONFIG, COLORS } from "@/lib/app-config"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { usePiWallet } from "@/hooks/use-pi-wallet"
import { LanguageSelector } from "@/components/LanguageSelector"
import { useLanguage } from "@/contexts/LanguageContext"

// Chargement dynamique des composants lourds
const WelcomeMessage = dynamic(() => import("@/components/welcome-message").then(mod => mod.WelcomeMessage), { ssr: false })
const SubscriptionBanner = dynamic(() => import("@/components/subscription-banner").then(mod => mod.SubscriptionBanner), { ssr: false })
const SubscriptionStatusIndicator = dynamic(() => import("@/components/subscription-status").then(mod => mod.SubscriptionStatusIndicator), { ssr: false })
const ImageUpload = dynamic(() => import("@/components/image-upload").then(mod => mod.ImageUpload), { ssr: false })
const PaymentModal = dynamic(() => import("@/components/payment-modal").then(mod => mod.PaymentModal), { ssr: false })

declare global {
  interface Window {
    Pi: any
  }
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

export default function ChatBot() {
  const [mounted, setMounted] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isPiSDKReady, setIsPiSDKReady] = useState(false)
  const { toast } = useToast()
  const { language, setLanguage, t } = useLanguage()
  
  const chatbot = useChatbot()
  const subscriptionStatus = useSubscriptionStatus()
  const { bottomRef } = useScrollToBottom([chatbot.messages])
  const { isAuthenticated: isPiAuthenticated } = usePiWallet()

  const {
    messages,
    input,
    isLoading,
    isAuthenticated,
    authMessage,
    error,
    sendMessage,
    handleKeyPress,
    handleInputChange,
    selectedImage,
    handleImageSelect,
    handleImageRemove,
    piAccessToken,
  } = chatbot

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const checkPiSDK = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        setIsPiSDKReady(true)
        console.log('✅ Pi SDK prêt dans ChatBot')
        return true
      }
      return false
    }

    if (checkPiSDK()) return

    const interval = setInterval(() => {
      if (checkPiSDK()) clearInterval(interval)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const handleSubscribeClick = useCallback(async () => {
    if (!isPiAuthenticated) {
      toast({
        title: t('subscriptionRequired'),
        description: t('connectWalletFirst'),
      })
      return
    }
    setIsPaymentModalOpen(true)
  }, [isPiAuthenticated, toast, t])

  const handlePaymentSuccess = useCallback(() => {
    toast({
      title: t('subscriptionActivated'),
      description: t('premiumAccess'),
    })
    setTimeout(() => window.location.reload(), 1500)
  }, [toast, t])

  const hasPremiumAccess = useCallback(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('hinos_subscription')
    if (saved) {
      try {
        const sub = JSON.parse(saved)
        return sub.active && new Date(sub.expiresAt) > new Date()
      } catch {
        return false
      }
    }
    return subscriptionStatus?.canAskQuestion || false
  }, [subscriptionStatus?.canAskQuestion])

  const isPremium = hasPremiumAccess()
  const isFirstMessage = messages.length === 1 && messages[0]?.id === "1"

  if (!mounted) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {APP_CONFIG.NAME}
          </div>
          <div className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {t('expertTitle')}
          </div>
          <div className={`text-base mt-6 ${error ? 'text-destructive' : 'text-foreground'}`}>
            {error || authMessage || t('connecting')}
          </div>
          {!error && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <Button
              className="mt-6"
              style={{ backgroundColor: COLORS.PRIMARY }}
              onClick={() => window.location.reload()}
            >
              {t('retry')}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: COLORS.BACKGROUND }}>
      <Card className="w-full max-w-2xl h-[700px] flex flex-col shadow-2xl border-primary/20">
        <CardHeader className="text-white rounded-t-lg" style={{ backgroundColor: COLORS.PRIMARY }}>
          <CardTitle className="text-center">
            <div className="flex items-center justify-between">
              <div className="w-8" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-xl font-bold">{APP_CONFIG.NAME}</span>
                {isPremium && (
                  <span className="ml-2 bg-yellow-400 text-purple-900 text-xs px-2 py-0.5 rounded-full font-semibold">
                    <Crown className="w-3 h-3 inline mr-1" />
                    Premium
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <LanguageSelector 
                  currentLang={language} 
                  onLanguageChange={setLanguage}
                  showLabel={false}
                />
                <Link href="/settings">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <WalletIcon className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="text-xs opacity-90 mt-2 font-normal">
              {t('expertTitle')}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {isFirstMessage && (
            <Suspense fallback={<LoadingSpinner />}>
              <div className="space-y-4">
                <SubscriptionStatusIndicator status={subscriptionStatus} />
                <WelcomeMessage />
                <SubscriptionBanner onSubscribeClick={handleSubscribeClick} />
              </div>
            </Suspense>
          )}
          
          {!isFirstMessage && (
            <div className="sticky top-0 z-10 pb-2">
              <SubscriptionStatusIndicator status={subscriptionStatus} />
            </div>
          )}

          {messages.map((message) => {
            if (message.id === "1" && isFirstMessage) return null
            
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-md`}
                  style={message.sender === "user" ? { backgroundColor: "#6b7280" } : { backgroundColor: COLORS.PRIMARY }}
                >
                  {message.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    message.sender === "user"
                      ? "text-white rounded-tr-sm"
                      : message.id === "thinking"
                        ? "bg-muted text-muted-foreground italic rounded-tl-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                  style={message.sender === "user" ? { backgroundColor: COLORS.PRIMARY } : {}}
                >
                  {message.isTyping ? (
                    <div className="flex gap-1 py-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </CardContent>

        <CardFooter className="p-4 border-t bg-muted/30 space-y-3 flex-col">
          {!subscriptionStatus.canAskQuestion && !isPremium && (
            <Alert variant="destructive" className="py-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {t('dailyLimitReached')} • {subscriptionStatus.questionsLimit} {t('questionsPerDay')}
                  </AlertDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 bg-background"
                  onClick={handleSubscribeClick}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {t('upgrade')}
                </Button>
              </div>
            </Alert>
          )}

          {subscriptionStatus.hasImageAccess && (
            <div className="flex items-center gap-2 w-full">
              <ImageUpload
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                selectedImage={selectedImage}
                disabled={isLoading}
              />
              {selectedImage && (
                <span className="text-[10px] text-muted-foreground truncate flex-1">
                  🖼️ {t('imageReady')}
                </span>
              )}
            </div>
          )}

          <div className="flex w-full gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={
                subscriptionStatus.hasImageAccess && selectedImage
                  ? t('describeImage')
                  : t('askQuestion')
              }
              disabled={isLoading || (!subscriptionStatus.canAskQuestion && !isPremium)}
              className="flex-1 border-2 focus-visible:ring-primary"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || (!subscriptionStatus.canAskQuestion && !isPremium) || (!input.trim() && !selectedImage)}
              className="hover:opacity-90 transition-opacity shadow-md"
              style={{ backgroundColor: COLORS.PRIMARY }}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
          
          <div className="text-[10px] text-muted-foreground text-center w-full space-x-2">
            <span>⚡ {t('poweredBy')}</span>
            <span>•</span>
            <span>🔒 {t('securePayments')}</span>
            <span>•</span>
            <Link href="/settings" className="underline hover:text-foreground">
              ⚙️ {t('wallet')}
            </Link>
            <span>•</span>
            <Link href="/diagnostic" className="underline hover:text-foreground">
              📊 {t('diagnostic')}
            </Link>
          </div>
        </CardFooter>
      </Card>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        accessToken={piAccessToken}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
