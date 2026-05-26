import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    // Vérification de l'abonnement
    // I vous pouvez vérifier dans votre base de données

    return NextResponse.json({ 
      success: true, 
      isActive: false,
      tier: "free",
      expiresAt: null
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}