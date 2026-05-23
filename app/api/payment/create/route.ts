// app/api/payment/create/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, planId, userId } = await request.json()

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2)}`

    // Stockage temporaire (à remplacer par une base de données)
    const payment = {
      id: paymentId,
      amount,
      planId,
      userId,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    console.log("💰 Paiement créé:", payment)

    return NextResponse.json({
      success: true,
      paymentId,
      status: 'pending',
      amount
    })

  } catch (error: any) {
    console.error("Erreur création paiement:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}