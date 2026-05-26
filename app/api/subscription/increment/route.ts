// app/api/subscription/increment/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    console.log(`📊 Incrémentation des questions pour l'utilisateur: ${userId}`)

    // Ici vous pouvez implémenter la logique pour incrémenter le compteur
    // Par exemple, stocker dans une base de données le nombre de questions utilisées

    return NextResponse.json({ 
      success: true, 
      message: "Question comptée",
      count: 1
    })
  } catch (error: any) {
    console.error("Erreur:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}