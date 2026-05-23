// Message types
export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  isTyping?: boolean;
  language?: 'fr' | 'en' | 'pt';
  image?: string | null; // Base64 image data
  metadata?: MessageMetadata;
}

// Métadonnées du message
export interface MessageMetadata {
  tokens?: number;
  processingTime?: number;
  model?: string;
  source?: 'cache' | 'api';
  confidence?: number;
}

// Session types
export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  isActive: boolean;
}

// Payment types
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'completed' | 'failed' | 'cancelled';
  memo: string;
  metadata?: Record<string, any>;
  txid?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Subscription types
export interface Subscription {
  id: string;
  tier: 'free' | 'weekly' | 'monthly' | 'premium';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  features: SubscriptionFeatures;
  paymentId?: string;
}

export interface SubscriptionFeatures {
  unlimitedQuestions: boolean;
  imageAnalysis: boolean;
  advancedReports: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

// User types
export interface User {
  uid: string;
  username: string;
  walletAddress?: string;
  subscription: Subscription | null;
  createdAt: Date;
  lastActiveAt: Date;
  totalQuestions: number;
  totalImagesAnalyzed: number;
}

// Analytics types
export interface AnalyticsEvent {
  id: string;
  type: 'message_sent' | 'image_uploaded' | 'subscription_purchased' | 'payment_completed';
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Chat API Request
export interface ChatRequest {
  message: string;
  language?: 'fr' | 'en' | 'pt';
  image?: string;
  sessionId?: string;
  history?: Message[];
}

// Chat API Response
export interface ChatResponse {
  response: string;
  language: string;
  tokens?: number;
  processingTime?: number;
  model?: string;
}

// Helper functions
export function createMessage(
  text: string,
  sender: 'user' | 'ai',
  options?: Partial<Omit<Message, 'id' | 'text' | 'sender'>>
): Message {
  return {
    id: Date.now().toString(),
    text,
    sender,
    timestamp: new Date(),
    isTyping: false,
    language: 'fr',
    image: null,
    ...options,
  };
}

export function createUserMessage(text: string, image?: string): Message {
  return createMessage(text, 'user', { image });
}

export function createAIMessage(text: string, language?: 'fr' | 'en' | 'pt'): Message {
  return createMessage(text, 'ai', { language });
}

export function createTypingMessage(): Message {
  return createMessage('...', 'ai', { isTyping: true, id: 'typing' });
}

// Utility functions
export function isUserMessage(message: Message): boolean {
  return message.sender === 'user';
}

export function isAIMessage(message: Message): boolean {
  return message.sender === 'ai';
}

export function isTypingMessage(message: Message): boolean {
  return message.isTyping === true;
}

export function formatMessageDate(message: Message, locale: string = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(message.timestamp);
}

export function formatMessageFullDate(message: Message, locale: string = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(message.timestamp);
}

// Session helpers
export function createSession(): ChatSession {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };
}

export function addMessageToSession(session: ChatSession, message: Message): ChatSession {
  return {
    ...session,
    messages: [...session.messages, message],
    updatedAt: new Date(),
  };
}

export function getLastMessage(session: ChatSession): Message | null {
  return session.messages.length > 0 ? session.messages[session.messages.length - 1] : null;
}

export function getMessageCount(session: ChatSession): number {
  return session.messages.length;
}

export function getUserMessageCount(session: ChatSession): number {
  return session.messages.filter(m => m.sender === 'user').length;
}

export function getAIMessageCount(session: ChatSession): number {
  return session.messages.filter(m => m.sender === 'ai').length;
}

// Payment helpers
export function createPayment(
  amount: number,
  memo: string,
  metadata?: Record<string, any>
): Payment {
  return {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    amount,
    currency: 'π',
    status: 'pending',
    memo,
    metadata,
    createdAt: new Date(),
  };
}

export function isPaymentCompleted(payment: Payment): boolean {
  return payment.status === 'completed';
}

export function isPaymentPending(payment: Payment): boolean {
  return payment.status === 'pending' || payment.status === 'approved';
}

// Subscription helpers
export function createSubscription(tier: Subscription['tier'], autoRenew: boolean = true): Subscription {
  const now = new Date();
  let endDate = new Date();
  
  switch (tier) {
    case 'weekly':
      endDate.setDate(now.getDate() + 7);
      break;
    case 'monthly':
    case 'premium':
      endDate.setMonth(now.getMonth() + 1);
      break;
    default:
      endDate.setDate(now.getDate() + 30);
  }
  
  return {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    tier,
    status: 'active',
    startDate: now,
    endDate,
    autoRenew,
    features: getFeaturesForTier(tier),
  };
}

export function getFeaturesForTier(tier: Subscription['tier']): SubscriptionFeatures {
  const baseFeatures: SubscriptionFeatures = {
    unlimitedQuestions: false,
    imageAnalysis: false,
    advancedReports: false,
    prioritySupport: false,
    apiAccess: false,
  };
  
  switch (tier) {
    case 'weekly':
      return {
        ...baseFeatures,
        unlimitedQuestions: true,
        imageAnalysis: true,
      };
    case 'monthly':
    case 'premium':
      return {
        ...baseFeatures,
        unlimitedQuestions: true,
        imageAnalysis: true,
        advancedReports: true,
        prioritySupport: true,
        apiAccess: true,
      };
    default:
      return baseFeatures;
  }
}

export function isSubscriptionActive(subscription: Subscription): boolean {
  return subscription.status === 'active' && new Date() < subscription.endDate;
}

export function getDaysRemaining(subscription: Subscription): number {
  const now = new Date();
  const diff = subscription.endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}