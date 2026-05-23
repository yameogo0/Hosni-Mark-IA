'use client';

import React from "react"

import { useState, useEffect, useRef } from "react";
import type { Message } from "@/lib/types";
import { usePiNetworkAuthentication } from "./use-pi-network-authentication";
import { APP_CONFIG } from "@/lib/app-config";
import { BACKEND_URLS } from "@/lib/system-config";

// Helper function to create messages
const createMessage = (
  text: Message["text"],
  sender: Message["sender"],
  id?: Message["id"]
): Message => ({
  id: id || Date.now().toString(),
  text,
  sender,
  timestamp: new Date(),
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
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showThinking = () => {
    const thinkingMessage = createMessage("Thinking... (0)", "ai", "thinking");
    setMessages((prev) => [...prev, thinkingMessage]);

    let seconds = 0;
    thinkingTimerRef.current = setInterval(() => {
      seconds += 1;
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === "thinking"
            ? { ...msg, text: `Thinking... (${seconds})` }
            : msg
        )
      );
    }, 1000);
  };

  const hideThinking = () => {
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    setMessages((prev) => prev.filter((msg) => msg.id !== "thinking"));
  };

  const sendMessage = async () => {
    if (!isAuthenticated || !piAccessToken || (!input.trim() && !selectedImage)) return;

    const userMessageText = input.trim() || (selectedImage ? "[Image uploaded]" : "");
    const userMessage = createMessage(userMessageText, "user");
    setMessages((prev) => [...prev, userMessage]);
    
    const currentImage = selectedImage;
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    showThinking();

    try {
      // Prepare request body
      const requestBody: any = { message: userMessage.text };
      
      // If there's an image, convert to base64 and include it
      if (currentImage) {
        // In production, you would send this to a vision API endpoint
        // For now, we'll include it in the request
        requestBody.image = currentImage.preview;
        requestBody.hasImage = true;
      }

      const response = await fetch(BACKEND_URLS.CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: piAccessToken,
        },
        body: JSON.stringify(requestBody),
      });

      hideThinking();

      if (response.status === 429) {
        const errorData = await response.json();
        const errorMessage = createMessage(
          errorData.error_type === "daily_limit_exceeded"
            ? errorData.error
            : "Too many requests. Please try again later.",
          "ai"
        );
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const data = await response.json();

      if (data.messages && Array.isArray(data.messages)) {
        const aiMsg = data.messages
          .reverse()
          .find((m: any) => m.sender === "ai");
        const botMessage = createMessage(
          aiMsg ? aiMsg.text : "No AI response received.",
          "ai"
        );
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage = createMessage("No response from backend.", "ai");
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      hideThinking();
      const errorMessage = createMessage("Error contacting backend.", "ai");
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage({ file, preview });
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
  };

  // Cleanup function
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

    // Actions
    sendMessage,
    handleKeyPress,
    handleInputChange,
    handleImageSelect,
    handleImageRemove,
  };
};
