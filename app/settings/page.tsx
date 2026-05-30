// app/settings/page.tsx
'use client';

import { PiWalletManager } from "@/components/PiWalletManager";
import { PiSubscriptionPlans } from "@/components/PiSubscriptionPlans";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Wallet, Crown, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'wallet' | 'subscription' | 'account'>('wallet');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header avec sélecteur de langue */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/")} className="shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <LanguageSelector currentLang={language} onLanguageChange={setLanguage} showLabel={true} />
        </div>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {t('settings')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('manageWalletSubscription')}</p>

        {/* Tabs traduits */}
        <div className="flex gap-2 border-b pb-2">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'wallet' ? 'bg-primary text-white shadow-md' : 'hover:bg-muted'
            }`}
          >
            <Wallet className="w-4 h-4" />
            {t('wallet')}
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'subscription' ? 'bg-primary text-white shadow-md' : 'hover:bg-muted'
            }`}
          >
            <Crown className="w-4 h-4" />
            {t('subscription')}
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'account' ? 'bg-primary text-white shadow-md' : 'hover:bg-muted'
            }`}
          >
            <Settings className="w-4 h-4" />
            {t('account')}
          </button>
        </div>

        {activeTab === 'wallet' && <PiWalletManager />}
        {activeTab === 'subscription' && <PiSubscriptionPlans />}
        {activeTab === 'account' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('accountSettings')}</CardTitle>
              <CardDescription>{t('managePreferences')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('version')} 1.0.0 • {t('poweredBy')} Pi Network
              </p>
              <Link href="/diagnostic" className="text-sm text-primary hover:underline">
                🔍 {t('diagnostic')}
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}