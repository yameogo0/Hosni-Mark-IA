'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Traductions
const translations = {
  fr: {
    welcome: "Bienvenue",
    settings: "Paramètres",
    wallet: "Portefeuille",
    subscription: "Abonnement",
    diagnostic: "Diagnostic",
    back: "Retour",
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Confirmer",
    loading: "Chargement...",
    error: "Une erreur est survenue",
    success: "Succès",
    yes: "Oui",
    no: "Non",
    close: "Fermer",
  },
  en: {
    welcome: "Welcome",
    settings: "Settings",
    wallet: "Wallet",
    subscription: "Subscription",
    diagnostic: "Diagnostic",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    loading: "Loading...",
    error: "An error occurred",
    success: "Success",
    yes: "Yes",
    no: "No",
    close: "Close",
  },
  pt: {
    welcome: "Bem-vindo",
    settings: "Configurações",
    wallet: "Carteira",
    subscription: "Assinatura",
    diagnostic: "Diagnóstico",
    back: "Voltar",
    save: "Salvar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    loading: "Carregando...",
    error: "Ocorreu um erro",
    success: "Sucesso",
    yes: "Sim",
    no: "Não",
    close: "Fechar",
  },
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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
