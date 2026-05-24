// app/api/analyze-image/route.ts
import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const { image, question } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "Image requise" }, { status: 400 })
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: question || "Analyse cette image et donne des conseils marketing." },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
        max_tokens: 500
      })
    })

    const data = await response.json()
    const analysis = data.choices?.[0]?.message?.content || "Analyse non disponible."

    return NextResponse.json({ analysis })
  } catch (error: any) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Erreur d'analyse" }, { status: 500 })
  }
}