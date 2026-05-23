// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Clé API Groq (à mettre dans les variables d'environnement Vercel)
const GROQ_API_KEY = process.env.GROQ_API_KEY || ""

// Détection de la langue
function detectLanguage(text: string): string {
  const textLower = text.toLowerCase()
  
  const portugueseKeywords = ['obrigado', 'obrigada', 'por favor', 'oi', 'olá', 'tudo bem', 'como vai', 'obg', 'bom dia', 'boa tarde', 'boa noite', 'legal', 'amigo']
  const englishKeywords = ['hello', 'hi', 'thank you', 'please', 'good morning', 'good afternoon', 'good evening', 'how are you', 'thanks', 'hey']
  const frenchKeywords = ['bonjour', 'merci', 's\'il vous plaît', 'stp', 'svp', 'salut', 'coucou', 'bonsoir', 'comment ça va', 'ça va']
  
  for (const word of portugueseKeywords) if (textLower.includes(word)) return 'pt'
  for (const word of englishKeywords) if (textLower.includes(word)) return 'en'
  for (const word of frenchKeywords) if (textLower.includes(word)) return 'fr'
  return 'fr'
}

// Prompt système selon la langue
function getSystemPrompt(lang: string): string {
  const prompts: Record<string, string> = {
    fr: `Tu es Hosni IA, un assistant expert en marketing, commerce et stratégies de croissance.

**DOMAINES DE COMPÉTENCE :**
- Stratégie de marque et positionnement
- Marketing digital (SEO, réseaux sociaux, publicités)
- Vente et CRM
- Analyse de données et KPIs

**RÈGLES :**
- Réponds TOUJOURS en français
- Donne des conseils pratiques et actionnables
- Sois professionnel et encourageant
- Utilise des emojis pour illustrer tes propos

Commence chaque réponse par un emoji pertinent.`,

    pt: `Você é Hosni IA, um assistente especialista em marketing, comércio e estratégias de crescimento.

**REGRAS:**
- Responda SEMPRE em português
- Dê conselhos práticos
- Use emojis
- Comece cada resposta com um emoji relevante`,

    en: `You are Hosni IA, an expert assistant in marketing, commerce and growth strategies.

**RULES:**
- Always answer in English
- Give practical advice
- Use emojis
- Start each response with a relevant emoji`
  }
  return prompts[lang] || prompts.fr
}

export async function POST(request: NextRequest) {
  try {
    const { message, language } = await request.json()
    const detectedLanguage = language || detectLanguage(message)
    
    console.log("📩 Message reçu:", message)
    console.log("🔍 Langue détectée:", detectedLanguage)

    if (!message) {
      return NextResponse.json({ error: "Message requis" }, { status: 400 })
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ 
        response: "❌ Clé API manquante. Veuillez configurer GROQ_API_KEY."
      })
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: getSystemPrompt(detectedLanguage) },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || "Je n'ai pas pu générer de réponse."

    return NextResponse.json({ response: reply, detectedLanguage })

  } catch (error: any) {
    console.error("❌ Erreur:", error.message)
    return NextResponse.json({ 
      response: "❌ Désolé, une erreur s'est produite. Veuillez réessayer."
    })
  }
}