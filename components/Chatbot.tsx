// components/Chatbot.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, User, Bot, Sparkles, Loader2 } from 'lucide-react'
import { useChatbot } from '@/hooks/use-chatbot'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { COLORS } from '@/lib/app-config'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  isTyping?: boolean
}

export default function Chatbot() {
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
  } = useChatbot()

  const { bottomRef } = useScrollToBottom([messages])

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
            Hosni IA
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
      <Card className="w-full max-w-2xl h-[600px] flex flex-col shadow-2xl border-primary/20">
        <CardHeader className="text-white rounded-t-lg" style={{ backgroundColor: COLORS.PRIMARY }}>
          <CardTitle className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-xl font-bold">Hosni IA</span>
            </div>
            <div className="text-xs opacity-90 mt-2 font-normal">
              Expert en Marketing, Commerce & Stratégies de Croissance
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-md`}
                style={message.sender === 'user' ? { backgroundColor: '#6b7280' } : { backgroundColor: COLORS.PRIMARY }}
              >
                {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`max-w-[75%] p-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'text-white rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}
                style={message.sender === 'user' ? { backgroundColor: COLORS.PRIMARY } : {}}
              >
                {message.isTyping ? (
                  <div className="flex gap-1 py-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardContent>

        <CardFooter className="p-4 border-t bg-muted/30">
          <div className="flex w-full gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question marketing..."
              disabled={isLoading}
              className="flex-1 border-2 focus-visible:ring-primary"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
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
        </CardFooter>
      </Card>
    </div>
  )
}