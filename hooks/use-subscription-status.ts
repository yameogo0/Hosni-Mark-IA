'use client';

import { useState, useEffect } from "react";
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
  });

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!isAuthenticated || !piAccessToken) {
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // TODO: Replace with actual backend endpoint when available
        // const response = await fetch(`${BACKEND_CONFIG.BASE_URL}/v1/subscription/status`, {
        //   headers: {
        //     Authorization: piAccessToken,
        //   },
        // });
        // const data = await response.json();
        
        // For now, simulate the response
        // In production, this will come from your backend
        setStatus({
          tier: "free", // Will be "free", "weekly", or "monthly"
          questionsUsedToday: 3, // From backend
          questionsLimit: 10, // 10 for free, unlimited for premium
          hasImageAccess: false, // true for weekly/monthly
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: "Unable to load subscription status",
        }));
      }
    };

    fetchSubscriptionStatus();
  }, [isAuthenticated, piAccessToken]);

  const incrementQuestionCount = () => {
    setStatus(prev => ({
      ...prev,
      questionsUsedToday: prev.questionsUsedToday + 1,
    }));
  };

  const canAskQuestion = () => {
    if (status.tier === "weekly" || status.tier === "monthly") {
      return true; // Unlimited for premium
    }
    return status.questionsUsedToday < status.questionsLimit;
  };

  return {
    ...status,
    incrementQuestionCount,
    canAskQuestion: canAskQuestion(),
  };
};
