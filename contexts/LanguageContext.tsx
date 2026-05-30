'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

type Language = 'fr' | 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isReady: boolean;
}

// Définition du type pour les traductions
type TranslationKey = 
  // Général
  | 'welcome' | 'settings' | 'wallet' | 'subscription' | 'diagnostic' | 'back' 
  | 'save' | 'cancel' | 'confirm' | 'loading' | 'error' | 'success' | 'yes' 
  | 'no' | 'close' | 'retry' | 'connecting'
  // ChatBot
  | 'expertTitle' | 'askQuestion' | 'describeImage' | 'imageReady' | 'poweredBy' | 'securePayments'
  // Abonnement
  | 'subscriptionRequired' | 'connectWalletFirst' | 'subscriptionActivated' | 'premiumAccess'
  | 'dailyLimitReached' | 'questionsPerDay' | 'upgrade' | 'basic' | 'pro' | 'premium'
  | 'days' | 'month' | 'subscribe' | 'popular'
  // Plans
  | 'weeklyPlan' | 'monthlyPlan' | 'unlimitedQuestions' | 'imageAnalysis' | 'prioritySupport'
  | 'advancedReports' | 'apiAccess' | 'emailSupport' | 'exportReports' | 'communityAccess'
  | 'allProFeatures' | 'prioritySupport247' | 'customApi' | 'personalizedAdvice' | 'noAds'
  | 'perfectForTest' | 'bestPlan' | 'for' | '7days' | '30days' | 'processing'
  | 'subscriptionPlans' | 'choosePlan' | 'subscriptionAlreadyActive' | 'paymentError' | 'unexpectedError'
  // Wallet
  | 'balance' | 'address' | 'userId' | 'status' | 'connected' | 'disconnect' | 'connect'
  | 'refresh' | 'copyAddress' | 'copied' | 'refreshSuccess' | 'newBalance' | 'authError'
  | 'notAvailable' | 'walletConnected' | 'piSDKRequired' | 'connectionError' | 'walletDisconnected'
  | 'addressCopied' | 'connectWalletDesc' | 'connectWallet' | 'usePiBrowser' | 'refreshBalance'
  | 'hideBalance' | 'showBalance' | 'availableBalance' | 'walletAddress' | 'productionMode'
  // Pages
  | 'home' | 'chat' | 'account' | 'version' | 'manageWalletSubscription' | 'accountSettings'
  | 'managePreferences'
  // Messages d'erreur
  | 'apiKeyMissing' | 'serviceUnavailable' | 'networkError'
  // Image Upload
  | 'invalidFormat' | 'fileTooLarge' | 'imageReadError' | 'imagePreviewAlt' | 'addImage' | 'formatsInfo'
  // Knowledge Manager
  | 'knowledgeBase' | 'titlePlaceholder' | 'contentPlaceholder' | 'addButton' | 'noItems'
  | 'categoryMarketing' | 'categorySales' | 'categoryStrategy' | 'categoryCRM'
  // Payment Modal
  | 'paymentSuccess' | 'subscriptionActivatedDesc' | 'redirecting' | 'confirmPayment'
  | 'confirmPaymentDesc' | 'plan' | 'price' | 'duration' | 'securePayment'
  | 'choosePremium' | 'unlockFeatures' | 'perWeek' | 'perMonth' | 'moreBenefits'
  | 'subscribeNow' | 'secureDecentralized' | 'immediateAccess' | 'noCommitment'
  // Subscription Banner
  | 'free' | 'always' | 'freeQuestions' | 'freeAccess' | 'week' | 'noDailyRestriction'
  | 'monthlyPro' | 'allWeeklyBenefits' | 'advancedAnalysis' | 'subscriptionActive'
  | 'unlockPower' | 'activeSubscription' | 'daysRemaining' | 'weeklyDescription'
  | 'monthlyDescription' | 'piPayment' | 'piPaymentDescription' | 'alreadyPremium'
  | 'enjoyFeatures' | 'backToChat'
  // Subscription Status
  | 'expired' | 'daysRemainingCount' | 'hoursRemaining' | 'lessThanHour' | 'remaining'
  | 'dailyLimit' | 'unlimited' | 'monthlyProPlan' | 'weeklyPremiumPlan'
  | 'questionsRemainingToday' | 'dailyLimitReachedText' | 'upgradeToPremium'
  | 'currentSession' | 'message' | 'messages'
  // Question Limit Display
  | 'questionsRemaining' | 'limitReachedUpgrade'
  // Subscription Modal
  | 'premiumSubscriptions' | 'chooseYourPlan'
  // Welcome Message
  | 'advancedAI' | 'heroDescription' | 'keyFeatures' | 'domains' | 'strategicAdvice'
  | 'brandStrategy' | 'marketResearch' | 'positioning' | 'digitalMarketing' | 'socialMedia'
  | 'seo' | 'onlineAds' | 'contentMarketing' | 'salesCRM' | 'salesTechniques'
  | 'customerLoyalty' | 'crmManagement' | 'analysis' | 'dataInterpretation' | 'kpi'
  | 'performanceMeasurement' | 'innovation' | 'trends' | 'ecommerce' | 'newTechnologies'
  | 'growth' | 'expansionStrategies' | 'community' | 'communityManagement' | 'targeting'
  | 'advancedSegmentation' | 'branding' | 'brandIdentity' | 'frequentQuestions'
  | 'startConsultation' | 'availableFor' | 'personalizedAdviceNote' | 'expertShort'
  | 'companiesAccompanied' | 'customerSatisfaction' | 'availability' | 'question1'
  | 'question2' | 'question3' | 'question4'
  // Diagnostic
  | 'diagnosticTitle' | 'copyReport' | 'restart' | 'checking' | 'checkingProgress'
  | 'statusOk' | 'statusError' | 'statusWarning' | 'statusChecking' | 'ok' | 'warnings'
  | 'errors' | 'errorsDetected' | 'recommendedActions' | 'commonSolutions' | 'solution1'
  | 'solution2' | 'solution3' | 'solution4' | 'openDevPortal' | 'configureWallet'
  | 'systemInfo' | 'sandbox' | 'production' | 'lastDiagnostic' | 'copiedDescription'
  | 'details' | 'sdkName' | 'sdkAvailable' | 'sdkUnavailable' | 'sandboxMode'
  | 'sandboxActive' | 'productionActive' | 'backendUrl' | 'backendConfigured'
  | 'backendMissing' | 'notDefined' | 'apiKey' | 'apiKeyConfigured' | 'apiKeyMissing'
  | 'apiKeyRequired' | 'backendAccess' | 'backendResponds' | 'backendInaccessible'
  | 'backendUnreachable' | 'unknownError' | 'piAuth' | 'authSuccess' | 'authFailed'
  | 'notAuthenticated' | 'authError' | 'authImpossible' | 'sdkUnavailableDetail'
  | 'latency' | 'latencyValue' | 'goodPerformance' | 'averagePerformance' | 'highLatency'
  | 'latencyImpossible' | 'backendInaccessibleDetail';

// Traductions complètes
const translations: Record<Language, Record<TranslationKey, string>> = {
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
    emailSupport: "Support par email",
    exportReports: "Export des rapports",
    communityAccess: "Accès à la communauté",
    allProFeatures: "Tout ce qui est dans Pro",
    prioritySupport247: "Support prioritaire 24/7",
    customApi: "API personnalisée",
    personalizedAdvice: "Conseils personnalisés",
    noAds: "Pas de publicités",
    perfectForTest: "Parfait pour tester",
    bestPlan: "Notre meilleur plan",
    for: "pour",
    "7days": "7 jours",
    "30days": "30 jours",
    processing: "Traitement",
    subscriptionPlans: "Plans d'abonnement",
    choosePlan: "Choisissez le plan qui vous convient le mieux",
    subscriptionAlreadyActive: "✅ Abonnement {plan} déjà activé !",
    paymentError: "❌ Erreur lors du paiement",
    unexpectedError: "❌ Erreur inattendue. Veuillez réessayer.",
    
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
    refreshSuccess: "Solde actualisé",
    newBalance: "Nouveau solde",
    authError: "Erreur d'authentification",
    notAvailable: "Non disponible",
    walletConnected: "Wallet connecté",
    piSDKRequired: "Pi SDK non disponible. Veuillez utiliser le Pi Browser.",
    connectionError: "Erreur de connexion",
    walletDisconnected: "Wallet déconnecté avec succès",
    addressCopied: "Adresse du wallet copiée",
    connectWalletDesc: "Connectez votre portefeuille Pi pour accéder aux paiements et aux abonnements premium.",
    connectWallet: "Connecter Wallet Pi",
    usePiBrowser: "Utilisez le Pi Browser pour vous connecter",
    refreshBalance: "Actualiser le solde",
    hideBalance: "Masquer le solde",
    showBalance: "Afficher le solde",
    availableBalance: "Solde disponible",
    walletAddress: "Adresse du Wallet",
    productionMode: "Mode Production - Transactions réelles",
    
    // ... (continuer avec toutes les autres traductions)
    home: "Accueil",
    chat: "Chat",
    account: "Compte",
    version: "Version",
    manageWalletSubscription: "Gérez votre wallet Pi et vos abonnements",
    accountSettings: "Paramètres du compte",
    managePreferences: "Gérez vos préférences",
    apiKeyMissing: "❌ Clé API manquante",
    serviceUnavailable: "❌ Service indisponible",
    networkError: "❌ Erreur de connexion",
    invalidFormat: "Format non supporté. Formats acceptés: {formats}",
    fileTooLarge: "Image trop volumineuse. Taille max: {size}MB",
    imageReadError: "Erreur lors de la lecture de l'image",
    imagePreviewAlt: "Aperçu de l'image sélectionnée",
    addImage: "Ajouter une image",
    formatsInfo: "Formats: {formats} • Max: {size}MB",
    knowledgeBase: "Base de connaissances",
    titlePlaceholder: "Titre",
    contentPlaceholder: "Contenu...",
    addButton: "Ajouter",
    noItems: "Aucun élément dans la base de connaissances",
    categoryMarketing: "Marketing",
    categorySales: "Vente",
    categoryStrategy: "Stratégie",
    categoryCRM: "CRM",
    paymentSuccess: "Paiement Réussi !",
    subscriptionActivatedDesc: "Votre abonnement a été activé avec succès.",
    redirecting: "Vous allez être redirigé dans quelques secondes...",
    confirmPayment: "Confirmation de paiement",
    confirmPaymentDesc: "Vérifiez les détails de votre abonnement avant de confirmer.",
    plan: "Plan",
    price: "Prix",
    duration: "Durée",
    securePayment: "Paiement sécurisé via Pi Network",
    choosePremium: "Choisissez Votre Abonnement Premium",
    unlockFeatures: "Débloquez toutes les fonctionnalités de Hosni IA avec un paiement sécurisé Pi Network",
    perWeek: "semaine",
    perMonth: "mois",
    moreBenefits: "autres avantages",
    subscribeNow: "Souscrire maintenant",
    secureDecentralized: "Paiement sécurisé et décentralisé",
    immediateAccess: "Accès immédiat",
    noCommitment: "Sans engagement",
    free: "Gratuit",
    always: "toujours",
    freeQuestions: "10 questions par jour",
    freeAccess: "Accès aux réponses générales",
    week: "semaine",
    noDailyRestriction: "Pas de restriction quotidienne",
    monthlyPro: "Mensuel Pro",
    allWeeklyBenefits: "Tous les avantages hebdomadaires",
    advancedAnalysis: "Analyses approfondies",
    subscriptionActive: "🎉 Votre abonnement {plan} est actif !",
    unlockPower: "Abonnez-vous et Débloquez la Puissance Totale",
    activeSubscription: "Abonnement actif",
    daysRemaining: "{days} jours restants",
    weeklyDescription: "Idéal pour tester ou résoudre un défi à court terme",
    monthlyDescription: "Pour une croissance continue – Économisez plus!",
    piPayment: "Paiement Pi Network",
    piPaymentDescription: "Finance décentralisée et sécurisée. Abonnez-vous en quelques clics avec votre portefeuille Pi, sans intermédiaire.",
    alreadyPremium: "Vous avez déjà accès à toutes les fonctionnalités premium !",
    enjoyFeatures: "Profitez pleinement de Hosni IA",
    backToChat: "Retour au chat",
    expired: "Expiré",
    daysRemainingCount: "{days} jours",
    hoursRemaining: "{hours} heures",
    lessThanHour: "Moins d'une heure",
    remaining: "restant(s)",
    dailyLimit: "Limite quotidienne",
    unlimited: "Illimité",
    monthlyProPlan: "Plan Pro (Mensuel)",
    weeklyPremiumPlan: "Plan Premium (Hebdo)",
    questionsRemainingToday: "Plus que {count} question(s) aujourd'hui",
    dailyLimitReachedText: "Limite quotidienne atteinte",
    upgradeToPremium: "Passer au premium",
    currentSession: "Session actuelle",
    message: "message",
    messages: "messages",
    questionsRemaining: "Questions restantes",
    limitReachedUpgrade: "Limite atteinte. Passez au premium pour continuer.",
    premiumSubscriptions: "Abonnements Premium",
    chooseYourPlan: "Choisissez votre formule",
    advancedAI: "IA avancée",
    heroDescription: "Transformez votre vision commerciale en succès concret avec des analyses, conseils personnalisés et solutions innovantes.",
    keyFeatures: "Fonctionnalités Clés",
    domains: "domaines",
    strategicAdvice: "Conseils Stratégiques",
    brandStrategy: "Stratégie de marque",
    marketResearch: "Études de marché",
    positioning: "Positionnement",
    digitalMarketing: "Marketing Numérique",
    socialMedia: "Social Media",
    seo: "SEO",
    onlineAds: "Publicités en ligne",
    contentMarketing: "Marketing de contenu",
    salesCRM: "Vente & CRM",
    salesTechniques: "Techniques de vente",
    customerLoyalty: "Fidélisation client",
    crmManagement: "Gestion relation client",
    analysis: "Analyse",
    dataInterpretation: "Interprétation de données",
    kpi: "KPI",
    performanceMeasurement: "Mesure de performance",
    innovation: "Innovation",
    trends: "Tendances",
    ecommerce: "E-commerce",
    newTechnologies: "Nouvelles technologies",
    growth: "Croissance",
    expansionStrategies: "Stratégies d'expansion",
    community: "Community",
    communityManagement: "Gestion de communauté",
    targeting: "Ciblage",
    advancedSegmentation: "Segmentation avancée",
    branding: "Branding",
    brandIdentity: "Identité de marque",
    frequentQuestions: "Questions fréquentes",
    startConsultation: "Commencer votre consultation",
    availableFor: "Disponible pour entrepreneurs, marketeurs et chefs d'entreprise",
    personalizedAdviceNote: "Tous les conseils sont personnalisés selon votre secteur d'activité",
    expertShort: "Votre expert en marketing et commerce 24/7",
    companiesAccompanied: "Entreprises accompagnées",
    customerSatisfaction: "Satisfaction client",
    availability: "Disponibilité",
    question1: "Comment lancer une campagne Facebook Ads efficace ?",
    question2: "Quelles sont les meilleures stratégies de fidélisation ?",
    question3: "Comment analyser mes KPIs marketing ?",
    question4: "Stratégies pour augmenter mes ventes en ligne",
    diagnosticTitle: "Diagnostic Pi Network",
    copyReport: "Copier rapport",
    restart: "Relancer",
    checking: "Vérification...",
    checkingProgress: "Vérification en cours...",
    statusOk: "OK",
    statusError: "ERREUR",
    statusWarning: "ATTENTION",
    statusChecking: "VÉRIFICATION",
    ok: "OK",
    warnings: "Alertes",
    errors: "Erreurs",
    errorsDetected: "Des erreurs ont été détectées. Consultez les recommandations ci-dessous.",
    recommendedActions: "Actions Recommandées",
    commonSolutions: "Solutions pour les erreurs courantes :",
    solution1: "Assurez-vous d'être dans le Pi Browser (pas Chrome/Safari)",
    solution2: "Vérifiez votre connexion internet",
    solution3: "Videz le cache du navigateur",
    solution4: "Reconnectez votre wallet Pi",
    openDevPortal: "Ouvrir Pi Developer Portal",
    configureWallet: "Configurer le Wallet",
    systemInfo: "Informations Système",
    sandbox: "Sandbox",
    production: "Production",
    lastDiagnostic: "Dernier diagnostic",
    copiedDescription: "Les informations ont été copiées dans le presse-papier",
    details: "Détails",
    sdkName: "SDK Pi Network",
    sdkAvailable: "SDK Pi est chargé et disponible",
    sdkUnavailable: "SDK Pi non disponible. Vérifiez que l'app s'exécute dans Pi Browser.",
    sandboxMode: "Mode Sandbox",
    sandboxActive: "Mode Sandbox activé (transactions simulées)",
    productionActive: "Mode Production activé (transactions réelles)",
    backendUrl: "Backend URL",
    backendConfigured: "Backend URL configurée",
    backendMissing: "Backend URL manquante",
    notDefined: "Non définie",
    apiKey: "Clé API",
    apiKeyConfigured: "Clé API configurée",
    apiKeyMissing: "Clé API manquante (GROQ_API_KEY)",
    apiKeyRequired: "Nécessaire pour le chat IA",
    backendAccess: "Backend Accessibilité",
    backendResponds: "Backend répond ({status})",
    backendInaccessible: "Backend inaccessible ({status})",
    backendUnreachable: "Impossible de contacter le backend",
    unknownError: "Erreur inconnue",
    piAuth: "Authentification Pi",
    authSuccess: "Authentification réussie",
    authFailed: "Échec de l'authentification",
    notAuthenticated: "Non authentifié",
    authError: "Erreur d'authentification",
    authImpossible: "Impossible de vérifier l'authentification",
    sdkUnavailableDetail: "SDK Pi non disponible",
    latency: "Latence",
    latencyValue: "Latence: {latency}ms",
    goodPerformance: "Bonnes performances",
    averagePerformance: "Performances moyennes",
    highLatency: "Latence élevée",
    latencyImpossible: "Impossible de mesurer la latence",
    backendInaccessibleDetail: "Backend inaccessible"
  },
  en: {
    // English translations would go here (same structure)
    welcome: "Welcome",
    settings: "Settings",
    // ... (all English translations)
    home: "Home",
    chat: "Chat",
    account: "Account",
    version: "Version",
    manageWalletSubscription: "Manage your Pi wallet and subscriptions",
    accountSettings: "Account Settings",
    managePreferences: "Manage your preferences",
    apiKeyMissing: "❌ API key missing",
    serviceUnavailable: "❌ Service unavailable",
    networkError: "❌ Connection error",
    // ... (would need all English translations)
  },
  pt: {
    // Portuguese translations would go here (same structure)
    welcome: "Bem-vindo",
    settings: "Configurações",
    // ... (all Portuguese translations)
    home: "Início",
    chat: "Chat",
    account: "Conta",
    version: "Versão",
    manageWalletSubscription: "Gerencie sua carteira Pi e assinaturas",
    accountSettings: "Configurações da Conta",
    managePreferences: "Gerencie suas preferências",
    apiKeyMissing: "❌ Chave API ausente",
    serviceUnavailable: "❌ Serviço indisponível",
    networkError: "❌ Erro de conexão",
    // ... (would need all Portuguese translations)
  }
};

// Helper function to interpolate variables in translation strings
const interpolate = (str: string, params?: Record<string, string | number>): string => {
  if (!params) return str;
  return str.replace(/{(\w+)}/g, (_, key) => String(params[key] ?? `{${key}}`));
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');
  const [isReady, setIsReady] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem('hosni_ia_language') as Language;
    if (saved && ['fr', 'en', 'pt'].includes(saved)) {
      setLanguage(saved);
    }
    setIsReady(true);
  }, []);

  // Save language when it changes
  useEffect(() => {
    if (isReady) {
      localStorage.setItem('hosni_ia_language', language);
    }
  }, [language, isReady]);

  // Translation function with interpolation support
  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    const translation = translations[language]?.[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    return interpolate(translation, params);
  }, [language]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    isReady
  }), [language, t]);

  // Don't render children until language is loaded to prevent hydration mismatch
  if (!isReady) {
    return null;
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Provide a fallback instead of throwing to prevent app crashes
    console.warn('useLanguage must be used within a LanguageProvider');
    return {
      language: 'fr',
      setLanguage: () => {},
      t: (key: string) => key,
      isReady: true
    };
  }
  return context;
}