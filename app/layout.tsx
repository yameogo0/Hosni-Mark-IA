import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_CONFIG } from "@/lib/app-config";
import { PiScriptLoader } from "@/components/PiScriptLoader";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const appName = APP_CONFIG.NAME || "Hosni IA";
const appDescription = "Hosni IA - Votre expert en marketing et commerce 24/7. Assistant IA dédié aux stratégies marketing, gestion commerciale et croissance d'entreprise. Analyses personnalisées pour entrepreneurs et professionnels.";

export const metadata: Metadata = {
  title: `${appName} - Expert Marketing & Commerce IA`,
  description: appDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: `${appName} - Expert Marketing & Commerce IA`,
    description: appDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hosni IA - Expert Marketing & Commerce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} - Expert Marketing & Commerce IA`,
    description: appDescription,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  generator: 'v0.app'
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#7C3AED",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {/* Pi Network SDK Loader */}
        <PiScriptLoader />
        
        {/* Main content */}
        {children}
        
        {/* Pi SDK Script (fallback) */}
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window !== 'undefined' && window.Pi && !window.Pi._initialized) {
              window.Pi.init({
                version: '2.0',
                sandbox: process.env.NEXT_PUBLIC_PI_NETWORK_SANDBOX !== 'false'
              });
              window.Pi._initialized = true;
              console.log('✅ Pi SDK initialized in layout');
            }
          }}
        />
      </body>
    </html>
  );
}