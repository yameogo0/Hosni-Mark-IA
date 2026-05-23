# Hosni IA - Notes d'Implémentation Technique

## Vue d'ensemble
Cette application est configurée avec l'interface utilisateur complète pour Hosni IA, incluant la gestion des abonnements, le comptage des questions, et l'upload d'images pour les abonnés premium.

## Points Techniques à Finaliser

### 1. Intégration Backend pour les Abonnements

Le hook `useSubscriptionStatus` (`/hooks/use-subscription-status.ts`) contient actuellement des données simulées. Vous devez :

**A. Créer un endpoint backend :**
```
GET /v1/subscription/status
Headers: Authorization: {piAccessToken}

Response:
{
  "tier": "free" | "weekly" | "monthly",
  "questionsUsedToday": number,
  "questionsLimit": number,
  "hasImageAccess": boolean
}
```

**B. Implémenter la logique backend :**
- Stocker les abonnements utilisateurs dans votre base de données
- Tracker le nombre de questions par jour pour les utilisateurs gratuits
- Réinitialiser le compteur quotidien à minuit (UTC ou timezone de l'utilisateur)
- Valider le statut d'abonnement à chaque requête

**C. Décommenter et ajuster dans `useSubscriptionStatus` :**
```typescript
const response = await fetch(`${BACKEND_CONFIG.BASE_URL}/v1/subscription/status`, {
  headers: {
    Authorization: piAccessToken,
  },
});
const data = await response.json();
```

### 2. Gestion des Paiements Pi Network

**A. Produits à créer dans Pi Network Developer Portal :**

1. **Abonnement Hebdomadaire**
   - Prix: 5 Pi
   - Type: Recurring (Weekly)
   - Features: Questions illimitées + Analyse d'images

2. **Abonnement Mensuel "Pro"**
   - Prix: 15 Pi
   - Type: Recurring (Monthly)
   - Features: Tout + Analyses approfondies + Support prioritaire

**B. Workflow de paiement :**
```typescript
// 1. Initier le paiement (Frontend)
const payment = await Pi.createPayment({
  amount: 5, // ou 15 pour mensuel
  memo: "Hosni IA - Weekly Subscription",
  metadata: { 
    subscriptionType: "weekly",
    userId: user.id 
  },
}, {
  onReadyForServerApproval: (paymentId) => {
    // 2. Approuver côté serveur
    approvePayment(paymentId);
  },
  onReadyForServerCompletion: (paymentId, txid) => {
    // 3. Compléter et activer l'abonnement
    completePayment(paymentId, txid);
  },
  onCancel: (paymentId) => {
    // Gérer l'annulation
  },
  onError: (error, payment) => {
    // Gérer l'erreur
  },
});

// Backend: Endpoints déjà configurés dans BACKEND_URLS
// - APPROVE_PAYMENT(paymentId)
// - COMPLETE_PAYMENT(paymentId)
```

**C. Backend: Activer l'abonnement après paiement :**
```typescript
// Dans votre endpoint de completion
async function completePayment(paymentId: string, txid: string) {
  // 1. Vérifier la transaction sur la blockchain Pi
  const txDetails = await verifyTransaction(txid);
  
  // 2. Activer l'abonnement dans la DB
  await db.subscriptions.create({
    userId: user.id,
    tier: metadata.subscriptionType,
    startDate: new Date(),
    endDate: calculateEndDate(metadata.subscriptionType),
    paymentId: paymentId,
    transactionId: txid,
    status: 'active'
  });
  
  // 3. Réinitialiser le compteur de questions
  await db.users.update({
    questionsUsedToday: 0
  });
}
```

### 3. Fonction d'Analyse d'Images (API Vision IA)

Le chatbot hook (`/hooks/use-chatbot.ts`) envoie déjà l'image en base64. Vous devez :

**A. Backend: Créer un endpoint spécialisé ou modifier `/v1/chat/default` :**

```typescript
// Dans votre endpoint de chat
if (request.body.hasImage && user.hasImageAccess) {
  // Extraire l'image base64
  const imageBase64 = request.body.image;
  
  // Option 1: OpenAI GPT-4 Vision
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: request.body.message || "Analysez cette image du point de vue marketing." 
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64, // ou URL publique
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
  });
  
  // Option 2: Claude (Anthropic)
  const response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64.split(',')[1], // Enlever le préfixe data:image/...
            },
          },
          {
            type: "text",
            text: request.body.message || "Analysez cette image marketing."
          }
        ],
      }
    ],
  });
  
  // Option 3: Google Gemini Vision
  const response = await gemini.generateContent({
    contents: [{
      parts: [
        { text: request.body.message },
        { 
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.split(',')[1]
          }
        }
      ]
    }]
  });
}
```

**B. Prompt System pour l'analyse marketing :**
```typescript
const MARKETING_VISION_PROMPT = `
Tu es Hosni IA, expert en marketing et commerce. Analyse cette image et fournis:

1. **Identité visuelle**: Couleurs, typographie, style graphique
2. **Message marketing**: Quel est le message principal?
3. **Public cible**: À qui s'adresse cette création?
4. **Points forts**: Ce qui fonctionne bien
5. **Recommandations**: Améliorations possibles
6. **Tendances**: Positionnement par rapport aux tendances actuelles

Sois précis, constructif et axé sur l'action.
`;
```

### 4. Comptage des Questions

**Backend: Middleware pour tracker les questions :**
```typescript
async function trackQuestion(userId: string, tier: string) {
  if (tier === 'free') {
    const today = startOfDay(new Date());
    
    // Incrémenter le compteur
    const user = await db.users.findUnique({ where: { id: userId } });
    
    if (user.lastQuestionDate < today) {
      // Nouveau jour, réinitialiser
      await db.users.update({
        where: { id: userId },
        data: {
          questionsUsedToday: 1,
          lastQuestionDate: today
        }
      });
    } else if (user.questionsUsedToday >= 10) {
      // Limite atteinte
      throw new Error('daily_limit_exceeded');
    } else {
      // Incrémenter
      await db.users.update({
        where: { id: userId },
        data: {
          questionsUsedToday: { increment: 1 }
        }
      });
    }
  }
  // Les tiers premium (weekly/monthly) n'ont pas de limite
}
```

### 5. Variables d'Environnement Requises

Ajoutez à votre backend `.env`:

```env
# Pi Network
PI_API_KEY=your_pi_api_key
PI_WALLET_PRIVATE_SEED=your_wallet_seed

# AI Vision API (choisissez selon votre provider)
OPENAI_API_KEY=sk-...
# OU
ANTHROPIC_API_KEY=sk-ant-...
# OU
GOOGLE_AI_API_KEY=...

# Database
DATABASE_URL=postgresql://...

# Pricing
WEEKLY_SUBSCRIPTION_PRICE=5
MONTHLY_SUBSCRIPTION_PRICE=15
FREE_DAILY_LIMIT=10
```

### 6. Schéma Base de Données Suggéré

```sql
-- Table des utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY,
  pi_username VARCHAR(255) UNIQUE NOT NULL,
  questions_used_today INT DEFAULT 0,
  last_question_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des abonnements
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tier VARCHAR(50) NOT NULL, -- 'weekly' or 'monthly'
  status VARCHAR(50) NOT NULL, -- 'active', 'cancelled', 'expired'
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  payment_id VARCHAR(255),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_users_last_question ON users(last_question_date);
```

### 7. Tests à Effectuer

- [ ] Test du compteur de questions pour utilisateurs gratuits (10/jour)
- [ ] Test de réinitialisation du compteur à minuit
- [ ] Test du workflow de paiement Pi Network (hebdo et mensuel)
- [ ] Test de l'upload et analyse d'image pour abonnés premium
- [ ] Test de la restriction d'accès image pour utilisateurs gratuits
- [ ] Test d'expiration d'abonnement
- [ ] Test de renouvellement automatique (si implémenté)

### 8. Sécurité

**Important:**
- Valider TOUS les tokens Pi côté serveur
- Ne jamais faire confiance au statut d'abonnement côté client
- Vérifier les transactions sur la blockchain Pi
- Sanitizer les images uploadées (taille, format, contenu)
- Rate limiting sur l'API de vision IA (coûteuse)
- Logs des transactions pour audit

## Structure des Fichiers Créés

```
/hooks/
  use-subscription-status.ts    # Hook pour gérer le statut d'abonnement
  use-chatbot.ts               # Hook chatbot (modifié pour images)

/components/
  subscription-banner.tsx      # Affichage des offres d'abonnement
  subscription-status.tsx      # Indicateur du statut actuel
  image-upload.tsx            # Composant d'upload d'image
  welcome-message.tsx         # Message d'accueil (modifié)

/app/
  page.tsx                    # Page principale (intégrations)
```

## Notes Importantes

1. **Le code Pi Network existant N'A PAS été modifié** (authentification, SDK, endpoints)
2. Les nouveaux composants sont prêts à être connectés au backend
3. L'UI est complètement fonctionnelle et responsive
4. Les données d'abonnement sont simulées - remplacer par des appels API réels
5. L'analyse d'image nécessite une clé API de service de vision IA

## Prochaines Étapes

1. Implémenter les endpoints backend listés ci-dessus
2. Configurer les produits dans Pi Developer Portal
3. Obtenir les clés API pour le service de vision IA choisi
4. Tester le workflow complet en sandbox Pi
5. Déployer en production avec monitoring des transactions
