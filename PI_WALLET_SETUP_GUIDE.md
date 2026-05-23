# Guide de Configuration du Wallet Pi Network

## Problème: "The developer of this app has not set up the app wallet"

Cette erreur signifie que le **wallet de l'application** n'a pas été configuré sur le **Pi Developer Portal**. Le wallet est obligatoire pour accepter des paiements Pi.

---

## Solution: Configuration Étape par Étape

### Étape 1: Accéder au Pi Developer Portal

1. Rendez-vous sur: https://develop.pi
2. Connectez-vous avec votre compte Pi Network
3. Sélectionnez votre application **Hosni IA**

### Étape 2: Créer le Wallet de l'Application

1. Dans le menu de gauche, cliquez sur **"Wallets"** ou **"App Wallets"**
2. Cliquez sur **"Create New Wallet"** ou **"Setup App Wallet"**
3. Suivez les instructions pour créer le wallet

**Important:** Un seul wallet par application est autorisé.

### Étape 3: Configurer les Informations du Wallet

Vous devrez fournir:

- **Wallet Name**: `Hosni IA Wallet`
- **Description**: `Wallet pour les abonnements et paiements de l'application Hosni IA`
- **Type**: Production ou Sandbox (utilisez Sandbox pour les tests)
- **Currency**: Pi (π)

### Étape 4: Obtenir l'API Key

1. Une fois le wallet créé, récupérez votre **API Key** ou **App Secret**
2. Notez également votre **App ID** si vous ne l'avez pas déjà
3. **IMPORTANT**: Gardez ces informations secrètes et sécurisées

### Étape 5: Configurer le Backend

Le backend doit utiliser ces identifiants pour communiquer avec l'API Pi Network.

#### Configuration des Variables d'Environnement

Ajoutez ces variables dans votre backend:

```bash
PI_API_KEY=your_api_key_here
PI_APP_ID=your_app_id_here
PI_NETWORK_PASSPHRASE=Pi Testnet  # ou "Pi Network" pour production
```

#### Exemple de Configuration (Node.js)

```javascript
// config/pi-config.js
module.exports = {
  apiKey: process.env.PI_API_KEY,
  appId: process.env.PI_APP_ID,
  networkPassphrase: process.env.PI_NETWORK_PASSPHRASE,
  platformApiUrl: 'https://api.minepi.com/v2',
  blockchainApiUrl: 'https://api.testnet.minepi.com'
};
```

### Étape 6: Vérifier la Configuration

#### Test 1: Vérifier le Wallet via API

```bash
curl -X GET "https://api.minepi.com/v2/wallets/me" \
  -H "Authorization: Key YOUR_API_KEY"
```

**Réponse attendue:**
```json
{
  "wallet_id": "your_wallet_id",
  "balance": 0,
  "status": "active"
}
```

#### Test 2: Créer un Paiement Test

```bash
curl -X POST "https://api.minepi.com/v2/payments" \
  -H "Authorization: Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "payment": {
      "amount": 1,
      "memo": "Test payment",
      "metadata": {"test": true}
    }
  }'
```

### Étape 7: Activer le Mode Sandbox (pour les tests)

1. Dans le Pi Developer Portal, activez le **Sandbox Mode**
2. Cela vous permet de tester les paiements sans utiliser de vrais Pi
3. Les utilisateurs testeurs peuvent effectuer des paiements factices

Pour activer le mode Sandbox dans l'application, le fichier `lib/system-config.ts` contient:

```typescript
export const PI_NETWORK_CONFIG = {
  SDK_URL: "https://sdk.minepi.com/pi-sdk.js",
  SANDBOX: false,  // Changez en true pour les tests
} as const;
```

**Note**: Ce fichier est verrouillé. Pour le modifier, cliquez droit dessus dans l'arbre de fichiers et sélectionnez "Unlock".

---

## Checklist de Configuration Complète

- [ ] Wallet créé sur le Pi Developer Portal
- [ ] API Key obtenue et sécurisée
- [ ] App ID configuré
- [ ] Variables d'environnement définies dans le backend
- [ ] Test de connexion API réussi
- [ ] Mode Sandbox activé pour les tests
- [ ] Endpoints backend implémentés:
  - [ ] `/v1/payments/{paymentId}/approve`
  - [ ] `/v1/payments/{paymentId}/complete`
  - [ ] `/v1/wallet` (pour le wallet utilisateur)
  - [ ] `/v1/subscription/cancel`

---

## Architecture Backend pour les Paiements

### Flux de Paiement Pi Network

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Frontend   │────1───▶│   Pi SDK     │────2───▶│ Pi Network  │
│  (Hosni IA) │         │ window.Pi    │         │  Platform   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                                                   │
      │ 3. onReadyForServerApproval                     │
      ▼                                                   │
┌─────────────┐         ┌──────────────┐                │
│   Backend   │────4───▶│  Pi API      │◀───────────────┘
│  (Approve)  │         │ /approve     │
└─────────────┘         └──────────────┘
      │
      │ 5. onReadyForServerCompletion
      ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Backend   │────6───▶│  Pi API      │────7───▶│  Blockchain │
│ (Complete)  │         │ /complete    │         │ Verification│
└─────────────┘         └──────────────┘         └─────────────┘
```

### Implémentation des Endpoints Backend

#### 1. Approuver un Paiement

```javascript
// POST /v1/payments/:paymentId/approve
app.post('/v1/payments/:paymentId/approve', async (req, res) => {
  const { paymentId } = req.params;
  const { plan_id, amount } = req.body;
  const userToken = req.headers.authorization;
  
  try {
    // 1. Vérifier le paiement avec l'API Pi
    const paymentData = await axios.get(
      `https://api.minepi.com/v2/payments/${paymentId}`,
      {
        headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` }
      }
    );
    
    // 2. Valider les données
    if (paymentData.data.amount !== amount) {
      return res.status(400).json({ error: 'Amount mismatch' });
    }
    
    // 3. Obtenir l'utilisateur depuis le token
    const user = await verifyPiUser(userToken);
    
    // 4. Approuver le paiement
    const approval = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {},
      {
        headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` }
      }
    );
    
    res.json({
      success: true,
      payment_id: paymentId,
      status: 'approved'
    });
  } catch (error) {
    console.error('[Pi Payment] Approval error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Compléter un Paiement

```javascript
// POST /v1/payments/:paymentId/complete
app.post('/v1/payments/:paymentId/complete', async (req, res) => {
  const { paymentId } = req.params;
  const { txid, plan_id } = req.body;
  const userToken = req.headers.authorization;
  
  try {
    // 1. Vérifier la transaction sur la blockchain
    const txData = await axios.get(
      `https://api.testnet.minepi.com/transactions/${txid}/effects`,
      {
        headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` }
      }
    );
    
    // 2. Obtenir l'utilisateur
    const user = await verifyPiUser(userToken);
    
    // 3. Calculer la date d'expiration
    const expiresAt = plan_id === 'weekly'
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // 4. Créer l'abonnement dans la base de données
    const subscription = await db.subscriptions.create({
      user_id: user.id,
      plan: plan_id,
      payment_id: paymentId,
      txid: txid,
      expires_at: expiresAt,
      status: 'active'
    });
    
    // 5. Créer la transaction
    await db.transactions.create({
      user_id: user.id,
      type: 'subscription',
      amount: plan_id === 'weekly' ? 5 : 15,
      status: 'completed',
      plan: plan_id,
      payment_id: paymentId,
      description: `Abonnement ${plan_id === 'weekly' ? 'Hebdomadaire' : 'Mensuel Pro'}`
    });
    
    // 6. Marquer le paiement comme complété sur Pi
    await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      { txid },
      {
        headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` }
      }
    );
    
    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: 'active',
        expires_at: subscription.expires_at,
        features: {
          unlimited_questions: true,
          image_analysis: true,
          priority_support: plan_id === 'monthly_pro'
        }
      }
    });
  } catch (error) {
    console.error('[Pi Payment] Completion error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## Dépannage

### Erreur: "The developer of this app has not set up the app wallet"

**Cause**: Le wallet n'existe pas sur le Pi Developer Portal

**Solution**:
1. Créez le wallet sur https://develop.pi
2. Attendez quelques minutes pour la propagation
3. Vérifiez que l'App ID est correct dans votre configuration

### Erreur: "Invalid API Key"

**Cause**: L'API Key est incorrecte ou mal configurée

**Solution**:
1. Vérifiez votre API Key sur le Pi Developer Portal
2. Assurez-vous que la clé est dans les variables d'environnement
3. Redémarrez votre backend après modification

### Erreur: "Payment already approved/completed"

**Cause**: Le paiement a déjà été traité

**Solution**:
1. Vérifiez la base de données pour les doublons
2. Implémentez une vérification de l'état du paiement avant traitement
3. Utilisez des transactions de base de données pour éviter les doublons

### Erreur: "Insufficient permissions"

**Cause**: L'API Key n'a pas les permissions nécessaires

**Solution**:
1. Vérifiez les permissions de l'API Key sur le portail
2. Assurez-vous que "Payments" est activé
3. Régénérez l'API Key si nécessaire

---

## Support et Ressources

### Documentation Officielle
- Pi Developer Portal: https://develop.pi
- Pi SDK Documentation: https://developers.minepi.com
- Pi Blockchain API: https://developers.minepi.com/doc/blockchain

### Communauté
- Pi Developer Forum: https://pinetwork.atlassian.net/wiki/
- Pi Discord: Rejoignez la communauté pour obtenir de l'aide

### Fichiers de Référence du Projet
- `/PI_PAYMENT_GUIDE.md` - Guide complet des paiements
- `/WALLET_INTEGRATION.md` - Intégration du wallet utilisateur
- `/IMPLEMENTATION_NOTES.md` - Notes d'implémentation générales

---

## Prochaines Étapes

Après avoir configuré le wallet:

1. ✅ Testez un paiement en mode Sandbox
2. ✅ Vérifiez que l'abonnement est créé dans la base de données
3. ✅ Testez l'expérience utilisateur complète
4. ✅ Passez en mode Production
5. ✅ Surveillez les transactions et les erreurs

**Félicitations!** Votre wallet est maintenant configuré et prêt à accepter des paiements Pi Network.
