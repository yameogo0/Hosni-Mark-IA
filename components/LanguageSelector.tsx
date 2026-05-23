'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Language } from '@/hooks/use-chatbot';

interface LanguageSelectorProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  className?: string;
}

const languages = [
  { code: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
  { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
  { code: 'pt' as Language, label: 'Português', flag: '🇵🇹' }
];

export function LanguageSelector({ currentLang, onLanguageChange, className }: LanguageSelectorProps) {
  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-2 ${className || ''}`}>
          <Globe className="w-4 h-4" />
          <span>{currentLanguage.flag} {currentLanguage.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`gap-2 cursor-pointer ${currentLang === lang.code ? 'bg-primary/10 text-primary' : ''}`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.label}</span>
            {currentLang === lang.code && (
              <span className="ml-auto text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Version compacte pour mobile
export function CompactLanguageSelector({ currentLang, onLanguageChange }: LanguageSelectorProps) {
  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`px-2 py-1 text-xs rounded-md transition-all ${
            currentLang === lang.code
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  );
}