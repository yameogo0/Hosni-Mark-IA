cat > components/ChatBotClient.tsx << 'EOF'
'use client'

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, User, Bot, Sparkles, AlertCircle, WalletIcon, Loader2, Crown } from "lucide-react"
import { useChatbot } from "@/hooks/use-chatbot"
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom"
import { useSubscriptionStatus } from "@/hooks/use-subscription-status"
import { APP_CONFIG, COLORS } from "@/lib/app-config"
import { WelcomeMessage } from "@/components/welcome-message"
import { SubscriptionBanner } from "@/components/subscription-banner"
import { SubscriptionStatusIndicator } from "@/components/subscription-status"
import { ImageUpload } from "@/components/image-upload"
import { PaymentModal } from "@/components/payment-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { usePiWallet } from "@/hooks/use-pi-wallet"

declare global {
  interface Window {
    Pi: any
  }
}

export default function ChatBotClient() {
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
  } = useChatbot()

  const subscriptionStatus = useSubscriptionStatus()
  const { bottomRef } = useScrollToBottom([messages])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isPiSDKReady, setIsPiSDKReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  
  const { isAuthenticated: isPiAuthenticated } = usePiWallet()

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
        title: "Wallet requis",
        description: "Veuillez d'abord connecter votre wallet Pi dans les paramètres.",
      })
      return
    }
    setIsPaymentModalOpen(true)
  }, [isPiAuthenticated, toast])

  const handlePaymentSuccess = useCallback(() => {
    toast({
      title: "🎉 Abonnement activé!",
      description: "Vous avez maintenant accès à toutes les fonctionnalités premium.",
    })
    setTimeout(() => window.location.reload(), 1500)
  }, [toast])

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
  const isFirstMessage = messages.length === 1 && messages[0].id === "1"

  if (!mounted) {
    return null
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
            Votre Expert en Marketing & Commerce 24/7
          </div>
          <div className={`text-base mt-6 ${error ? 'text-destructive' : 'text-foreground'}`}>
            {error || authMessage || "Connexion en cours..."}
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
              Réessayer
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
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <WalletIcon className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="text-xs opacity-90 mt-2 font-normal">
              Expert en Marketing, Commerce & Stratégies de Croissance
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
          {isFirstMessage && (
            <div className="space-y-4 animate-fade-in">
              <SubscriptionStatusIndicator status={subscriptionStatus} />
              <WelcomeMessage />
              <SubscriptionBanner onSubscribeClick={handleSubscribeClick} />
            </div>
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
                className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"} animate-slide-up`}
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
                    Limite quotidienne atteinte • {subscriptionStatus.questionsLimit} questions/jour
                  </AlertDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 bg-background"
                  onClick={handleSubscribeClick}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
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
                  🖼️ Image prête à analyser
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
                  ? "Décrivez ce que vous voulez analyser..."
                  : "Posez votre question marketing..."
              }
              disabled={isLoading || (!subscriptionStatus.canAskQuestion && !isPremium)}
              className="flex-1 border-2 focus-visible:ring-primary"
            />
            <Button
              onClick={sendMessage}
              disabled={
                isLoading || 
                (!subscriptionStatus.canAskQuestion && !isPremium) || 
                (!input.trim() && !selectedImage)
              }
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
            <span>⚡ Propulsé par Pi Network</span>
            <span>•</span>
            <span>🔒 Paiements sécurisés</span>
            <span>•</span>
            <Link href="/settings" className="underline hover:text-foreground">
              ⚙️ Wallet
            </Link>
            <span>•</span>
            <Link href="/diagnostic" className="underline hover:text-foreground">
              📊 Diagnostic
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
EOF