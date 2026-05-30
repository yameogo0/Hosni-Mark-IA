'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Traductions simplifiées
const translations = {
  fr: {
    expertTitle: "Expert en Marketing, Commerce & Stratégies de Croissance",
    askQuestion: "Posez votre question marketing...",
    poweredBy: "Propulsé par Pi Network",
    securePayments: "Paiements sécurisés",
    wallet: "Portefeuille",
    diagnostic: "Diagnostic",
    subscriptionRequired: "Wallet requis",
    connectWalletFirst: "Veuillez d'abord connecter votre wallet Pi",
    subscriptionActivated: "🎉 Abonnement activé!",
    premiumAccess: "Accès premium activé",
    dailyLimitReached: "Limite quotidienne atteinte",
    questionsPerDay: "questions/jour",
    upgrade: "Passer au premium",
    connecting: "Connexion en cours...",
    retry: "Réessayer",
    imageReady: "Image prête",
    describeImage: "Décrivez l'image"
  },
  en: {
    expertTitle: "Expert in Marketing, Commerce & Growth Strategies",
    askQuestion: "Ask your marketing question...",
    poweredBy: "Powered by Pi Network",
    securePayments: "Secure payments",
    wallet: "Wallet",
    diagnostic: "Diagnostic",
    subscriptionRequired: "Wallet required",
    connectWalletFirst: "Please connect your Pi wallet first",
    subscriptionActivated: "🎉 Subscription activated!",
    premiumAccess: "Premium access activated",
    dailyLimitReached: "Daily limit reached",
    questionsPerDay: "questions/day",
    upgrade: "Upgrade to premium",
    connecting: "Connecting...",
    retry: "Retry",
    imageReady: "Image ready",
    describeImage: "Describe the image"
  },
  pt: {
    expertTitle: "Especialista em Marketing, Comércio & Estratégias",
    askQuestion: "Faça sua pergunta de marketing...",
    poweredBy: "Desenvolvido por Pi Network",
    securePayments: "Pagamentos seguros",
    wallet: "Carteira",
    diagnostic: "Diagnóstico",
    subscriptionRequired: "Carteira necessária",
    connectWalletFirst: "Conecte sua carteira Pi primeiro",
    subscriptionActivated: "🎉 Assinatura ativada!",
    premiumAccess: "Acesso premium ativado",
    dailyLimitReached: "Limite diário atingido",
    questionsPerDay: "perguntas/dia",
    upgrade: "Assinar premium",
    connecting: "Conectando...",
    retry: "Tentar novamente",
    imageReady: "Imagem pronta",
    describeImage: "Descreva a imagem"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('hosni_ia_language') as Language;
    if (saved && ['fr', 'en', 'pt'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations.fr];
    return translation || key;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'fr' as Language,
      setLanguage: () => {},
      t: (key: string) => key
    };
  }
  return context;
}