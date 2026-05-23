// lib/i18n.ts
export type Language = 'fr' | 'en' | 'pt'

export const translations = {
  fr: {
    welcome: "Bienvenue sur Hosni IA",
    description: "Votre expert en marketing et commerce 24/7",
    send: "Envoyer",
    thinking: "Réflexion en cours...",
    error: "Une erreur est survenue",
    subscription: "Abonnement",
    premium: "Premium",
    free: "Gratuit",
    questionsRemaining: "questions restantes",
    upgrade: "Passer au premium",
    settings: "Paramètres",
    wallet: "Portefeuille",
    chat: "Chat",
    diagnostic: "Diagnostic"
  },
  en: {
    welcome: "Welcome to Hosni IA",
    description: "Your marketing and business expert 24/7",
    send: "Send",
    thinking: "Thinking...",
    error: "An error occurred",
    subscription: "Subscription",
    premium: "Premium",
    free: "Free",
    questionsRemaining: "questions remaining",
    upgrade: "Upgrade to premium",
    settings: "Settings",
    wallet: "Wallet",
    chat: "Chat",
    diagnostic: "Diagnostic"
  },
  pt: {
    welcome: "Bem-vindo ao Hosni IA",
    description: "Seu especialista em marketing e negócios 24/7",
    send: "Enviar",
    thinking: "Pensando...",
    error: "Ocorreu um erro",
    subscription: "Assinatura",
    premium: "Premium",
    free: "Grátis",
    questionsRemaining: "perguntas restantes",
    upgrade: "Assinar premium",
    settings: "Configurações",
    wallet: "Carteira",
    chat: "Chat",
    diagnostic: "Diagnóstico"
  }
}

export function getTranslation(lang: Language, key: keyof typeof translations.fr): string {
  return translations[lang][key] || translations.fr[key]
}