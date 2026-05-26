'use client'

import { useState, useEffect } from 'react'

export const useChatbot = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Connexion...")
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    // Connexion automatique en mode démo
    setTimeout(() => {
      setPiAccessToken("demo_token")
      setIsAuthenticated(true)
      setAuthMessage("Connecté")
    }, 500)
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return
    
    const userMessage = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simuler une réponse IA
    setTimeout(() => {
      const aiMessage = { 
        id: (Date.now() + 1).toString(), 
        text: "Merci pour votre message. Je suis Hosni IA, votre expert en marketing. Comment puis-je vous aider ?", 
        sender: 'ai', 
        timestamp: new Date() 
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  return {
    messages,
    input,
    isLoading,
    isAuthenticated,
    authMessage,
    error,
    selectedImage,
    piAccessToken,
    sendMessage,
    handleKeyPress: (e: any) => { if (e.key === 'Enter') sendMessage() },
    handleInputChange: (e: any) => setInput(e.target.value),
    handleImageSelect: () => {},
    handleImageRemove: () => {},
  }
}
