// app/api/pi/payment/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Stockage temporaire des paiements (à remplacer par une base de données)
const payments = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, planId, amount, paymentId, txid } = body

    console.log("💰 API Pi Payment:", { action, planId, amount, paymentId })

    // Phase I: Création du paiement
    if (action === 'create') {
      const newPaymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2)}`
      
      // Stocker le paiement
      payments.set(newPaymentId, {
        id: newPaymentId,
        planId,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      
      console.log("✅ Paiement créé:", newPaymentId)
      
      return NextResponse.json({
        success: true,
        paymentId: newPaymentId,
        status: 'pending',
        amount: amount || 5.99
      })
    }

    // Phase I - Server-Side Approval
    if (action === 'approve') {
      const payment = payments.get(paymentId)
      if (payment) {
        payment.status = 'approved'
        console.log("✅ Paiement approuvé côté serveur:", paymentId)
      }
      
      return NextResponse.json({
        success: true,
        status: 'approved',
        paymentId
      })
    }

    // Phase III - Server-Side Completion
    if (action === 'complete') {
      const payment = payments.get(paymentId)
      if (payment) {
        payment.status = 'completed'
        payment.txid = txid
        payment.completedAt = new Date().toISOString()
        console.log("✅ Paiement complété:", paymentId, txid)
      }
      
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

    return NextResponse.json({ success: false, error: `Action inconnue: ${action}` }, { status: 400 })

  } catch (error: any) {
    console.error("❌ Erreur:", error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}