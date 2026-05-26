import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, planId, status } = body

    console.log(`🔄 Mise à jour abonnement: ${userId} -> ${planId} (${status})`)

    const expiresAt = new Date()
    if (planId === 'pro_weekly') {
      expiresAt.setDate(expiresAt.getDate() + 7)
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    }

    return NextResponse.json({ 
      success: true, 
      subscription: {
        planId,
        status,
        activatedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}