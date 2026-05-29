// *** Configurable variables for the app ***
// This file contains all the user-editable configuration values that can be updated when customizing the chatbot app.

export const APP_CONFIG = {
  // UPDATE: Set to the welcome message for the chatbot
  WELCOME_MESSAGE: "Bienvenue sur Hosni IA – Votre partenaire intelligent en marketing et gestion commerciale.",
  
  // UPDATE: Set to the name of the chatbot app
  NAME: "Hosni IA",
  
  // UPDATE: Set to the short name (for mobile header)
  SHORT_NAME: "Hosni",
  
  // UPDATE: Set to the description of the chatbot app
  DESCRIPTION: "Hosni IA est une application innovante conçue pour accompagner les professionnels, entrepreneurs et étudiants dans leurs stratégies de marketing et de gestion d'entreprise.",
  
  // UPDATE: App version
  VERSION: "1.0.0",
  
  // UPDATE: App URL (production)
  URL: process.env.NEXT_PUBLIC_APP_URL || "https://hosni-mark-ia.vercel.app",
  
  // UPDATE: Support email
  SUPPORT_EMAIL: "support@hosni-ia.com",
  
  // UPDATE: Contact email
  CONTACT_EMAIL: "contact@hosni-ia.com",
  
  // UPDATE: Social media links
  SOCIAL: {
    twitter: "https://twitter.com/hosni_ia",
    github: "https://github.com/hosni-ia",
    linkedin: "https://linkedin.com/company/hosni-ia"
  },
  
  // UPDATE: Features list (for welcome page)
  FEATURES: [
    "Conseils marketing personnalisés",
    "Analyses de marché en temps réel",
    "Stratégies de croissance d'entreprise",
    "Support multilingue (FR/EN/PT)"
  ],
  
  // UPDATE: Footer text
  FOOTER_TEXT: "© 2024 Hosni IA - Tous droits réservés",
} as const;

// Colors Configuration - UPDATE THESE VALUES BASED ON USER DESIGN PREFERENCES
export const COLORS = {
  // UPDATE: Set to the background color (hex format)
  BACKGROUND: "#f5f0ff",
  
  // UPDATE: Set to the primary color for buttons, links, etc. (hex format)
  PRIMARY: "#9a00f3",
  
  // UPDATE: Secondary color
  SECONDARY: "#6c47ff",
  
  // UPDATE: Accent color
  ACCENT: "#ff6b6b",
  
  // UPDATE: Success color
  SUCCESS: "#4caf50",
  
  // UPDATE: Warning color
  WARNING: "#ff9800",
  
  // UPDATE: Error color
  ERROR: "#f44336",
  
  // UPDATE: Text colors
  TEXT: {
    primary: "#1a1a2e",
    secondary: "#666666",
    muted: "#999999",
    inverse: "#ffffff",
  },
  
  // UPDATE: Gradient colors for headers
  GRADIENT: {
    from: "#9a00f3",
    to: "#6c47ff",
  },
} as const;

// Animation Configuration
export const ANIMATION_CONFIG = {
  MESSAGE_DURATION: 300,
  TYPING_DURATION: 1000,
  SCROLL_BEHAVIOR: "smooth" as const,
} as const;

// Limits Configuration
export const LIMITS_CONFIG = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_IMAGE_SIZE_MB: 5,
  FREE_TIER_QUESTIONS_LIMIT: 10,
  WEEKLY_TIER_QUESTIONS_LIMIT: Infinity,
  MONTHLY_TIER_QUESTIONS_LIMIT: Infinity,
} as const;

// Pi Network Configuration
export const PI_CONFIG = {
  SDK_URL: "https://sdk.minepi.com/pi-sdk.js",
  SDK_VERSION: "2.0",
  SANDBOX: process.env.NEXT_PUBLIC_PI_NETWORK_SANDBOX === 'true' || false,
  AUTH_SCOPES: ["username", "wallet_address", "payments"] as const,
  PLANS: {
    weekly: {
      name: "Hebdomadaire",
      price: 5,
      duration: 7,
      features: ["Questions illimitées", "Recherche par image", "Support par email"]
    },
    monthly: {
      name: "Mensuel Pro",
      price: 15,
      duration: 30,
      features: ["Tous les avantages", "Support prioritaire", "Analyses approfondies"]
    }
  },
} as const;

// Helper functions
export function getConfig() {
  return {
    app: { ...APP_CONFIG },
    colors: { ...COLORS },
    animation: { ...ANIMATION_CONFIG },
    limits: { ...LIMITS_CONFIG },
    pi: { ...PI_CONFIG },
  };
}

// Theme helper
export function getTheme() {
  return {
    background: COLORS.BACKGROUND,
    primary: COLORS.PRIMARY,
    secondary: COLORS.SECONDARY,
    gradient: `linear-gradient(135deg, ${COLORS.GRADIENT.from}, ${COLORS.GRADIENT.to})`,
  };
}

// Validation helper
export function isValidColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}