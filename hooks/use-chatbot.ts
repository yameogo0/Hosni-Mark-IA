'use client';

import React from "react"
import { useState, useEffect, useRef, useCallback } from "react";
import type { Message } from "@/lib/types";
import { usePiNetworkAuthentication } from "./use-pi-network-authentication";
import { APP_CONFIG } from "@/lib/app-config";

// Types pour le multilingue
export type Language = 'fr' | 'en' | 'pt';

// Messages multilingues
const MESSAGES = {
  fr: {
    thinking: "Réflexion en cours...",
    thinkingWithCount: "Réflexion en cours... ({count})",
    noResponse: "Aucune réponse reçue du serveur.",
    errorBackend: "Erreur de connexion au serveur.",
    imageUploaded: "Image téléchargée",
    dailyLimit: "Limite quotidienne atteinte. Veuillez réessayer demain.",
    tooManyRequests: "Trop de requêtes. Veuillez réessayer plus tard."
  },
  en: {
    thinking: "Thinking...",
    thinkingWithCount: "Thinking... ({count})",
    noResponse: "No response received from server.",
    errorBackend: "Error connecting to server.",
    imageUploaded: "Image uploaded",
    dailyLimit: "Daily limit reached. Please try again tomorrow.",
    tooManyRequests: "Too many requests. Please try again later."
  },
  pt: {
    thinking: "Pensando...",
    thinkingWithCount: "Pensando... ({count})",
    noResponse: "Nenhuma resposta recebida do servidor.",
    errorBackend: "Erro ao conectar ao servidor.",
    imageUploaded: "Imagem enviada",
    dailyLimit: "Limite diário atingido. Tente novamente amanhã.",
    tooManyRequests: "Muitas solicitações. Tente novamente mais tarde."
  }
};

// Détection de la langue
export const detectLanguage = (text: string): Language => {
  const textLower = text.toLowerCase();
  
  const portugueseKeywords = ['obrigado', 'obrigada', 'por favor', 'oi', 'olá', 'tudo bem', 'como vai', 'obg', 'bom dia', 'boa tarde', 'boa noite', 'legal', 'amigo'];
  const englishKeywords = ['hello', 'hi', 'thank you', 'please', 'good morning', 'good afternoon', 'good evening', 'how are you', 'thanks', 'hey'];
  const frenchKeywords = ['bonjour', 'merci', 's\'il vous plaît', 'stp', 'svp', 'salut', 'coucou', 'bonsoir', 'comment ça va', 'ça va'];
  
  for (const word of portugueseKeywords) if (textLower.includes(word)) return 'pt';
  for (const word of englishKeywords) if (textLower.includes(word)) return 'en';
  for (const word of frenchKeywords) if (textLower.includes(word)) return 'fr';
  
  return 'fr';
};

// Helper function to create messages
export const createMessage = (
  text: Message["text"],
  sender: Message["sender"],
  id?: Message["id"],
  language?: Language
): Message => ({
  id: id || Date.now().toString(),
  text,
  sender,
  timestamp: new Date(),
  language: language || 'fr',
});

export const useChatbot = () => {
  const { isAuthenticated, authMessage, piAccessToken, error } =
    usePiNetworkAuthentication();

  const [messages, setMessages] = useState<Message[]>([
    createMessage(APP_CONFIG.WELCOME_MESSAGE, "ai", "1"),
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('fr');
  const [detectedLanguage, setDetectedLanguage] = useState<Language>('fr');
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Détecter la langue à partir de l'input
  const detectAndSetLanguage = useCallback((text: string) => {
    const detected = detectLanguage(text);
    setDetectedLanguage(detected);
    if (detected !== currentLanguage) {
      setCurrentLanguage(detected);
    }
    return detected;
  }, [currentLanguage]);

  // Obtenir le message dans la bonne langue
  const getLocalizedMessage = useCallback((key: keyof typeof MESSAGES.fr, count?: number): string => {
    const messages = MESSAGES[currentLanguage];
    if (key === 'thinkingWithCount' && count !== undefined) {
      return messages.thinkingWithCount.replace('{count}', count.toString());
    }
    return messages[key] || MESSAGES.fr[key];
  }, [currentLanguage]);

  const showThinking = useCallback(() => {
    const thinkingText = getLocalizedMessage('thinking');
    const thinkingMessage = createMessage(thinkingText, "ai", "thinking", currentLanguage);
    setMessages((prev) => [...prev, thinkingMessage]);

    let seconds = 0;
    thinkingTimerRef.current = setInterval(() => {
      seconds += 1;
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === "thinking"
            ? { ...msg, text: getLocalizedMessage('thinkingWithCount', seconds) }
            : msg
        )
      );
    }, 1000);
  }, [getLocalizedMessage, currentLanguage]);

  const hideThinking = useCallback(() => {
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    setMessages((prev) => prev.filter((msg) => msg.id !== "thinking"));
  }, []);

  const sendMessage = useCallback(async () => {
    if (!isAuthenticated || !piAccessToken || (!input.trim() && !selectedImage)) return;

    const userMessageText = input.trim() || (selectedImage ? getLocalizedMessage('imageUploaded') : "");
    
    // Détecter la langue du message utilisateur
    const userLanguage = detectLanguage(userMessageText);
    setCurrentLanguage(userLanguage);
    
    const userMessage = createMessage(userMessageText, "user", undefined, userLanguage);
    setMessages((prev) => [...prev, userMessage]);
    
    const currentImage = selectedImage;
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    showThinking();

    try {
      // Préparer la requête avec la langue
      const requestBody: any = { 
        message: userMessage.text,
        language: userLanguage
      };
      
      if (currentImage) {
        requestBody.image = currentImage.preview;
        requestBody.hasImage = true;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      hideThinking();

      if (response.status === 429) {
        const errorData = await response.json();
        const errorMsg = errorData.error_type === "daily_limit_exceeded"
          ? getLocalizedMessage('dailyLimit')
          : getLocalizedMessage('tooManyRequests');
        const errorMessage = createMessage(errorMsg, "ai", undefined, userLanguage);
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const data = await response.json();

      // ✅ CORRECTION : L'API renvoie data.response directement
      if (data.response) {
        const botMessage = createMessage(
          data.response,
          "ai",
          undefined,
          userLanguage
        );
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage = createMessage(getLocalizedMessage('noResponse'), "ai", undefined, userLanguage);
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      hideThinking();
      const errorMessage = createMessage(getLocalizedMessage('errorBackend'), "ai", undefined, currentLanguage);
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, piAccessToken, input, selectedImage, getLocalizedMessage, showThinking, hideThinking, currentLanguage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (newValue.trim()) {
      detectAndSetLanguage(newValue);
    }
  }, [detectAndSetLanguage]);

  const handleImageSelect = useCallback((file: File, preview: string) => {
    setSelectedImage({ file, preview });
  }, []);

  const handleImageRemove = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Changer manuellement la langue
  const changeLanguage = useCallback((lang: Language) => {
    setCurrentLanguage(lang);
    setDetectedLanguage(lang);
  }, []);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    messages,
    input,
    isLoading,
    isAuthenticated,
    authMessage,
    error,
    selectedImage,
    piAccessToken,
    currentLanguage,
    detectedLanguage,

    // Actions
    sendMessage,
    handleKeyPress,
    handleInputChange,
    handleImageSelect,
    handleImageRemove,
    changeLanguage,
  };
};

// Hook pour le sélecteur de langue (sans JSX)
export const useLanguageSelector = () => {
  const [language, setLanguage] = useState<Language>('fr');
  
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('hosni_ia_language', lang);
  };
  
  useEffect(() => {
    const saved = localStorage.getItem('hosni_ia_language') as Language;
    if (saved && ['fr', 'en', 'pt'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);
  
  return { language, changeLanguage };
};