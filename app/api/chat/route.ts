// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ""

function detectLanguage(text: string): string {
  const textLower = text.toLowerCase()
  
  const portugueseKeywords = ['obrigado', 'obrigada', 'por favor', 'oi', 'olá', 'tudo bem', 'como vai', 'obg', 'bom dia', 'boa tarde', 'boa noite', 'legal', 'amigo', 'você', 'quero', 'preciso', 'gostaria']
  const englishKeywords = ['hello', 'hi', 'thank you', 'please', 'good morning', 'good afternoon', 'good evening', 'how are you', 'thanks', 'hey', 'want', 'need', 'would like']
  const frenchKeywords = ['bonjour', 'merci', 's\'il vous plaît', 'stp', 'svp', 'salut', 'coucou', 'bonsoir', 'comment ça va', 'ça va', 'je veux', 'j\'ai besoin']

  let ptCount = 0, enCount = 0, frCount = 0
  for (const w of portugueseKeywords) if (textLower.includes(w)) ptCount++
  for (const w of englishKeywords) if (textLower.includes(w)) enCount++
  for (const w of frenchKeywords) if (textLower.includes(w)) frCount++

  if (ptCount > enCount && ptCount > frCount) return 'pt'
  if (enCount > frCount) return 'en'
  return 'fr'
}

function getSystemPrompt(lang: string): string {
  if (lang === 'pt') {
    return `Você é Hosni IA, um assistente especialista em marketing, comércio e estratégias de crescimento.

**REGRAS IMPORTANTES:**
- Responda SEMPRE em português.
- Use emojis (📊, 💡, 🎯, 📈, 💰).
- Dê conselhos práticos.
- Comece cada resposta com um emoji relevante.`
  }

  if (lang === 'en') {
    return `You are Hosni IA, an expert assistant in marketing, commerce and growth strategies.

**IMPORTANT RULES:**
- Always answer in English.
- Use emojis (📊, 💡, 🎯, 📈, 💰).
- Give practical advice.
- Start each response with a relevant emoji.`
  }

  // Français par défaut
  return `Tu es Hosni IA, un assistant expert en marketing, commerce et stratégies de croissance.

**RÈGLES IMPORTANTES:**
- Réponds TOUJOURS en français.
- Utilise des emojis (📊, 💡, 🎯, 📈, 💰).
- Donne des conseils pratiques.
- Commence chaque réponse par un emoji pertinent.`
}

export async function POST(request: NextRequest) {
  try {
    const { message, language } = await request.json()
    const detectedLanguage = language || detectLanguage(message)
    
    console.log(`📩 Message: "${message}" | Langue: ${detectedLanguage}`)

    if (!message) {
      return NextResponse.json({ error: "Message requis" }, { status: 400 })
    }

    if (!GROQ_API_KEY) {
      const errMsg = detectedLanguage === 'pt' ? "❌ Chave de API ausente." :
                     detectedLanguage === 'en' ? "❌ API key missing." :
                     "❌ Clé API manquante."
      return NextResponse.json({ response: errMsg })
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
    const reply = data.choices?.[0]?.message?.content || 
                  (detectedLanguage === 'pt' ? "Não foi possível gerar resposta." :
                   detectedLanguage === 'en' ? "Unable to generate response." :
                   "Je n'ai pas pu générer de réponse.")

    return NextResponse.json({ response: reply, detectedLanguage })
  } catch (error: any) {
    console.error("❌ Erreur:", error.message)
    return NextResponse.json({ 
      response: "❌ Désolé, une erreur s'est produite."
    })
  }
}