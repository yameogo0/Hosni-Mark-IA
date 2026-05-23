import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_CONFIG } from "@/lib/app-config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const appName = APP_CONFIG.NAME;
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
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} - Expert Marketing & Commerce IA`,
    description: appDescription,
  },
    generator: 'v0.app'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
