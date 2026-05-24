'use client'

import { Inter } from "next/font/google";
import { APP_CONFIG } from "@/lib/app-config";
import { useEffect, useState } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const appName = APP_CONFIG.NAME || "Hosni IA";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Évite l'erreur d'hydratation
  if (!mounted) {
    return null;
  }

  return (
    <html lang="fr">
      <head>
        <title>{`${appName} - Expert Marketing & Commerce IA`}</title>
        <meta name="description" content="Hosni IA - Votre expert en marketing et commerce 24/7" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7C3AED" />
        <meta name="generator" content="v0.app" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}