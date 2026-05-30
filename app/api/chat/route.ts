// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Clé API Groq (à mettre dans les variables d'environnement Vercel)
const GROQ_API_KEY = process.env.GROQ_API_KEY || ""

// Détection avancée de la langue
function detectLanguage(text: string): string {
  const textLower = text.toLowerCase()
  
  // Mots-clés portugais (plus complets)
  const portugueseKeywords = [
    'obrigado', 'obrigada', 'por favor', 'oi', 'olá', 'tudo bem', 'como vai', 'obg', 
    'bom dia', 'boa tarde', 'boa noite', 'legal', 'amigo', 'você', 'vós', 'qual',
    'como', 'onde', 'quando', 'piscicultura', 'agricultura', 'pecuária', 'assinatura',
    'quero', 'preciso', 'gostaria', 'interesse'
  ]
  
  // Mots-clés anglais
  const englishKeywords = [
    'hello', 'hi', 'thank you', 'please', 'good morning', 'good afternoon', 'good evening', 
    'how are you', 'thanks', 'hey', 'you', 'your', 'what', 'where', 'when', 'question',
    'want', 'need', 'would like', 'interested', 'subscription', 'help', 'advice'
  ]
  
  // Mots-clés français
  const frenchKeywords = [
    'bonjour', 'merci', 's\'il vous plaît', 'stp', 'svp', 'salut', 'coucou', 'bonsoir', 
    'comment ça va', 'ça va', 'vous', 'votre', 'quel', 'où', 'quand', 'question',
    'je veux', 'j\'ai besoin', 'je souhaite', 'intéressé', 'abonnement', 'aide', 'conseil'
  ]
  
  // Compter les correspondances
  let ptCount = 0, enCount = 0, frCount = 0
  
  for (const word of portugueseKeywords) if (textLower.includes(word)) ptCount++
  for (const word of englishKeywords) if (textLower.includes(word)) enCount++
  for (const word of frenchKeywords) if (textLower.includes(word)) frCount++
  
  // Retourner la langue avec le plus de correspondances
  if (ptCount > enCount && ptCount > frCount) return 'pt'
  if (enCount > frCount) return 'en'
  if (frCount > 0) return 'fr'
  
  // Analyse de caractères spéciaux
  if (textLower.includes('ç') || textLower.includes('é') || textLower.includes('è') || textLower.includes('ê')) return 'fr'
  if (textLower.includes('ã') || textLower.includes('õ') || textLower.includes('ô') || textLower.includes('ç')) return 'pt'
  
  return 'fr' // Défaut: français
}

// Prompt système selon la langue avec instructions détaillées
function getSystemPrompt(lang: string): string {
  const prompts: Record<string, string> = {
    fr: `Tu es Hosni IA, un assistant expert en marketing, commerce et stratégies de croissance.

**IMPORTANT : Réponds TOUJOURS en FRANÇAIS, peu importe la langue de la question.**

**DOMAINES DE COMPÉTENCE :**
- Stratégie de marque et positionnement
- Marketing digital (SEO, réseaux sociaux, publicités)
- Vente et CRM
- Analyse de données et KPIs
- E-commerce et tendances

**RÈGLES :**
- Réponds TOUJOURS en français
- Donne des conseils pratiques et actionnables avec des exemples concrets
- Sois professionnel, encourageant et bienveillant
- Utilise des emojis pour illustrer tes propos (📊, 💡, 🎯, 📈, 💰)
- Structure tes réponses avec des puces ou des paragraphes courts
- Propose des actions immédiates que l'utilisateur peut mettre en place

Commence chaque réponse par un emoji pertinent.
Termine parfois par une question ouverte pour engager la conversation.`,

    pt: `Você é Hosni IA, um assistente especialista em marketing, comércio e estratégias de crescimento.

**IMPORTANTE: Responda SEMPRE em PORTUGUÊS, independentemente do idioma da pergunta.**

**DOMÍNIOS DE COMPETÊNCIA:**
- Estratégia de marca e posicionamento
- Marketing digital (SEO, redes sociais, anúncios)
- Vendas e CRM
- Análise de dados e KPIs
- E-commerce e tendências

**REGRAS:**
- Responda SEMPRE em português
- Dê conselhos práticos e acionáveis com exemplos concretos
- Seja profissional, encorajador e amigável
- Use emojis para ilustrar suas ideias (📊, 💡, 🎯, 📈, 💰)
- Estruture suas respostas com marcadores ou parágrafos curtos
- Ofereça ações imediatas que o usuário pode implementar

Comece cada resposta com um emoji relevante.
Termine às vezes com uma pergunta aberta para engajar a conversa.`,

    en: `You are Hosni IA, an expert assistant in marketing, commerce and growth strategies.

**IMPORTANT: Always answer in ENGLISH, regardless of the question's language.**

**AREAS OF EXPERTISE:**
- Brand strategy and positioning
- Digital marketing (SEO, social media, ads)
- Sales and CRM
- Data analysis and KPIs
- E-commerce and trends

**RULES:**
- Always answer in English
- Give practical and actionable advice with concrete examples
- Be professional, encouraging and friendly
- Use emojis to illustrate your points (📊, 💡, 🎯, 📈, 💰)
- Structure your responses with bullet points or short paragraphs
- Offer immediate actions the user can implement

Start each response with a relevant emoji.
Sometimes end with an open question to engage conversation.`
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
      const errorMessages: Record<string, string> = {
        fr: "❌ Clé API manquante. Veuillez configurer GROQ_API_KEY dans les variables d'environnement.",
        pt: "❌ Chave de API ausente. Configure GROQ_API_KEY nas variáveis de ambiente.",
        en: "❌ API key missing. Please configure GROQ_API_KEY in environment variables."
      }
      return NextResponse.json({ 
        response: errorMessages[detectedLanguage] || errorMessages.fr
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
        max_tokens: 800,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erreur API Groq:", response.status, errorText)
      
      const errorMessages: Record<string, string> = {
        fr: "❌ Désolé, l'assistant est momentanément indisponible. Veuillez réessayer plus tard.",
        pt: "❌ Desculpe, o assistente está temporariamente indisponível. Tente novamente mais tarde.",
        en: "❌ Sorry, the assistant is temporarily unavailable. Please try again later."
      }
      return NextResponse.json({ 
        response: errorMessages[detectedLanguage] || errorMessages.fr
      })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 
      (detectedLanguage === 'pt' ? "Não foi possível gerar uma resposta." :
       detectedLanguage === 'en' ? "Unable to generate a response." :
       "Je n'ai pas pu générer une réponse.")

    return NextResponse.json({ 
      response: reply, 
      detectedLanguage,
      success: true
    })

  } catch (error: any) {
    console.error("❌ Erreur:", error.message)
    
    const errorMessages: Record<string, string> = {
      fr: "❌ Désolé, une erreur s'est produite. Veuillez réessayer.",
      pt: "❌ Desculpe, ocorreu um erro. Tente novamente.",
      en: "❌ Sorry, an error occurred. Please try again."
    }
    
    return NextResponse.json({ 
      response: errorMessages.fr,
      error: error.message
    }, { status: 500 })
  }
}