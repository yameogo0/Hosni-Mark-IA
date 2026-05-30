'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  isTyping?: boolean
}

// Messages d'accueil multilingues
const WELCOME_MESSAGES = {
  fr: "Bonjour ! Je suis Hosni IA, votre assistant intelligent spécialisé en marketing, commerce et stratégies de croissance.\n\nPosez-moi vos questions sur :\n• Stratégie de marque\n• Marketing digital\n• Vente et CRM\n• Analyse de données",
  en: "Hello! I am Hosni IA, your intelligent assistant specialized in marketing, commerce and growth strategies.\n\nAsk me about:\n• Brand strategy\n• Digital marketing\n• Sales & CRM\n• Data analysis",
  pt: "Olá! Eu sou Hosni IA, seu assistente inteligente especializado em marketing, comércio e estratégias de crescimento.\n\nPergunte-me sobre:\n• Estratégia de marca\n• Marketing digital\n• Vendas e CRM\n• Análise de dados"
}

// 🔥 MODE DÉMO DÉSACTIVÉ - Pour les vrais paiements
const DEMO_MODE = false

export const useChatbot = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Connexion...")
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: WELCOME_MESSAGES.fr, sender: 'ai', timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en' | 'pt'>('fr')
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const detectLanguage = useCallback((text: string): 'fr' | 'en' | 'pt' => {
    const textLower = text.toLowerCase()
    if (textLower.includes('bom dia') || textLower.includes('obrigado') || textLower.includes('obrigada')) return 'pt'
    if (textLower.includes('hello') || textLower.includes('thank you') || textLower.includes('hi')) return 'en'
    return 'fr'
  }, [])

  // Authentification réelle (pas de mode démo)
  useEffect(() => {
    const authenticate = async () => {
      try {
        if (typeof window !== 'undefined' && window.Pi) {
          setAuthMessage("Authentification Pi...")
          await window.Pi.init({ version: "2.0", sandbox: false })
          
          const auth = await window.Pi.authenticate(
            ['username', 'wallet_address', 'payments'],
            (payment: any) => console.log('Paiement incomplet:', payment)
          )
          
          if (auth && auth.accessToken) {
            setPiAccessToken(auth.accessToken)
            setIsAuthenticated(true)
            setAuthMessage(`✅ Connecté: ${auth.user?.username}`)
          }
        } else {
          setAuthMessage("Veuillez utiliser le Pi Browser")
        }
      } catch (err) {
        console.error(err)
        setError("Erreur de connexion")
        setAuthMessage("❌ Échec de connexion")
      }
    }
    
    authenticate()
  }, [])

  const showThinking = useCallback(() => {
    const thinkingMessage: Message = {
      id: 'thinking',
      text: currentLanguage === 'fr' ? '🤔 Réflexion en cours...' : 
             currentLanguage === 'pt' ? '🤔 Pensando...' : '🤔 Thinking...',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true
    }
    setMessages(prev => [...prev, thinkingMessage])

    let dots = 0
    thinkingTimerRef.current = setInterval(() => {
      dots = (dots + 1) % 4
      const dotText = '.'.repeat(dots)
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === 'thinking'
            ? { 
                ...msg, 
                text: `${currentLanguage === 'fr' ? 'Réflexion' : currentLanguage === 'pt' ? 'Pensando' : 'Thinking'}${dotText}`
              }
            : msg
        )
      )
    }, 500)
  }, [currentLanguage])

  const hideThinking = useCallback(() => {
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current)
      thinkingTimerRef.current = null
    }
    setMessages(prev => prev.filter(msg => msg.id !== 'thinking'))
  }, [])

  const sendMessage = useCallback(async () => {
    if (!input.trim() && !selectedImage) return

    const userLanguage = detectLanguage(input)
    setCurrentLanguage(userLanguage)

    if (messages.length === 1 && messages[0].id === '1') {
      setMessages([{ id: '1', text: WELCOME_MESSAGES[userLanguage], sender: 'ai', timestamp: new Date() }])
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim() || (selectedImage ? "📷 Analyse d'image" : ""),
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    showThinking()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.text, 
          language: userLanguage,
          image: selectedImage?.preview
        })
      })

      hideThinking()
      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "❌ Désolé, une erreur s'est produite.",
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])

      if (selectedImage) setSelectedImage(null)
    } catch (error) {
      hideThinking()
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "❌ Erreur de connexion. Veuillez réessayer.",
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, selectedImage, detectLanguage, showThinking, hideThinking, messages.length])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const handleImageSelect = useCallback((file: File, preview: string) => {
    setSelectedImage({ file, preview })
  }, [])

  const handleImageRemove = useCallback(() => {
    setSelectedImage(null)
  }, [])

  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current)
    }
  }, [])

  return {
    messages,
    input,
    isLoading,
    isAuthenticated,
    authMessage,
    error,
    selectedImage,
    piAccessToken,
    currentLanguage,
    sendMessage,
    handleKeyPress,
    handleInputChange,
    handleImageSelect,
    handleImageRemove,
  }
}