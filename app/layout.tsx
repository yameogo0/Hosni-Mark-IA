import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_CONFIG } from "@/lib/app-config";
import { PiScriptLoader } from "@/components/PiScriptLoader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const appName = APP_CONFIG.NAME || "Hosni IA";
const appDescription = "Hosni IA - Votre expert en marketing et commerce 24/7. Assistant IA dédié aux stratégies marketing, gestion commerciale et croissance d'entreprise.";

export const metadata: Metadata = {
  title: `${appName} - Expert Marketing & Commerce IA`,
  description: appDescription,
  generator: 'v0.app'
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <PiScriptLoader />
        {children}
      </body>
    </html>
  );
}
