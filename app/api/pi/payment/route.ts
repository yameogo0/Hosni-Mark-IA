// app/api/pi/payment/route.ts
import { NextRequest, NextResponse } from 'next/server'

// 🔥 Mode simulation - Réponse immédiate pour les tests
const SIMULATION_MODE = true;

// 🔥 Délai de réponse (ms) - 0 pour réponse immédiate
const RESPONSE_DELAY = 0;

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Lire le corps de la requête avec gestion d'erreur
    let body
    try {
      const text = await request.text()
      console.log("📦 Corps reçu:", text)
      
      if (!text) {
        return NextResponse.json({ 
          success: false, 
          error: "Corps de requête vide" 
        }, { status: 400 })
      }
      
      body = JSON.parse(text)
    } catch (parseError) {
      console.error("❌ Erreur parsing JSON:", parseError)
      return NextResponse.json({ 
        success: false, 
        error: "Format JSON invalide" 
      }, { status: 400 })
    }

    const { action, planId, amount, paymentId, txid } = body

    console.log("💰 API Pi Payment:", { action, planId, amount, paymentId, txid })

    // 🔥 Mode simulation - Réponse ultra-rapide
    if (SIMULATION_MODE) {
      console.log("🏖️ Mode simulation - Réponse immédiate pour:", action)
      
      // Action: create
      if (action === 'create') {
        const newPaymentId = `sim_${Date.now()}_${Math.random().toString(36).slice(2)}`
        return NextResponse.json({
          success: true,
          paymentId: newPaymentId,
          status: 'approved', // Directement approuvé
          amount: amount || 5.99
        })
      }

      // Action: approve
      if (action === 'approve') {
        return NextResponse.json({
          success: true,
          status: 'approved',
          paymentId
        })
      }

      // Action: complete
      if (action === 'complete') {
        const durationDays = planId === 'pro_weekly' ? 7 : 30
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + durationDays)

        return NextResponse.json({
          success: true,
          status: 'completed',
          paymentId,
          txid: txid || `sim_tx_${Date.now()}`,
          subscription: {
            planId: planId || 'pro_weekly',
            active: true,
            activatedAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString()
          }
        })
      }
    }

    // 🔥 Mode réel
    // Action: create
    if (action === 'create') {
      const newPaymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2)}`
      
      // Simuler un petit délai si nécessaire
      if (RESPONSE_DELAY > 0) {
        await new Promise(resolve => setTimeout(resolve, RESPONSE_DELAY))
      }
      
      return NextResponse.json({
        success: true,
        paymentId: newPaymentId,
        status: 'pending',
        amount: amount || 5.99
      })
    }

    // Action: approve - Réponse immédiate
    if (action === 'approve') {
      console.log("✅ Paiement approuvé:", paymentId)
      return NextResponse.json({
        success: true,
        status: 'approved',
        paymentId
      })
    }

    // Action: complete - Réponse immédiate
    if (action === 'complete') {
      console.log("✅ Paiement complété:", paymentId, txid)
      const durationDays = planId === 'pro_weekly' ? 7 : 30
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + durationDays)

      const response = {
        success: true,
        status: 'completed',
        paymentId,
        txid: txid || `tx_${Date.now()}`,
        subscription: {
          planId: planId || 'pro_weekly',
          active: true,
          activatedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString()
        }
      }
      
      // Sauvegarder dans localStorage côté serveur (optionnel)
      console.log("✅ Réponse envoyée:", response)
      
      return NextResponse.json(response)
    }

    return NextResponse.json({ 
      success: false, 
      error: `Action inconnue: ${action}` 
    }, { status: 400 })

  } catch (error: any) {
    console.error("❌ Erreur API:", error.message)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erreur serveur" 
    }, { status: 500 })
  }
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}