'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Check, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Language } from '@/hooks/use-chatbot';

interface LanguageSelectorProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  className?: string;
  showLabel?: boolean;
}

const languages = [
  { code: 'fr' as Language, label: 'Français', flag: '🇫🇷', nativeLabel: 'Français' },
  { code: 'en' as Language, label: 'English', flag: '🇬🇧', nativeLabel: 'English' },
  { code: 'pt' as Language, label: 'Português', flag: '🇵🇹', nativeLabel: 'Português' }
];

// Messages d'aide multilingues
const messages = {
  fr: { selectLanguage: "Changer de langue", close: "Fermer" },
  en: { selectLanguage: "Change language", close: "Close" },
  pt: { selectLanguage: "Mudar idioma", close: "Fechar" }
};

export function LanguageSelector({ currentLang, onLanguageChange, className, showLabel = true }: LanguageSelectorProps) {
  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className={`gap-2 ${className || ''}`}>
        <Globe className="w-4 h-4" />
        <span>🇫🇷 FR</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-2 transition-all hover:shadow-md ${className || ''}`}>
          <Globe className="w-4 h-4" />
          {showLabel && (
            <span className="hidden sm:inline">
              {currentLanguage.flag} {currentLanguage.label}
            </span>
          )}
          <span className="sm:hidden">
            {currentLanguage.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          <Languages className="w-3 h-3 inline mr-1" />
          {messages[currentLang].selectLanguage}
        </div>
        <DropdownMenuSeparator />
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              onLanguageChange(lang.code);
              setOpen(false);
            }}
            className={`gap-3 cursor-pointer transition-all ${
              currentLang === lang.code ? 'bg-primary/10 text-primary font-medium' : ''
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="flex-1">{lang.nativeLabel}</span>
            {currentLang === lang.code && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Version compacte pour mobile (sans dropdown)
export function CompactLanguageSelector({ currentLang, onLanguageChange }: LanguageSelectorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-1">
        <div className="px-2 py-1 text-xs rounded-md bg-gray-100">🇫🇷</div>
      </div>
    );
  }

  return (
    <div className="flex gap-1 bg-muted/30 rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
            currentLang === lang.code
              ? 'bg-primary text-white shadow-md scale-105'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          title={lang.label}
        >
          <span className="mr-1.5 text-base">{lang.flag}</span>
          <span className="hidden sm:inline">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}

// Version texte simple (pour footer)
export function SimpleLanguageSelector({ currentLang, onLanguageChange }: LanguageSelectorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>🇫🇷</span>;
  }

  return (
    <div className="flex gap-2 text-xs">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`transition-colors hover:text-primary ${
            currentLang === lang.code ? 'text-primary font-semibold' : 'text-muted-foreground'
          }`}
        >
          {lang.flag} {lang.label}
        </button>
      ))}
    </div>
  );
}

// Hook pour persister la langue
export function useLanguagePersistence() {
  const [language, setLanguage] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('hosni_ia_language') as Language;
    if (saved && ['fr', 'en', 'pt'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('hosni_ia_language', lang);
    // Optionnel: recharger la page pour appliquer la langue
    // window.location.reload();
  };

  return { language, changeLanguage, mounted };
}