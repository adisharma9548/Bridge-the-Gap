import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const AVAILABLE_GROQ_MODELS = [
  GROQ_MODEL,
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
];

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Calls Groq Cloud API with automatic fallback across available models
 */
export async function callGroqChatCompletion(
  messages: GroqMessage[],
  options: {
    jsonMode?: boolean;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<any | null> {
  if (!GROQ_API_KEY) {
    console.warn('[Setu Groq] GROQ_API_KEY is not configured in .env');
    return null;
  }

  const { jsonMode = true, temperature = 0.2, maxTokens = 2048 } = options;

  for (const model of AVAILABLE_GROQ_MODELS) {
    try {
      const body: Record<string, any> = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      };

      if (jsonMode) {
        body.response_format = { type: 'json_object' };
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[Setu Groq] Model ${model} returned HTTP ${res.status}: ${errText.slice(0, 120)}`);
        continue;
      }

      const data: any = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        continue;
      }

      if (jsonMode) {
        try {
          return JSON.parse(content);
        } catch (parseErr) {
          console.warn(`[Setu Groq] JSON parse error for ${model}, raw: ${content.slice(0, 100)}`);
          continue;
        }
      }

      return content;
    } catch (err: any) {
      console.warn(`[Setu Groq] Call error for model ${model}: ${err.message}`);
    }
  }

  return null;
}

/**
 * Plain-language document explanation using Groq high-speed AI
 */
export async function explainDocumentWithGroq(
  text: string,
  lang: 'en' | 'hi' = 'en'
): Promise<any | null> {
  const isHindi = lang === 'hi';

  const systemPrompt = isHindi
    ? `आप "सेतु" (Setu) के वरिष्ठ नागरिक एवं जन-सुलभ भाषा विशेषज्ञ AI हैं।
आपका उद्देश्य कठिन सरकारी, कानूनी, चिकित्सा या वित्तीय नोटिस/दस्तावेज़ को 68 वर्षीय भारतीय बुज़ुर्ग के लिए सरल, आदरणीय और स्पष्ट हिंदी में समझाना है।

नियम:
1. जवाब केवल वैध JSON प्रारूप में दें।
2. कोई तकनीकी या कानूनी शब्दावली बिना सरल अर्थ के न छोड़ें।
3. घबराहट दूर करें और शांतिपूर्ण मार्गदर्शन दें।
4. यदि स्रोत में कोई जानकारी अनिश्चित है तो 'uncertainties' में स्पष्ट लिखें। कभी मनगढ़ंत आंकड़े न बनाएं।`
    : `You are "Setu", a compassionate public assistance AI designed for a 68-year-old Indian citizen who finds complex legal, civic, medical, and banking documents intimidating.

Rules:
1. Output ONLY valid JSON matching the schema below.
2. Translate complex jargon into plain, respectful, crystal-clear English.
3. Provide calm, reassuring advice and practical next steps.
4. If facts, deadlines, or fees are missing from text, explicitly list them in 'uncertainties'. Never fabricate details.`;

  const userPrompt = `DOCUMENT TEXT TO EXPLAIN:
"""
${text.slice(0, 8000)}
"""

Respond with this exact JSON schema:
{
  "summary": "Plain-language 3-4 sentence compassionate summary",
  "disclaimer_type": "civic_general | legal | medical | financial",
  "uncertainties": ["Explicitly state any details missing from source"],
  "terms_explained": [
    {
      "term": "Difficult Term",
      "phonetic": "How to pronounce in everyday syllables",
      "simple_meaning": "Simple everyday definition in 1-2 lines",
      "why_it_matters": "Why the elder person should care"
    }
  ],
  "action_steps": [
    {
      "step_number": 1,
      "action": "Clear step to take",
      "deadline_or_urgency": "Immediate / Within 7 days / etc."
    }
  ],
  "questions_to_ask": [
    "Specific question to ask the bank manager, doctor, or clerk"
  ],
  "watch_out_for": [
    {
      "warning": "Important risk or fraud alert",
      "exact_quote": "Supporting quote from text",
      "verified": true
    }
  ]
}`;

  return await callGroqChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}

/**
 * Public data summarization using Groq
 */
export async function summarizePublicDataWithGroq(
  catalogTitle: string,
  filterValue: string,
  rows: Record<string, any>[],
  lang: 'en' | 'hi' = 'en'
): Promise<{ summary: string; advice: string } | null> {
  const isHindi = lang === 'hi';

  const systemPrompt = isHindi
    ? `आप "सेतु" के जन-सूचना सहायक हैं। दी गई तालिका (सरकारी डेटा) को देखकर 68 वर्षीय बुज़ुर्ग के लिए 2 वाक्यों का संक्षिप्त सार और बुजुर्गों/परिवार के लिए 1 व्यावहारिक सलाह JSON में दें।`
    : `You are "Setu" public data assistant. Summarize this government data table for a 68-year-old elder in 2 plain sentences and provide 1 practical family advice.`;

  const userPrompt = `TOPIC: ${catalogTitle} | FILTER: ${filterValue}
DATA ROWS:
${JSON.stringify(rows.slice(0, 6), null, 2)}

Respond with JSON:
{
  "summary": "2 plain-language sentences",
  "advice": "1 practical family/senior tip"
}`;

  return await callGroqChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}
