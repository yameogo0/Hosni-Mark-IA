// Configuration Pi Network - MODE PRODUCTION
export const PI_NETWORK_CONFIG = {
  SDK_URL: "https://sdk.minepi.com/pi-sdk.js",
  SDK_VERSION: "2.0",
  SANDBOX: false,  // ← Mode production (false = transactions réelles)
  APP_ID: process.env.NEXT_PUBLIC_PI_APP_ID || "",
  API_KEY: process.env.PI_API_KEY || "",
} as const;

// Backend Configuration
export const BACKEND_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com",
  BLOCKCHAIN_BASE_URL: process.env.NEXT_PUBLIC_BLOCKCHAIN_URL || "https://api.testnet.minepi.com",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Backend API URLs
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

// Pi Platform URLs
export const PI_PLATFORM_URLS = {
  MAINNET: "https://api.minepi.com/v2",
  TESTNET: "https://api.testnet.minepi.com/v2",
  EXPLORER_MAINNET: "https://explorer.minepi.com",
  EXPLORER_TESTNET: "https://testnet-explorer.minepi.com",
  DEVELOPER_PORTAL: "https://developers.minepi.com",
  getApiUrl: () => PI_NETWORK_CONFIG.SANDBOX ? PI_PLATFORM_URLS.TESTNET : PI_PLATFORM_URLS.MAINNET,
} as const;

// Pi Blockchain URLs
export const PI_BLOCKCHAIN_URLS = {
  GET_TRANSACTION: (txid: string) => `${BACKEND_CONFIG.BLOCKCHAIN_BASE_URL}/transactions/${txid}`,
  GET_TRANSACTION_EFFECTS: (txid: string) => `${BACKEND_CONFIG.BLOCKCHAIN_BASE_URL}/transactions/${txid}/effects`,
  GET_ACCOUNT: (address: string) => `${BACKEND_CONFIG.BLOCKCHAIN_BASE_URL}/accounts/${address}`,
  GET_ACCOUNT_TRANSACTIONS: (address: string) => `${BACKEND_CONFIG.BLOCKCHAIN_BASE_URL}/accounts/${address}/transactions`,
  GET_NETWORK: `${BACKEND_CONFIG.BLOCKCHAIN_BASE_URL}/network`,
} as const;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timeout' };
      }
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Unknown error occurred' };
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export type NetworkEnvironment = 'mainnet' | 'testnet' | 'sandbox';

export const getNetworkConfig = (env: NetworkEnvironment = 'sandbox') => {
  const configs = {
    mainnet: {
      apiUrl: PI_PLATFORM_URLS.MAINNET,
      explorerUrl: PI_PLATFORM_URLS.EXPLORER_MAINNET,
      sandbox: false,
    },
    testnet: {
      apiUrl: PI_PLATFORM_URLS.TESTNET,
      explorerUrl: PI_PLATFORM_URLS.EXPLORER_TESTNET,
      sandbox: true,
    },
    sandbox: {
      apiUrl: PI_PLATFORM_URLS.TESTNET,
      explorerUrl: PI_PLATFORM_URLS.EXPLORER_TESTNET,
      sandbox: true,
    },
  };
  return configs[env];
};