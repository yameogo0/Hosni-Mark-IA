// app/api/referral/apply/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { referralCode } = await request.json()

    return NextResponse.json({
      success: true,
      bonus: 5,
      message: "Code promo appliqué !"
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}