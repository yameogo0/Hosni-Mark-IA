'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { usePiNetworkAuthentication } from "./use-pi-network-authentication";
import { BACKEND_CONFIG } from "@/lib/system-config";

export type SubscriptionTier = "free" | "weekly" | "monthly";

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  questionsUsedToday: number;
  questionsLimit: number;
  hasImageAccess: boolean;
  isLoading: boolean;
  error: string | null;
  expiresAt?: Date | null;
  isActive: boolean;
}

interface BackendSubscriptionResponse {
  tier: SubscriptionTier;
  questions_used_today: number;
  questions_limit: number;
  has_image_access: boolean;
  expires_at?: string;
  is_active: boolean;
}

export const useSubscriptionStatus = () => {
  const { piAccessToken, isAuthenticated } = usePiNetworkAuthentication();
  
  const [status, setStatus] = useState<SubscriptionStatus>({
    tier: "free",
    questionsUsedToday: 0,
    questionsLimit: 10,
    hasImageAccess: false,
    isLoading: true,
    error: null,
    expiresAt: null,
    isActive: false,
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Nettoyage
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!isAuthenticated || !piAccessToken) {
      if (isMountedRef.current) {
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
      return;
    }

    try {
      // Appel au backend réel
      const baseUrl = BACKEND_CONFIG?.BASE_URL || process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${baseUrl}/v1/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${piAccessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: BackendSubscriptionResponse = await response.json();
      
      if (!isMountedRef.current) return;

      setStatus({
        tier: data.tier,
        questionsUsedToday: data.questions_used_today,
        questionsLimit: data.questions_limit,
        hasImageAccess: data.has_image_access,
        isLoading: false,
        error: null,
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
        isActive: data.is_active,
      });
    } catch (error) {
      console.error('Erreur chargement statut abonnement:', error);
      
      if (!isMountedRef.current) return;

      // Fallback en mode développement
      if (process.env.NODE_ENV === 'development') {
        console.log('🏖️ Mode développement - Simulation du statut');
        setStatus({
          tier: "free",
          questionsUsedToday: 3,
          questionsLimit: 10,
          hasImageAccess: false,
          isLoading: false,
          error: null,
          expiresAt: null,
          isActive: false,
        });
      } else {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: "Impossible de charger le statut de l'abonnement",
        }));
      }
    }
  }, [isAuthenticated, piAccessToken]);

  // Récupérer le statut au chargement
  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  // Rafraîchissement périodique (toutes les 2 minutes)
  useEffect(() => {
    if (isAuthenticated && piAccessToken) {
      refreshIntervalRef.current = setInterval(() => {
        fetchSubscriptionStatus();
      }, 120000); // 2 minutes
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAuthenticated, piAccessToken, fetchSubscriptionStatus]);

  const incrementQuestionCount = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      questionsUsedToday: prev.questionsUsedToday + 1,
    }));
  }, []);

  const canAskQuestion = status.tier === "weekly" || status.tier === "monthly" 
    ? true 
    : status.questionsUsedToday < status.questionsLimit;

  const getRemainingQuestions = useCallback(() => {
    if (status.tier === "weekly" || status.tier === "monthly") {
      return Infinity;
    }
    return Math.max(0, status.questionsLimit - status.questionsUsedToday);
  }, [status.tier, status.questionsLimit, status.questionsUsedToday]);

  const getUsagePercentage = useCallback(() => {
    if (status.tier === "weekly" || status.tier === "monthly") {
      return 0;
    }
    return (status.questionsUsedToday / status.questionsLimit) * 100;
  }, [status.tier, status.questionsUsedToday, status.questionsLimit]);

  const getDaysRemaining = useCallback(() => {
    if (!status.expiresAt || status.tier === "free") return null;
    const now = new Date();
    const diff = status.expiresAt.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [status.expiresAt, status.tier]);

  const refresh = useCallback(() => {
    setStatus(prev => ({ ...prev, isLoading: true }));
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const isPremium = status.tier === "weekly" || status.tier === "monthly";
  const isNearLimit = !isPremium && getRemainingQuestions() <= 3;
  const isLimitReached = !isPremium && getRemainingQuestions() <= 0;

  return {
    ...status,
    incrementQuestionCount,
    canAskQuestion,
    getRemainingQuestions,
    getUsagePercentage,
    getDaysRemaining,
    refresh,
    isPremium,
    isNearLimit,
    isLimitReached,
  };
};

// Hook pour les limites de questions (plus simple, sans JSX)
export const useQuestionLimit = () => {
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [limit] = useState(10);
  const [isPremium, setIsPremium] = useState(false);

  const increment = useCallback(() => {
    if (!isPremium) {
      setQuestionsUsed(prev => prev + 1);
    }
  }, [isPremium]);

  const canAsk = isPremium || questionsUsed < limit;
  const remaining = isPremium ? Infinity : Math.max(0, limit - questionsUsed);
  const percentage = isPremium ? 0 : (questionsUsed / limit) * 100;

  // Vérifier l'abonnement dans localStorage
  useEffect(() => {
    const checkSubscription = () => {
      const saved = localStorage.getItem('hinos_subscription');
      if (saved) {
        try {
          const sub = JSON.parse(saved);
          const expiresAt = new Date(sub.expiresAt);
          if (expiresAt > new Date()) {
            setIsPremium(true);
          }
        } catch (e) {
          console.error('Erreur:', e);
        }
      }
    };
    checkSubscription();
  }, []);

  return {
    questionsUsed,
    limit,
    isPremium,
    increment,
    canAsk,
    remaining,
    percentage,
  };
};