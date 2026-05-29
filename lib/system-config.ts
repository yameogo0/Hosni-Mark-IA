// lib/system-config.ts - Ajoutez ces exports
export const BACKEND_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com",
  BLOCKCHAIN_BASE_URL: process.env.NEXT_PUBLIC_BLOCKCHAIN_URL || "https://api.testnet.minepi.com",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const BACKEND_URLS = {
  LOGIN: `${BACKEND_CONFIG.BASE_URL}/v1/login`,
  LOGIN_PREVIEW: `${BACKEND_CONFIG.BASE_URL}/v1/login/preview`,
  LOGOUT: `${BACKEND_CONFIG.BASE_URL}/v1/logout`,
  REFRESH_TOKEN: `${BACKEND_CONFIG.BASE_URL}/v1/refresh`,
  CHAT: `${BACKEND_CONFIG.BASE_URL}/v1/chat/default`,
  CHAT_WITH_IMAGE: `${BACKEND_CONFIG.BASE_URL}/v1/chat/with-image`,
  CHAT_HISTORY: (sessionId: string) => `${BACKEND_CONFIG.BASE_URL}/v1/chat/${sessionId}/history`,
  CLEAR_CHAT: (sessionId: string) => `${BACKEND_CONFIG.BASE_URL}/v1/chat/${sessionId}/clear`,
  GET_PRODUCTS: (appId: string) => `${BACKEND_CONFIG.BASE_URL}/v1/apps/${appId}/products`,
  GET_PRODUCT: (appId: string, productId: string) => `${BACKEND_CONFIG.BASE_URL}/v1/apps/${appId}/products/${productId}`,
  GET_PAYMENT: (paymentId: string) => `${BACKEND_CONFIG.BASE_URL}/proxy/v2/payments/${paymentId}`,
  APPROVE_PAYMENT: (paymentId: string) => `${BACKEND_CONFIG.BASE_URL}/proxy/v2/payments/${paymentId}/approve`,
  COMPLETE_PAYMENT: (paymentId: string) => `${BACKEND_CONFIG.BASE_URL}/proxy/v2/payments/${paymentId}/complete`,
  CANCEL_PAYMENT: (paymentId: string) => `${BACKEND_CONFIG.BASE_URL}/proxy/v2/payments/${paymentId}/cancel`,
  SUBSCRIPTION_STATUS: `${BACKEND_CONFIG.BASE_URL}/v1/subscription/status`,
  SUBSCRIPTION_CANCEL: `${BACKEND_CONFIG.BASE_URL}/v1/subscription/cancel`,
  SUBSCRIPTION_HISTORY: `${BACKEND_CONFIG.BASE_URL}/v1/subscription/history`,
  WALLET_BALANCE: `${BACKEND_CONFIG.BASE_URL}/v1/wallet/balance`,
  WALLET_TRANSACTIONS: `${BACKEND_CONFIG.BASE_URL}/v1/wallet/transactions`,
  WALLET_ADDRESS: `${BACKEND_CONFIG.BASE_URL}/v1/wallet/address`,
  ANALYTICS_TRACK: `${BACKEND_CONFIG.BASE_URL}/v1/analytics/track`,
  ANALYTICS_STATS: `${BACKEND_CONFIG.BASE_URL}/v1/analytics/stats`,
} as const;