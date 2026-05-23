# Guide d'Implémentation des Paiements Pi Network

Ce guide explique comment le système de paiement Pi Network est implémenté dans Hosni IA pour gérer les abonnements.

## Architecture du Système de Paiement

### 1. Composants Principaux

#### `/hooks/use-pi-payment.ts`
Hook personnalisé qui gère toute la logique des paiements Pi:
- Initialisation des paiements via `window.Pi.createPayment()`
- Gestion des callbacks du cycle de vie du paiement
- États de traitement et gestion des erreurs
- Définition des plans d'abonnement (hebdomadaire & mensuel)

#### `/components/payment-modal.tsx`
Interface utilisateur pour la sélection et le paiement des abonnements:
- Affichage des plans disponibles (Hebdomadaire 5π, Mensuel Pro 15π)
- Gestion de l'état du paiement en cours
- Feedback visuel (succès, erreur, chargement)
- Design responsive avec badges "Populaire"

#### `/components/subscription-banner.tsx`
Bannière d'appel à l'action pour les abonnements:
- Affichage des avantages gratuits vs premium
- Bouton "S'abonner maintenant" qui ouvre la modale de paiement
- Informations sur Pi Network

## Flux de Paiement Pi Network

### Étape 1: Initialisation
```typescript
await window.Pi.createPayment({
  amount: plan.amount,
  memo: `Abonnement ${plan.name} - Hosni IA`,
  metadata: {
    subscription_plan: plan.id,
    duration: plan.duration,
    timestamp: Date.now()
  }
}, callbacks)
```

### Étape 2: Approbation Backend (onReadyForServerApproval)
```typescript
const response = await fetch(BACKEND_URLS.APPROVE_PAYMENT(paymentId), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: accessToken,
  },
  body: JSON.stringify({
    plan_id: plan.id,
    amount: plan.amount
  })
})
```

**Ce que le backend doit faire:**
1. Vérifier le paymentId avec l'API Pi Network
2. Valider que le montant correspond au plan
3. Vérifier que l'utilisateur n'a pas déjà un abonnement actif
4. Approuver le paiement via l'API Pi

### Étape 3: Finalisation (onReadyForServerCompletion)
```typescript
const response = await fetch(BACKEND_URLS.COMPLETE_PAYMENT(paymentId), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: accessToken,
  },
  body: JSON.stringify({
    txid,
    plan_id: plan.id
  })
})
```

**Ce que le backend doit faire:**
1. Vérifier la transaction sur la blockchain Pi avec le txid
2. Créer/mettre à jour l'abonnement de l'utilisateur dans la base de données
3. Définir la date d'expiration (1 semaine ou 1 mois)
4. Activer les fonctionnalités premium
5. Retourner les informations de l'abonnement

## Implémentation Backend Requise

### Endpoints à Implémenter

#### 1. POST `/v1/payments/{paymentId}/approve`
**Headers:** 
- `Authorization: <pi_access_token>`

**Body:**
```json
{
  "plan_id": "weekly" | "monthly_pro",
  "amount": 5 | 15
}
```

**Réponse:**
```json
{
  "success": true,
  "payment_id": "...",
  "status": "approved"
}
```

**Logique:**
```python
def approve_payment(payment_id, pi_access_token, plan_id, amount):
    # 1. Vérifier le paiement avec l'API Pi
    pi_payment = verify_pi_payment(payment_id, pi_access_token)
    
    # 2. Valider les données
    if pi_payment['amount'] != amount:
        raise ValueError("Amount mismatch")
    
    # 3. Vérifier l'utilisateur
    user = get_user_from_token(pi_access_token)
    
    # 4. Approuver le paiement
    approve_result = approve_on_pi_network(payment_id)
    
    return {
        "success": True,
        "payment_id": payment_id,
        "status": "approved"
    }
```

#### 2. POST `/v1/payments/{paymentId}/complete`
**Headers:**
- `Authorization: <pi_access_token>`

**Body:**
```json
{
  "txid": "blockchain_transaction_id",
  "plan_id": "weekly" | "monthly_pro"
}
```

**Réponse:**
```json
{
  "success": true,
  "subscription": {
    "id": "sub_123",
    "plan": "weekly",
    "status": "active",
    "expires_at": "2024-02-01T00:00:00Z",
    "features": {
      "unlimited_questions": true,
      "image_analysis": true,
      "priority_support": false
    }
  }
}
```

**Logique:**
```python
def complete_payment(payment_id, txid, pi_access_token, plan_id):
    # 1. Vérifier la transaction blockchain
    tx = verify_blockchain_transaction(txid)
    
    # 2. Obtenir l'utilisateur
    user = get_user_from_token(pi_access_token)
    
    # 3. Calculer la date d'expiration
    if plan_id == "weekly":
        expires_at = datetime.now() + timedelta(weeks=1)
    else:  # monthly_pro
        expires_at = datetime.now() + timedelta(days=30)
    
    # 4. Créer/mettre à jour l'abonnement
    subscription = create_or_update_subscription(
        user_id=user.id,
        plan=plan_id,
        payment_id=payment_id,
        txid=txid,
        expires_at=expires_at,
        status="active"
    )
    
    # 5. Activer les fonctionnalités
    enable_premium_features(user.id, plan_id)
    
    # 6. Marquer le paiement comme complété
    complete_on_pi_network(payment_id, txid)
    
    return {
        "success": True,
        "subscription": subscription.to_dict()
    }
```

### Base de Données - Schema Suggéré

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    plan_id VARCHAR(50) NOT NULL, -- 'weekly' ou 'monthly_pro'
    status VARCHAR(20) NOT NULL, -- 'active', 'expired', 'cancelled'
    payment_id VARCHAR(255),
    transaction_id VARCHAR(255),
    amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'PI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP,
    
    -- Fonctionnalités activées
    unlimited_questions BOOLEAN DEFAULT true,
    image_analysis BOOLEAN DEFAULT true,
    priority_support BOOLEAN DEFAULT false,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(expires_at);
```

### Vérification de l'Abonnement

Lors de chaque requête API, vérifiez le statut de l'abonnement:

```python
def check_subscription_status(user_id):
    subscription = get_active_subscription(user_id)
    
    if not subscription:
        return {
            "tier": "free",
            "questions_remaining": calculate_daily_limit(user_id),
            "questions_limit": 10,
            "can_ask_question": True,
            "has_image_access": False
        }
    
    # Vérifier l'expiration
    if subscription.expires_at < datetime.now():
        subscription.status = "expired"
        subscription.save()
        return free_tier_status()
    
    return {
        "tier": subscription.plan_id,
        "questions_remaining": None,  # Illimité
        "questions_limit": None,
        "can_ask_question": True,
        "has_image_access": True,
        "priority_support": subscription.priority_support
    }
```

## Points de Test

### 1. Test du Paiement en Mode Sandbox
```typescript
// Dans system-config.ts
export const PI_NETWORK_CONFIG = {
  SDK_URL: "https://sdk.minepi.com/pi-sdk.js",
  SANDBOX: true,  // Activez le mode sandbox pour les tests
}
```

### 2. Test des Callbacks
- **onReadyForServerApproval**: Simuler une approbation réussie et échouée
- **onReadyForServerCompletion**: Simuler une finalisation réussie avec txid
- **onCancel**: Vérifier que l'utilisateur peut annuler
- **onError**: Tester les erreurs réseau, montant invalide, etc.

### 3. Test des États d'Abonnement
- Utilisateur sans abonnement (gratuit)
- Utilisateur avec abonnement hebdomadaire actif
- Utilisateur avec abonnement mensuel actif
- Utilisateur avec abonnement expiré
- Tentative de double paiement

## Sécurité

### Validations Requises
1. **Vérifier toujours le montant** côté backend
2. **Valider le paymentId** avec l'API Pi Network
3. **Vérifier le txid** sur la blockchain
4. **Empêcher les paiements en double** pour le même plan actif
5. **Vérifier l'identité de l'utilisateur** via le token d'accès

### Gestion des Erreurs
```typescript
// Erreurs communes à gérer
- "Pi SDK non disponible" → Rafraîchir la page
- "Non authentifié" → Reconnecter l'utilisateur
- "Paiement refusé" → Afficher le message d'erreur de Pi
- "Erreur réseau" → Permettre de réessayer
- "Abonnement déjà actif" → Rediriger vers le tableau de bord
```

## Fonctionnalités Futures

### Gestion des Abonnements
- Page de gestion des abonnements
- Historique des paiements
- Annulation/Renouvellement automatique
- Remboursements

### Notifications
- Email de confirmation d'abonnement
- Rappel d'expiration (3 jours avant)
- Notification de renouvellement

### Analytics
- Tracking des conversions
- Taux d'abandon de paiement
- Plans les plus populaires
- Revenus par période

## Support et Debugging

### Logs Importants
Tous les logs du processus de paiement sont préfixés avec `[v0]`:
```
[v0] Initiating Pi payment for plan: Mensuel Pro
[v0] Payment ready for approval: payment_123
[v0] Payment approved by backend
[v0] Payment ready for completion: payment_123 tx_456
[v0] Payment completed successfully
```

### Commandes Utiles
```bash
# Vérifier le statut d'un paiement
curl -X GET https://api.minepi.com/v2/payments/{paymentId} \
  -H "Authorization: Bearer YOUR_PI_ACCESS_TOKEN"

# Vérifier une transaction blockchain
curl -X GET https://api.testnet.minepi.com/transactions/{txid}/effects
```

## Ressources

- [Pi Network Developer Documentation](https://developers.minepi.com/)
- [Pi SDK Reference](https://github.com/pi-apps/pi-platform-docs)
- [Pi Blockchain API](https://developers.minepi.com/doc/api)
