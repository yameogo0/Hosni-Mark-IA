import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine les classes Tailwind CSS avec gestion des conflits
 * @param inputs - Classes CSS à combiner
 * @returns Chaîne de classes optimisée
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============ Formatage ============

/**
 * Formate une date en chaîne localisée
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = 'fr-FR'
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Date invalide';
  
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Formate une heure
 */
export function formatTime(
  date: Date | string | number,
  locale: string = 'fr-FR'
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Formate une durée en chaîne lisible
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min ${seconds % 60}s`;
  
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}min`;
}

/**
 * Formate un nombre avec séparateurs
 */
export function formatNumber(
  num: number,
  locale: string = 'fr-FR',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Formate un prix en Pi
 */
export function formatPrice(amount: number, showSymbol: boolean = true): string {
  const formatted = amount.toFixed(2).replace('.', ',');
  return showSymbol ? `${formatted} π` : formatted;
}

// ============ Validation ============

/**
 * Vérifie si une chaîne est une URL valide
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Vérifie si une chaîne est un email valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Vérifie si une chaîne est un hash de transaction Pi valide
 */
export function isValidTxid(txid: string): boolean {
  return /^[A-Fa-f0-9]{64}$/.test(txid);
}

/**
 * Vérifie si une chaîne est une adresse wallet Pi valide
 */
export function isValidPiAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address);
}

// ============ Manipulation de chaînes ============

/**
 * Tronque une chaîne à une longueur maximale
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalise la première lettre d'une phrase
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Met en majuscule la première lettre de chaque mot
 */
export function titleCase(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ============ Stockage local ============

/**
 * Sauvegarde une valeur dans localStorage avec gestion des erreurs
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.error(`Erreur lors de l'écriture dans localStorage: ${key}`);
    return false;
  }
}

/**
 * Récupère une valeur depuis localStorage
 */
export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue ?? null;
    return JSON.parse(item) as T;
  } catch {
    console.error(`Erreur lors de la lecture dans localStorage: ${key}`);
    return defaultValue ?? null;
  }
}

/**
 * Supprime une valeur de localStorage
 */
export function removeLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    console.error(`Erreur lors de la suppression dans localStorage: ${key}`);
    return false;
  }
}

// ============ Debounce / Throttle ============

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle une fonction
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

// ============ Gestion des erreurs ============

/**
 * Formatte une erreur pour affichage utilisateur
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Une erreur inattendue est survenue';
}

/**
 * Capture et loggue une erreur
 */
export function logError(error: unknown, context?: string): void {
  const message = formatErrorMessage(error);
  console.error(`[ERROR]${context ? ` ${context}` : ''}:`, message);
}

// ============ Utilitaires divers ============

/**
 * Génère un ID unique
 */
export function generateId(prefix?: string): string {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Attend un certain temps
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Copie du texte dans le presse-papier
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Détection du navigateur Pi Browser
 */
export function isPiBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  return /Pi Browser/i.test(navigator.userAgent);
}

/**
 * Détection du mode développement
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Détection du mode production
 */
export function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}