import { NextRequest, NextResponse } from "next/server"

// Mode sandbox (test)
const PI_SANDBOX = process.env.NEXT_PUBLIC_PI_NETWORK_SANDBOX === 'true'
const PI_API_KEY = process.env.PI_API_KEY

// Vérification de la configuration en mode production
const isProduction = !PI_SANDBOX && PI_API_KEY

if (!PI_SANDBOX && !PI_API_KEY) {
  console.warn("⚠️ Mode production sans PI_API_KEY. Utilisation du mode sandbox par défaut.")
}

// Prix des abonnements
const PRICES: Record<string, number> = {
  pro_weekly: 5.99,
  premium_monthly: 19.99
}

interface PaymentTransaction {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'completed' | 'failed'
  createdAt: string
  txid?: string
  planId?: string
}

// Stockage en mémoire (à remplacer par une base de données)
const transactions: Map<string, PaymentTransaction> = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("💰 Pi Payment API - Requête reçue:", { 
      action: body.action, 
      planId: body.planId,
      mode: PI_SANDBOX ? "SANDBOX" : "PRODUCTION"
    })

    const { action, planId, amount, paymentId, txid, userId } = body

    // === MODE SANDBOX (Simulation) ===
    if (PI_SANDBOX || !PI_API_KEY) {
      console.log(`🏖️ [SANDBOX MODE] Action: ${action}`)
      
      // Créer un paiement
      if (action === "create") {
        const price = PRICES[planId] || amount
        const newPaymentId = "sandbox_" + Date.now() + "_" + Math.random().toString(36).slice(2)
        
        const transaction: PaymentTransaction = {
          id: newPaymentId,
          amount: price,
          status: 'pending',
          createdAt: new Date().toISOString(),
          planId: planId
        }
        transactions.set(newPaymentId, transaction)
        
        console.log(`✅ [SANDBOX] Paiement créé: ${newPaymentId} - ${price}π`)
        return NextResponse.json({
          success: true,
          paymentId: newPaymentId,
          status: "pending",
          amount: price,
          memo: `Abonnement ${planId} - Hinos IA`
        })
      }
      
      // Approuver un paiement
      if (action === "approve") {
        const transaction = transactions.get(paymentId)
        if (transaction && transaction.status === 'pending') {
          transaction.status = 'approved'
          console.log(`✅ [SANDBOX] Paiement approuvé: ${paymentId}`)
          return NextResponse.json({ 
            success: true, 
            status: "approved",
            paymentId 
          })
        }
        return NextResponse.json({ 
          success: false, 
          error: "Paiement non trouvé ou déjà traité" 
        }, { status: 404 })
      }
      
      // Compléter un paiement
      if (action === "complete") {
        const transaction = transactions.get(paymentId)
        if (transaction && transaction.status === 'approved') {
          transaction.status = 'completed'
          transaction.txid = txid
          console.log(`✅ [SANDBOX] Paiement complété: ${paymentId} - TXID: ${txid}`)
          
          return NextResponse.json({
            success: true,
            status: "completed",
            paymentId,
            txid,
            subscription: { 
              planId: transaction.planId || planId, 
              active: true, 
              activatedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + (planId === 'pro_weekly' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString()
            }
          })
        }
        return NextResponse.json({ 
          success: false, 
          error: "Paiement non trouvé ou non approuvé" 
        }, { status: 404 })
      }
      
      // Vérifier un paiement
      if (action === "verify") {
        const transaction = transactions.get(paymentId)
        if (transaction) {
          return NextResponse.json({
            success: true,
            verified: transaction.status === 'completed',
            status: transaction.status,
            txid: transaction.txid || "N/A"
          })
        }
        return NextResponse.json({ 
          success: false, 
          verified: false,
          error: "Paiement non trouvé" 
        }, { status: 404 })
      }

      // Obtenir l'historique des paiements
      if (action === "history") {
        const history = Array.from(transactions.values()).map(t => ({
          id: t.id,
          amount: `${t.amount}π`,
          status: t.status,
          date: t.createdAt,
          txid: t.txid
        }))
        return NextResponse.json({
          success: true,
          transactions: history
        })
      }

      return NextResponse.json({ 
        success: false, 
        error: "Action invalide" 
      }, { status: 400 })
    }
    
    // === MODE PRODUCTION - Appel réel API Pi ===
    console.log(`🌍 [PRODUCTION MODE] Action: ${action}`)

    // Créer un paiement en production
    if (action === "create") {
      const price = PRICES[planId] || amount
      console.log(`📝 Création paiement: ${price}π pour plan ${planId}`)
      
      const response = await fetch("https://api.minepi.com/v2/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${PI_API_KEY}`
        },
        body: JSON.stringify({
          amount: price,
          memo: `Abonnement ${planId} - Hinos IA`,
          metadata: { planId, userId }
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Erreur API Pi création: ${response.status}`, errorText)
        throw new Error(`Erreur API Pi: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Paiement créé via API Pi: ${data.identifier}`)
      return NextResponse.json({
        success: true,
        paymentId: data.identifier,
        status: data.status,
        amount: data.amount,
        memo: data.memo
      })
    }

    // Approuver un paiement en production
    if (action === "approve" && paymentId) {
      console.log(`👍 Approbation paiement: ${paymentId}`)
      
      const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${PI_API_KEY}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Erreur approbation: ${response.status}`, errorText)
        throw new Error(`Erreur approbation paiement: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Paiement approuvé: ${paymentId}`)
      return NextResponse.json({ 
        success: true, 
        status: "approved",
        paymentId,
        ...data
      })
    }

    // Compléter un paiement en production
    if (action === "complete" && paymentId) {
      console.log(`✅ Complétion paiement: ${paymentId} - TXID: ${txid}`)
      
      const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${PI_API_KEY}`
        },
        body: JSON.stringify({ txid })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Erreur complétion: ${response.status}`, errorText)
        throw new Error(`Erreur complétude paiement: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Paiement complété: ${paymentId}`)
      return NextResponse.json({ 
        success: true, 
        status: "completed",
        paymentId,
        txid,
        ...data
      })
    }

    // Vérifier un paiement en production
    if (action === "verify" && paymentId) {
      console.log(`🔍 Vérification paiement: ${paymentId}`)
      
      const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
        method: "GET",
        headers: {
          "Authorization": `Key ${PI_API_KEY}`
        }
      })

      if (!response.ok) {
        return NextResponse.json({ 
          success: false, 
          verified: false,
          error: "Paiement non trouvé" 
        }, { status: 404 })
      }

      const data = await response.json()
      const isCompleted = data.status?.developer_completed && data.status?.transaction_verified
      
      console.log(`🔍 Statut paiement: ${data.status?.developer_approved ? 'approuvé' : 'en attente'}`)
      
      return NextResponse.json({
        success: true,
        verified: isCompleted,
        status: data.status,
        txid: data.transaction?.txid
      })
    }

    // Historique des paiements en production
    if (action === "history" && userId) {
      console.log(`📜 Historique paiements pour user: ${userId}`)
      
      const response = await fetch(`https://api.minepi.com/v2/payments?user_uid=${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Key ${PI_API_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error(`Erreur récupération historique: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({
        success: true,
        transactions: data.payments || []
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "Action invalide" 
    }, { status: 400 })
    
  } catch (error: any) {
    console.error("❌ Erreur paiement Pi:", error.message)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erreur serveur" 
    }, { status: 500 })
  }
}