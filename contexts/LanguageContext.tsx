'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Traductions complètes
const translations = {
  fr: {
    // Général
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
    retry: "Réessayer",
    connecting: "Connexion en cours...",
    
    // ChatBot
    expertTitle: "Expert en Marketing, Commerce & Stratégies de Croissance",
    askQuestion: "Posez votre question marketing...",
    describeImage: "Décrivez ce que vous voulez analyser...",
    imageReady: "Image prête à analyser",
    poweredBy: "Propulsé par Pi Network",
    securePayments: "Paiements sécurisés",
    
    // Abonnement
    subscriptionRequired: "Wallet requis",
    connectWalletFirst: "Veuillez d'abord connecter votre wallet Pi dans les paramètres.",
    subscriptionActivated: "🎉 Abonnement activé!",
    premiumAccess: "Vous avez maintenant accès à toutes les fonctionnalités premium.",
    dailyLimitReached: "Limite quotidienne atteinte",
    questionsPerDay: "questions/jour",
    upgrade: "Passer au premium",
    basic: "Gratuit",
    pro: "Pro",
    premium: "Premium",
    days: "jours",
    month: "mois",
    subscribe: "S'abonner",
    popular: "Populaire",
    
    // Plans
    weeklyPlan: "Hebdomadaire",
    monthlyPlan: "Mensuel",
    unlimitedQuestions: "Questions illimitées",
    imageAnalysis: "Recherche par image",
    prioritySupport: "Support prioritaire",
    advancedReports: "Rapports avancés",
    apiAccess: "API accessible",
    
    // Wallet
    balance: "Solde disponible",
    address: "Adresse du Wallet",
    userId: "ID Utilisateur",
    status: "État",
    connected: "Connecté",
    disconnect: "Déconnecter",
    connect: "Connecter",
    refresh: "Actualiser",
    copyAddress: "Copier l'adresse",
    copied: "Copié !",
    
    // Pages
    home: "Accueil",
    chat: "Chat",
    account: "Compte",
    version: "Version",
    
    // Messages d'erreur
    apiKeyMissing: "❌ Clé API manquante",
    serviceUnavailable: "❌ Service indisponible",
    networkError: "❌ Erreur de connexion"
  },
  en: {
    // General
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
    retry: "Retry",
    connecting: "Connecting...",
    
    // ChatBot
    expertTitle: "Expert in Marketing, Commerce & Growth Strategies",
    askQuestion: "Ask your marketing question...",
    describeImage: "Describe what you want to analyze...",
    imageReady: "Image ready to analyze",
    poweredBy: "Powered by Pi Network",
    securePayments: "Secure payments",
    
    // Subscription
    subscriptionRequired: "Wallet required",
    connectWalletFirst: "Please connect your Pi wallet in settings first.",
    subscriptionActivated: "🎉 Subscription activated!",
    premiumAccess: "You now have access to all premium features.",
    dailyLimitReached: "Daily limit reached",
    questionsPerDay: "questions/day",
    upgrade: "Upgrade to premium",
    basic: "Free",
    pro: "Pro",
    premium: "Premium",
    days: "days",
    month: "month",
    subscribe: "Subscribe",
    popular: "Popular",
    
    // Plans
    weeklyPlan: "Weekly",
    monthlyPlan: "Monthly",
    unlimitedQuestions: "Unlimited questions",
    imageAnalysis: "Image search",
    prioritySupport: "Priority support",
    advancedReports: "Advanced reports",
    apiAccess: "API access",
    
    // Wallet
    balance: "Available balance",
    address: "Wallet Address",
    userId: "User ID",
    status: "Status",
    connected: "Connected",
    disconnect: "Disconnect",
    connect: "Connect",
    refresh: "Refresh",
    copyAddress: "Copy address",
    copied: "Copied!",
    
    // Pages
    home: "Home",
    chat: "Chat",
    account: "Account",
    version: "Version",
    
    // Error messages
    apiKeyMissing: "❌ API key missing",
    serviceUnavailable: "❌ Service unavailable",
    networkError: "❌ Connection error"
  },
  pt: {
    // Geral
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
    retry: "Tentar novamente",
    connecting: "Conectando...",
    
    // ChatBot
    expertTitle: "Especialista em Marketing, Comércio & Estratégias de Crescimento",
    askQuestion: "Faça sua pergunta de marketing...",
    describeImage: "Descreva o que você quer analisar...",
    imageReady: "Imagem pronta para análise",
    poweredBy: "Desenvolvido por Pi Network",
    securePayments: "Pagamentos seguros",
    
    // Assinatura
    subscriptionRequired: "Carteira necessária",
    connectWalletFirst: "Conecte sua carteira Pi nas configurações primeiro.",
    subscriptionActivated: "🎉 Assinatura ativada!",
    premiumAccess: "Agora você tem acesso a todos os recursos premium.",
    dailyLimitReached: "Limite diário atingido",
    questionsPerDay: "perguntas/dia",
    upgrade: "Assinar premium",
    basic: "Grátis",
    pro: "Pro",
    premium: "Premium",
    days: "dias",
    month: "mês",
    subscribe: "Assinar",
    popular: "Popular",
    
    // Planos
    weeklyPlan: "Semanal",
    monthlyPlan: "Mensal",
    unlimitedQuestions: "Perguntas ilimitadas",
    imageAnalysis: "Pesquisa por imagem",
    prioritySupport: "Suporte prioritário",
    advancedReports: "Relatórios avançados",
    apiAccess: "Acesso à API",
    
    // Carteira
    balance: "Saldo disponível",
    address: "Endereço da Carteira",
    userId: "ID do Usuário",
    status: "Estado",
    connected: "Conectado",
    disconnect: "Desconectar",
    connect: "Conectar",
    refresh: "Atualizar",
    copyAddress: "Copiar endereço",
    copied: "Copiado!",
    
    // Páginas
    home: "Início",
    chat: "Chat",
    account: "Conta",
    version: "Versão",
    
    // Mensagens de erro
    apiKeyMissing: "❌ Chave de API ausente",
    serviceUnavailable: "❌ Serviço indisponível",
    networkError: "❌ Erro de conexão"
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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}