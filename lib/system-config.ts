// lib/system-config.ts - MODE SANDBOX
export const PI_NETWORK_CONFIG = {
  SDK_URL: "https://sdk.minepi.com/pi-sdk.js",
  SDK_VERSION: "2.0",
  SANDBOX: true,  // ← Changer false à true
  APP_ID: process.env.NEXT_PUBLIC_PI_APP_ID || "",
  API_KEY: process.env.PI_API_KEY || "",
} as const;