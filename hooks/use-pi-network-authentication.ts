// LOCKED FILE - Version Production
// 🔥 MODE DÉMO - Mettre à false pour la production
const FORCE_DEMO_MODE = false;

import { useState, useEffect, useCallback, useRef } from "react";
import { PI_NETWORK_CONFIG, BACKEND_URLS } from "@/lib/system-config";

interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
      authenticate: (scopes: string[]) => Promise<PiAuthResult>;
    };
  }
}

const COMMUNICATION_REQUEST_TYPE = '@pi:app:sdk:communication_information_request';
const DEFAULT_ERROR_MESSAGE = 'Failed to authenticate or login. Please refresh and try again.';

function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'SecurityError' || error.code === DOMException.SECURITY_ERR || error.code === 18)
    ) {
      return true;
    }
    if (error instanceof Error && /Permission denied/i.test(error.message)) {
      return true;
    }
    throw error;
  }
}

function parseJsonSafely(value: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }
  return typeof value === 'object' && value !== null ? value : null;
}

const loadPiSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const sdkUrl = PI_NETWORK_CONFIG?.SDK_URL || "https://sdk.minepi.com/pi-sdk.js";
    script.src = sdkUrl;
    script.async = true;

    script.onload = () => {
      console.log("✅ Pi SDK script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("❌ Failed to load Pi SDK script");
      reject(new Error("Failed to load Pi SDK script"));
    };

    document.head.appendChild(script);
  });
};

function requestParentCredentials(): Promise<{ accessToken: string; appId: string | null } | null> {
  if (!isInIframe()) {
    return Promise.resolve(null);
  }

  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const timeoutMs = 10000;

  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = (listener: (event: MessageEvent) => void) => {
      window.removeEventListener('message', listener);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };

    const messageListener = (event: MessageEvent) => {
      if (event.source !== window.parent) {
        return;
      }

      const data = parseJsonSafely(event.data);
      if (!data || data.type !== COMMUNICATION_REQUEST_TYPE || data.id !== requestId) {
        return;
      }

      cleanup(messageListener);

      const payload = typeof data.payload === 'object' && data.payload !== null ? data.payload : {};
      const accessToken = typeof payload.accessToken === 'string' ? payload.accessToken : null;
      const appId = typeof payload.appId === 'string' ? payload.appId : null;

      resolve(accessToken ? { accessToken, appId } : null);
    };

    timeoutId = setTimeout(() => {
      cleanup(messageListener);
      resolve(null);
    }, timeoutMs);

    window.addEventListener('message', messageListener);
    window.parent.postMessage(
      JSON.stringify({
        type: COMMUNICATION_REQUEST_TYPE,
        id: requestId
      }),
      '*'
    );
  });
}

async function loginWithBackend(accessToken: string, appId: string | null): Promise<void> {
  const loginUrl = BACKEND_URLS?.LOGIN_PREVIEW || BACKEND_URLS?.LOGIN || "/api/auth/login";
  let endpoint: string;
  let payload: { pi_auth_token: string; app_id?: string };
  
  if (appId) {
    endpoint = BACKEND_URLS?.LOGIN_PREVIEW || `${loginUrl}/preview`;
    payload = { pi_auth_token: accessToken, app_id: appId };
  } else {
    endpoint = BACKEND_URLS?.LOGIN || loginUrl;
    payload = { pi_auth_token: accessToken };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || DEFAULT_ERROR_MESSAGE);
    }
  } catch (error) {
    throw new Error(DEFAULT_ERROR_MESSAGE);
  }
}

export const usePiNetworkAuthentication = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState("Initializing Pi Network...");
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authAttempted = useRef(false);

  const authenticateViaPiSdk = async (): Promise<void> => {
    setAuthMessage("Initializing Pi Network...");
    
    if (!window.Pi) {
      throw new Error("Pi SDK not available");
    }
    
    await window.Pi.init({ version: '2.0', sandbox: PI_NETWORK_CONFIG?.SANDBOX ?? false });

    setAuthMessage("Authenticating Pi Network...");
    const scopes = ['username', 'wallet_address', 'payments'];
    const piAuthResult = await window.Pi.authenticate(scopes);

    if (!piAuthResult.accessToken) {
      throw new Error(DEFAULT_ERROR_MESSAGE);
    }

    setAuthMessage("Logging in...");
    await loginWithBackend(piAuthResult.accessToken, null);
    setPiAccessToken(piAuthResult.accessToken);
  };

  const initializePiAndAuthenticate = useCallback(async () => {
    if (authAttempted.current) return;
    authAttempted.current = true;
    
    setError(null);
    setIsLoading(true);
    
    // MODE PRODUCTION - Authentification réelle
    if (FORCE_DEMO_MODE) {
      // Ce bloc ne s'exécute pas car FORCE_DEMO_MODE = false
      setTimeout(() => {
        setPiAccessToken("demo_token_" + Date.now());
        setIsAuthenticated(true);
        setAuthMessage("✅ Connecté (mode démo)");
        setIsLoading(false);
      }, 500);
      return;
    }
    
    // Authentification réelle
    try {
      const parentCredentials = await requestParentCredentials();

      if (parentCredentials) {
        setPiAccessToken(parentCredentials.accessToken);
        setAuthMessage("Logging in...");
        await loginWithBackend(parentCredentials.accessToken, parentCredentials.appId);
      } else {
        setAuthMessage("Loading Pi Network SDK...");
        await loadPiSDK();

        if (typeof window.Pi === "undefined") {
          throw new Error("Pi object not available after script load");
        }

        await authenticateViaPiSdk();
      }

      setIsAuthenticated(true);
      setAuthMessage("Connected to Pi Network");
    } catch (err) {
      console.error("❌ Pi Network initialization failed:", err);
      const errorMessage = err instanceof Error && err.message ? err.message : DEFAULT_ERROR_MESSAGE;
      setAuthMessage(errorMessage);
      setError(errorMessage);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializePiAndAuthenticate();
  }, [initializePiAndAuthenticate]);

  const reinitialize = useCallback(() => {
    authAttempted.current = false;
    setIsAuthenticated(false);
    setPiAccessToken(null);
    setError(null);
    setAuthMessage("Initializing Pi Network...");
    initializePiAndAuthenticate();
  }, [initializePiAndAuthenticate]);

  const getAccessToken = useCallback(() => piAccessToken, [piAccessToken]);

  const isAuthenticatedAndReady = isAuthenticated && !!piAccessToken;

  return {
    isAuthenticated: isAuthenticatedAndReady,
    isAuthenticating: isLoading,
    authMessage,
    piAccessToken,
    error,
    reinitialize,
    getAccessToken,
  };
};