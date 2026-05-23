# Wallet Pi Network - Guide d'Intégration

Ce document décrit l'implémentation complète du Wallet Pi Network pour Hosni IA.

## Vue d'ensemble

Le Wallet permet aux utilisateurs de:
- Voir leur solde Pi
- Gérer leurs abonnements (actifs, renouvellement, annulation)
- Consulter l'historique des transactions
- Accéder rapidement aux options de paiement

## Architecture

### Frontend Components

1. **`/hooks/use-wallet.ts`** - Hook React pour gérer les données du wallet
   - Récupère les données du wallet depuis le backend
   - Gère l'état de chargement et les erreurs
   - Permet l'annulation d'abonnement
   - Fournit des données mockées en mode développement

2. **`/components/wallet.tsx`** - Interface utilisateur du wallet
   - Affichage du solde Pi
   - Informations de l'abonnement actif
   - Liste des transactions avec filtres
   - Boutons d'action (s'abonner, changer de plan, annuler)

3. **Intégration dans `/app/page.tsx`**
   - Bouton Wallet dans le header
   - Sheet (panneau latéral) pour l'affichage
   - Navigation fluide entre Wallet et modales de paiement

### Types de données

```typescript
interface Transaction {
  id: string
  type: "subscription" | "image_analysis" | "continue"
  amount: number
  plan?: "weekly" | "monthly"
  status: "completed" | "pending" | "failed"
  timestamp: Date
  description: string
}

interface WalletData {
  balance: number
  userId: string
  username: string
  subscription: {
    isActive: boolean
    plan?: "weekly" | "monthly"
    startDate?: Date
    endDate?: Date
    autoRenew: boolean
  }
  transactions: Transaction[]
}
```

## Endpoints Backend Requis

### 1. GET /v1/wallet
Récupère les données complètes du wallet de l'utilisateur.

**Headers:**
```
Authorization: <pi_access_token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "balance": 125.5,
  "userId": "user_12345",
  "username": "demo_user",
  "subscription": {
    "isActive": true,
    "plan": "monthly",
    "startDate": "2024-01-15T10:00:00Z",
    "endDate": "2024-02-15T10:00:00Z",
    "autoRenew": true
  },
  "transactions": [
    {
      "id": "tx_001",
      "type": "subscription",
      "amount": 15,
      "plan": "monthly",
      "status": "completed",
      "timestamp": "2024-01-15T10:00:00Z",
      "description": "Abonnement Mensuel Pro"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: Token invalide ou expiré
- `404 Not Found`: Utilisateur non trouvé
- `500 Internal Server Error`: Erreur serveur

### 2. POST /v1/subscription/cancel
Annule l'abonnement actif de l'utilisateur.

**Headers:**
```
Authorization: <pi_access_token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "subscription": {
    "isActive": false,
    "autoRenew": false,
    "endDate": "2024-02-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Aucun abonnement actif
- `401 Unauthorized`: Token invalide
- `500 Internal Server Error`: Erreur lors de l'annulation

## Implémentation Backend

### Structure de la Base de Données

#### Table: `users`
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  pi_user_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Table: `subscriptions`
```sql
CREATE TABLE subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan_type ENUM('weekly', 'monthly') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT true,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_end_date (end_date)
);
```

#### Table: `transactions`
```sql
CREATE TABLE transactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type ENUM('subscription', 'image_analysis', 'continue') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('completed', 'pending', 'failed') DEFAULT 'pending',
  plan_type VARCHAR(50),
  description TEXT,
  payment_id VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, created_at DESC),
  INDEX idx_payment (payment_id)
);
```

### Exemple d'implémentation (Node.js/Express)

```javascript
// GET /v1/wallet
app.get('/v1/wallet', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer les informations utilisateur
    const user = await db.query(
      'SELECT id, pi_user_id, username, balance FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Récupérer l'abonnement actif
    const subscription = await db.query(
      `SELECT plan_type, start_date, end_date, auto_renew, status 
       FROM subscriptions 
       WHERE user_id = ? AND status = 'active' 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    
    // Récupérer les transactions (50 dernières)
    const transactions = await db.query(
      `SELECT id, type, amount, status, plan_type as plan, description, created_at as timestamp
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );
    
    const walletData = {
      balance: user[0].balance,
      userId: user[0].id,
      username: user[0].username,
      subscription: {
        isActive: subscription.length > 0,
        plan: subscription.length > 0 ? subscription[0].plan_type : undefined,
        startDate: subscription.length > 0 ? subscription[0].start_date : undefined,
        endDate: subscription.length > 0 ? subscription[0].end_date : undefined,
        autoRenew: subscription.length > 0 ? subscription[0].auto_renew : false,
      },
      transactions: transactions
    };
    
    res.json(walletData);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet data' });
  }
});

// POST /v1/subscription/cancel
app.post('/v1/subscription/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier l'abonnement actif
    const subscription = await db.query(
      `SELECT id, end_date FROM subscriptions 
       WHERE user_id = ? AND status = 'active' 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    
    if (!subscription.length) {
      return res.status(400).json({ error: 'No active subscription found' });
    }
    
    // Désactiver le renouvellement automatique
    await db.query(
      'UPDATE subscriptions SET auto_renew = false WHERE id = ?',
      [subscription[0].id]
    );
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        isActive: false,
        autoRenew: false,
        endDate: subscription[0].end_date
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});
```

## Logique de Gestion des Abonnements

### Création d'un abonnement

Après un paiement réussi:
1. Créer une entrée dans `subscriptions`
2. Créer une transaction dans `transactions`
3. Mettre à jour le solde si nécessaire
4. Définir `end_date` selon le plan:
   - Hebdomadaire: +7 jours
   - Mensuel: +30 jours

### Renouvellement automatique

Tâche cron quotidienne:
```javascript
async function renewSubscriptions() {
  // Trouver les abonnements qui expirent dans 24h avec auto_renew = true
  const expiringSubscriptions = await db.query(
    `SELECT s.*, u.balance 
     FROM subscriptions s 
     JOIN users u ON s.user_id = u.id 
     WHERE s.status = 'active' 
     AND s.auto_renew = true 
     AND s.end_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)`
  );
  
  for (const sub of expiringSubscriptions) {
    // Initier un nouveau paiement Pi Network
    const paymentId = await initiateRenewalPayment(sub);
    
    if (paymentId) {
      // Créer une nouvelle subscription
      await createRenewalSubscription(sub.user_id, sub.plan_type, paymentId);
    }
  }
}
```

### Expiration d'abonnement

Tâche cron quotidienne:
```javascript
async function expireSubscriptions() {
  await db.query(
    `UPDATE subscriptions 
     SET status = 'expired' 
     WHERE status = 'active' 
     AND end_date < NOW()`
  );
}
```

## Fonctionnalités Additionnelles

### 1. Historique détaillé des transactions

Ajouter des filtres:
- Par type (subscription, image_analysis, continue)
- Par statut (completed, pending, failed)
- Par période (7 jours, 30 jours, 90 jours, tout)

### 2. Notifications

Envoyer des notifications:
- 3 jours avant expiration de l'abonnement
- Lors d'un paiement réussi
- Lors d'un échec de renouvellement

### 3. Historique des abonnements

Afficher tous les abonnements passés avec:
- Durée
- Montant total payé
- Dates

### 4. Export des données

Permettre l'export de l'historique en CSV/PDF.

## Sécurité

### Authentification
- Valider le token Pi à chaque requête
- Vérifier que l'utilisateur accède uniquement à ses propres données

### Validation
- Valider tous les montants
- Vérifier les transitions d'état valides
- Prévenir les doubles paiements

### Logging
- Logger toutes les transactions
- Logger les tentatives d'accès non autorisé
- Alerter sur les anomalies (montants négatifs, etc.)

## Mode Développement

Le hook `use-wallet.ts` fournit des données mockées en cas d'erreur pour faciliter le développement:

```typescript
// Données de test automatiquement chargées
{
  balance: 125.5,
  userId: "user_12345",
  username: "demo_user",
  subscription: { isActive: true, plan: "monthly", ... },
  transactions: [...]
}
```

Pour tester avec des données réelles, assurez-vous que le backend est configuré et que les endpoints répondent correctement.

## Prochaines étapes

1. ✅ Interface Wallet complète
2. ✅ Gestion des abonnements
3. ✅ Historique des transactions
4. ⏳ Implémenter les endpoints backend
5. ⏳ Configurer la base de données
6. ⏳ Tester les flux de paiement
7. ⏳ Ajouter les notifications
8. ⏳ Implémenter le renouvellement automatique

## Support

Pour toute question sur l'implémentation, consultez:
- `/PI_PAYMENT_GUIDE.md` - Guide des paiements Pi
- `/IMPLEMENTATION_NOTES.md` - Notes générales d'implémentation
