import { Inter } from "next/font/google";
import { APP_CONFIG } from "@/lib/app-config";
import { PiScriptLoader } from "@/components/PiScriptLoader";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const appName = APP_CONFIG.NAME || "Hosni IA";

export const metadata = {
  title: `${appName} - Expert Marketing & Commerce IA`,
  description: "Hosni IA - Votre expert en marketing et commerce 24/7. Assistant IA dédié aux stratégies marketing, gestion commerciale et croissance d'entreprise.",
  generator: 'v0.app',
  keywords: ["marketing", "commerce", "IA", "stratégie", "croissance", "Pi Network"],
  authors: [{ name: "Hosni IA" }],
  openGraph: {
    title: `${appName} - Expert Marketing & Commerce IA`,
    description: "Votre assistant IA pour le marketing et la croissance d'entreprise",
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US", "pt_PT"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} - Expert Marketing & Commerce IA`,
    description: "Votre assistant IA pour le marketing et la croissance d'entreprise",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: "#7C3AED",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <PiScriptLoader />
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}