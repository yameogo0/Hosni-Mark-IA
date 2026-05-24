// app/api/pi/payment/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, planId, amount } = body

    console.log("💰 API Pi Payment:", { action, planId, amount })

    if (action === 'create') {
      // Simulation de création de paiement
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2)}`
      
      return NextResponse.json({
        success: true,
        paymentId,
        status: 'pending',
        amount: amount || 5.99
      })
    }

    if (action === 'complete') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        subscription: {
          planId,
          active: true,
          activatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      })
    }

    return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 })
  } catch (error: any) {
    console.error("Erreur:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}