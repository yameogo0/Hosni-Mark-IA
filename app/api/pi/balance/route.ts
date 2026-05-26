// app/api/pi/balance/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Simuler un solde pour le moment
    // En production, appelez l'API Pi réelle
    const mockBalance = 25.50
    
    return NextResponse.json({ balance: mockBalance })
  } catch (error: any) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}