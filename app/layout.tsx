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
  description: "Hosni IA - Votre expert en marketing et commerce 24/7",
  generator: 'v0.app',
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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