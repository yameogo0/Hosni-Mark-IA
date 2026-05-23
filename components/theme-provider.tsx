'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { useEffect, useState } from 'react'

interface ExtendedThemeProviderProps extends ThemeProviderProps {
  enableSystem?: boolean
  defaultTheme?: string
  storageKey?: string
}

export function ThemeProvider({ 
  children, 
  enableSystem = true,
  defaultTheme = 'system',
  storageKey = 'hosni-ia-theme',
  ...props 
}: ExtendedThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  // Appliquer la classe CSS pour le thème
  useEffect(() => {
    if (!mounted) return

    const handleThemeChange = () => {
      const theme = localStorage.getItem(storageKey) || defaultTheme
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    handleThemeChange()

    // Écouter les changements de thème système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      const theme = localStorage.getItem(storageKey) || defaultTheme
      if (theme === 'system') {
        handleThemeChange()
      }
    }
    
    mediaQuery.addEventListener('change', handleSystemChange)
    return () => mediaQuery.removeEventListener('change', handleSystemChange)
  }, [mounted, storageKey, defaultTheme])

  // Ne rien rendre côté serveur pour éviter l'hydratation
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <NextThemesProvider 
      {...props}
      enableSystem={enableSystem}
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      attribute="class"
    >
      {children}
    </NextThemesProvider>
  )
}

// Hook personnalisé pour utiliser le thème facilement
export function useTheme() {
  const [theme, setTheme] = useState<string>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('hosni-ia-theme')
    if (saved) setTheme(saved)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('hosni-ia-theme', newTheme)
    window.location.reload()
  }

  const setThemeValue = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('hosni-ia-theme', newTheme)
    window.location.reload()
  }

  if (!mounted) return { theme: 'system', toggleTheme: () => {}, setTheme: () => {} }

  return { theme, toggleTheme, setTheme: setThemeValue }
}

// Composant Selecteur de thème (optionnel)
export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'light' 
            ? 'bg-primary text-white shadow-md' 
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Thème clair"
      >
        ☀️
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'dark' 
            ? 'bg-primary text-white shadow-md' 
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Thème sombre"
      >
        🌙
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'system' 
            ? 'bg-primary text-white shadow-md' 
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Thème système"
      >
        💻
      </button>
    </div>
  )
}
