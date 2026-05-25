// app/api/pi/payment/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Lire le corps de la requête
    const text = await request.text()
    console.log("📦 Corps reçu:", text)

    if (!text) {
      return NextResponse.json({ 
        success: false, 
        error: "Corps de requête vide" 
      }, { status: 400 })
    }

    const body = JSON.parse(text)
    const { action, planId, amount, paymentId, txid } = body

    console.log("💰 API Pi Payment:", { action, planId, amount })

    // Action: create
    if (action === 'create') {
      const newPaymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2)}`
      return NextResponse.json({
        success: true,
        paymentId: newPaymentId,
        status: 'pending',
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
        txid,
        subscription: {
          planId: planId || 'pro_weekly',
          active: true,
          activatedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString()
        }
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: `Action inconnue: ${action}` 
    }, { status: 400 })

  } catch (error: any) {
    console.error("❌ Erreur:", error.message)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erreur serveur" 
    }, { status: 500 })
  }
}