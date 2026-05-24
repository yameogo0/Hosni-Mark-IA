// app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json()

    return NextResponse.json({
      success: true,
      verified: true,
      status: 'completed'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}