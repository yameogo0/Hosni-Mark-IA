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

  // Détection automatique de la langue
  const detectLanguage = useCallback((text: string): 'fr' | 'en' | 'pt' => {
    const textLower = text.toLowerCase()
    if (textLower.includes('bom dia') || textLower.includes('obrigado')) return 'pt'
    if (textLower.includes('hello') || textLower.includes('thank you')) return 'en'
    return 'fr'
  }, [])

  // Connexion automatique en mode démo
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("🏖️ Mode démo - Authentification automatique")
      setPiAccessToken("demo_token_" + Date.now())
      setIsAuthenticated(true)
      setAuthMessage("✅ Connecté")
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Afficher le message "réflexion..."
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

    let seconds = 0
    thinkingTimerRef.current = setInterval(() => {
      seconds += 1
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === 'thinking'
            ? { ...msg, text: `${currentLanguage === 'fr' ? 'Réflexion' : currentLanguage === 'pt' ? 'Pensando' : 'Thinking'}... (${seconds}s)` }
            : msg
        )
      )
    }, 1000)
  }, [currentLanguage])

  // Cacher le message "réflexion..."
  const hideThinking = useCallback(() => {
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current)
      thinkingTimerRef.current = null
    }
    setMessages(prev => prev.filter(msg => msg.id !== 'thinking'))
  }, [])

  // Envoyer un message
  const sendMessage = useCallback(async () => {
    if (!input.trim() && !selectedImage) return

    const userLanguage = detectLanguage(input)
    setCurrentLanguage(userLanguage)

    // Message utilisateur
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
      // Appel à l'API Groq
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
        text: data.response || "❌ Désolé, une erreur s'est produite. Veuillez réessayer.",
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
  }, [input, selectedImage, detectLanguage, showThinking, hideThinking])

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

  // Nettoyage
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