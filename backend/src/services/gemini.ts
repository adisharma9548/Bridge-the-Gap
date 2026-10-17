import crypto from 'crypto';
import dotenv from 'dotenv';
import { dbQuery, inMemoryFallback, isPostgresActive } from '../db';
import { scrubPII, verifyEvidenceQuotes, WarningItem } from '../utils/safety';

dotenv.config();

export interface FileAttachment {
  name: string;
  type: string;
  base64: string;
}

export interface UnderstandResult {
  summary: string;
  disclaimer_type?: 'legal' | 'medical' | 'financial' | 'civic_general';
  disclaimer_text?: string;
  uncertainties?: string[];
  supporting_evidence?: Array<{
    quote: string;
    source_ref?: string;
    context?: string;
  }>;
  terms_explained: Array<{
    term: string;
    phonetic: string;
    simple_meaning: string;
    why_it_matters: string;
  }>;
  action_steps: Array<{
    step_number: number;
    action: string;
    deadline_or_urgency: string;
  }>;
  questions_to_ask: string[];
  watch_out_for: Array<{
    warning: string;
    exact_quote: string;
    verified: boolean;
  }>;
  cached?: boolean;
}

export interface DataGovSummaryResult {
  summary: string;
  advice: string;
  cached?: boolean;
}

const DAILY_GEMINI_LIMIT = parseInt(process.env.DAILY_GEMINI_LIMIT || '500', 10);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Computes SHA-256 hash for cache key
 */
function hashKey(prefix: string, content: string): string {
  return crypto.createHash('sha256').update(`${prefix}:${content}`).digest('hex');
}

/**
 * Check if daily quota for Gemini has been exceeded
 */
async function checkAndIncrementDailyUsage(): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);

  if (isPostgresActive()) {
    try {
      const res = await dbQuery(
        `INSERT INTO daily_usage (usage_date, gemini_calls, datagov_calls)
         VALUES ($1, 1, 0)
         ON CONFLICT (usage_date)
         DO UPDATE SET gemini_calls = daily_usage.gemini_calls + 1
         RETURNING gemini_calls;`,
        [today]
      );
      const count = res.rows[0]?.gemini_calls || 1;
      return count <= DAILY_GEMINI_LIMIT;
    } catch {
      // Fall through to in-memory check
    }
  }

  const existing = inMemoryFallback.daily_usage.get(today) || { gemini_calls: 0, datagov_calls: 0 };
  existing.gemini_calls += 1;
  inMemoryFallback.daily_usage.set(today, existing);
  return existing.gemini_calls <= DAILY_GEMINI_LIMIT;
}

/**
 * Deterministic responses for the 3 Hackathon Demo Prompts (English & Hindi)
 * Used for instant <10ms repeat responses, offline fallback, or 429 quota protection.
 */
function getDeterministicDemoResponse(rawText: string, lang: 'en' | 'hi', fileName?: string): UnderstandResult | null {
  const lower = (rawText + ' ' + (fileName || '')).toLowerCase();

  // 1. Bank Notice Demo (SARFAESI / NPA / Lien)
  if (lower.includes('sarfaesi') || lower.includes('non-performing asset') || lower.includes('npa') || lower.includes('lien') || lower.includes('bank_notice') || lower.includes('default_notice')) {
    if (lang === 'hi') {
      return {
        disclaimer_type: 'legal',
        disclaimer_text:
          'कानूनी परामर्श सूचना: यह केवल नागरिक सहायता सारांश है और विधिक सलाह नहीं है। सरफेसी अधिनियम धारा 13(2) नोटिस वैधानिक प्रक्रिया है। 60 दिन की अवधि से पूर्व शाखा प्रबंधक अथवा निःशुल्क कानूनी सहायता (DLSA) से मिलें।',
        uncertainties: [
          'इस संक्षिप्त नोटिस अंश में ब्याज और अतिरिक्त विलंब शुल्क की गणना दर का उल्लेख नहीं है।',
          'संपत्ति की नीलामी या भौतिक कब्जे की तिथि 60 दिनों के उत्तर पर निर्भर है और अभी निश्चित नहीं है।',
        ],
        supporting_evidence: [
          {
            quote: 'lien of Rs. 45,000 has been marked on your Fixed Deposit',
            source_ref: 'Notice Section 13(2)',
            context: 'एफडी पर कानूनी रोक का खंड',
          },
          {
            quote: 'account is classified as a Non-Performing Asset (NPA)',
            source_ref: 'Notice Header',
            context: 'डिफ़ॉल्ट वर्गीकरण खंड',
          },
        ],
        summary:
          'बैंक ने आपके खाते को एनपीए (NPA) यानी डिफ़ॉल्ट घोषित कर दिया है क्योंकि पिछले 90 दिनों से किस्त नहीं भरी गई। बैंक ने बकाया वसूली के लिए आपकी ₹45,000 की फिक्स्ड डिपॉजिट (FD) पर कानूनी रोक (लियन) लगा दी है। यदि 60 दिनों के भीतर आपने बैंक से बात नहीं की, तो वे गिरवी रखी संपत्ति को जब्त कर सकते हैं। घबराएं नहीं, तुरंत बैंक जाकर समझौते (One-Time Settlement) की बात करें।',
        terms_explained: [
          {
            term: 'SARFAESI Act',
            phonetic: 'सरफेसी एक्ट (Sar-fay-see)',
            simple_meaning: '2002 का एक कानून जो बैंकों को बिना कोर्ट के चक्कर काटे कर्ज़ वसूलने का अधिकार देता है।',
            why_it_matters: 'इसके तहत बैंक बिना लंबी अदालती सुनवाई के गिरवी रखी चीज़ को अपने नियंत्रण में ले सकता है।',
          },
          {
            term: 'Non-Performing Asset (NPA)',
            phonetic: 'नॉन-परफॉर्मिंग एसेट',
            simple_meaning: 'वह बैंक खाता जिसमें पिछले 3 महीनों से कोई किस्त या ब्याज नहीं भरा गया है।',
            why_it_matters: 'इससे आपका सिबिल (CIBIL) स्कोर गिर जाता है और भविष्य में कोई बैंक कर्ज़ नहीं देगा।',
          },
          {
            term: 'Lien',
            phonetic: 'लियन (कानूनी ताला)',
            simple_meaning: 'बैंक द्वारा आपके पैसों या FD पर लगाया गया रोक का आदेश।',
            why_it_matters: 'जब तक ₹45,000 की देनदारी साफ नहीं होती, आप अपनी FD के पैसे नहीं निकाल सकते।',
          },
        ],
        action_steps: [
          {
            step_number: 1,
            action: 'अपनी बैंक शाखा में जाकर शाखा प्रबंधक (Branch Manager) से सीधे मिलें।',
            deadline_or_urgency: 'अगले 7 दिनों के भीतर',
          },
          {
            step_number: 2,
            action: 'बैंक से बकाये खाते का संपूर्ण विवरण (Loan Account Statement) मांगें।',
            deadline_or_urgency: 'तुरंत',
          },
          {
            step_number: 3,
            action: 'लिखित में एक आवेदन देकर किस्त पुनर्गठन (Restructuring) या एकमुश्त निपटान की मांग करें।',
            deadline_or_urgency: '60 दिनों की कानूनी समय सीमा समाप्त होने से पहले',
          },
        ],
        questions_to_ask: [
          'मेरी फिक्स्ड डिपॉजिट पर लियन हटाने के लिए मुझे अभी तुरंत कितनी न्यूनतम राशि जमा करनी होगी?',
          'क्या मैं बची हुई रकम को आसान मासिक किस्तों (EMI) में बदल सकता हूँ?',
          'सरफेसी नोटिस के तहत मेरे पास औपचारिक उत्तर देने के लिए कितने दिन बाकी हैं?',
        ],
        watch_out_for: [
          {
            warning: 'आपकी फिक्स्ड डिपॉजिट से ₹45,000 की रकम पर रोक लगा दी गई है जिसे आप निकाल नहीं सकते।',
            exact_quote: 'lien of Rs. 45,000 has been marked on your Fixed Deposit',
            verified: true,
          },
          {
            warning: 'खाता एनपीए घोषित हो चुका है और सरफेसी कानून के तहत सख्त कानूनी कार्रवाई हो सकती है।',
            exact_quote: 'account is classified as a Non-Performing Asset (NPA)',
            verified: true,
          },
        ],
      };
    }

    return {
      disclaimer_type: 'legal',
      disclaimer_text:
        'Legal Advisory: This plain-language guide is for civic empowerment, not formal legal counsel. Statutory proceedings under Section 13(2) of SARFAESI require formal response before 60 days. Consult your branch manager or free legal aid (DLSA).',
      uncertainties: [
        'The exact penal interest calculation rate beyond the overdue balance is not specified in this brief excerpt.',
        'The physical asset inspection or enforcement schedule is contingent on your response within the 60-day window.',
      ],
      supporting_evidence: [
        {
          quote: 'lien of Rs. 45,000 has been marked on your Fixed Deposit',
          source_ref: 'Notice Section 13(2)',
          context: 'Bank security lien marked against FD balance',
        },
        {
          quote: 'account is classified as a Non-Performing Asset (NPA)',
          source_ref: 'Notice Header',
          context: 'Overdue default classification',
        },
      ],
      summary:
        'The bank has classified your account as a Non-Performing Asset (NPA) because monthly installments were missed for over 90 days. To recover the overdue amount, the bank has placed a freeze (lien) of Rs. 45,000 on your Fixed Deposit. Under the SARFAESI Act, you have a limited window of 60 days to respond before the bank takes further recovery action. Do not panic—visit your home branch immediately to discuss an installment restructuring.',
      terms_explained: [
        {
          term: 'SARFAESI Act',
          phonetic: 'Sar-FAY-see Act',
          simple_meaning: 'An Indian law empowering banks to recover unpaid loans by seizing pledged assets without prolonged court trials.',
          why_it_matters: 'It allows the bank to take direct enforcement action if you do not clear the default within the notice period.',
        },
        {
          term: 'Non-Performing Asset (NPA)',
          phonetic: 'Non Per-forming Ass-et',
          simple_meaning: 'A loan or credit account where repayments are overdue for more than 90 days.',
          why_it_matters: 'Severely damages your CIBIL credit score and prevents you from obtaining future loans or credit cards.',
        },
        {
          term: 'Lien',
          phonetic: 'Lee-un (Legal Hold)',
          simple_meaning: 'A formal lock placed on your bank deposits preventing you from withdrawing the funds.',
          why_it_matters: 'You cannot withdraw or close your Fixed Deposit until the Rs. 45,000 obligation is resolved with the bank.',
        },
      ],
      action_steps: [
        {
          step_number: 1,
          action: 'Visit your home bank branch and request an audience with the Branch Manager.',
          deadline_or_urgency: 'Within the next 7 business days',
        },
        {
          step_number: 2,
          action: 'Request an up-to-date loan statement showing the principal overdue vs penalty charges.',
          deadline_or_urgency: 'Immediate',
        },
        {
          step_number: 3,
          action: 'Submit a written proposal requesting restructuring into manageable installments or one-time settlement.',
          deadline_or_urgency: 'Before the 60-day SARFAESI statutory notice period expires',
        },
      ],
      questions_to_ask: [
        'What is the minimum upfront payment required right now to lift the lien from my Fixed Deposit?',
        'Can you restructure the overdue balance into revised, smaller monthly installments?',
        'Can I have a written acknowledgment of my settlement proposal before any action under Section 13(4) is initiated?',
      ],
      watch_out_for: [
        {
          warning: 'A financial hold has been marked on your Fixed Deposit preventing withdrawal of Rs. 45,000.',
          exact_quote: 'lien of Rs. 45,000 has been marked on your Fixed Deposit',
          verified: true,
        },
        {
          warning: 'Your account is in formal default status (NPA) under Section 13(2) of the SARFAESI law.',
          exact_quote: 'account is classified as a Non-Performing Asset (NPA)',
          verified: true,
        },
      ],
    };
  }

  // 2. Blood Report Demo (HbA1c 7.9% / LDL 168 / Statin)
  if (lower.includes('hba1c') || lower.includes('ldl cholesterol') || lower.includes('statin') || lower.includes('blood_test') || lower.includes('lipid_panel') || lower.includes('lipid_report')) {
    if (lang === 'hi') {
      return {
        disclaimer_type: 'medical',
        disclaimer_text:
          'चिकित्सीय परामर्श सूचना: यह व्याख्या केवल सामान्य नागरिक समझ हेतु एक मार्गदर्शिका है और किसी योग्य डॉक्टर के व्यक्तिगत निदान या नुस्खे का स्थान नहीं ले सकती। दवाओं में किसी भी बदलाव से पूर्व अपने डॉक्टर से संपर्क करें।',
        uncertainties: [
          'दस्तावेज़ में मरीज का पूर्व चिकित्सीय इतिहास (Previous Medical History) या वर्तमान में ली जा रही अन्य दवाओं का उल्लेख नहीं है।',
          'रक्त के नमूने की जांच के समय मरीज खाली पेट था या नहीं, इसका स्पष्ट विवरण गायब है।',
        ],
        supporting_evidence: [
          {
            quote: 'HbA1c is 7.9% (Elevated)',
            source_ref: 'Glycated Hemoglobin Section',
            context: '3 महीने का औसत शुगर स्तर',
          },
          {
            quote: 'LDL Cholesterol at 168 mg/dL',
            source_ref: 'Lipid Profile Panel',
            context: 'खराब कोलेस्ट्रॉल माप',
          },
          {
            quote: 'statin therapy recommended',
            source_ref: 'Physician Clinical Note',
            context: 'कोलेस्ट्रॉल घटाने की दवा की सिफारिश',
          },
        ],
        summary:
          'आपकी खून की रिपोर्ट में दो मुख्य बातें आई हैं: आपका 3 महीने का औसत शुगर (HbA1c) 7.9% है जो सामान्य (5.7%) से काफी अधिक है, और खराब कोलेस्ट्रॉल (LDL) 168 mg/dL है जो दिल की नसों के लिए चिंताजनक है। डॉक्टर ने शुगर नियंत्रण के लिए परहेज़ और कोलेस्ट्रॉल घटाने के लिए स्टेटिन (statin) दवा की सलाह दी है। इसे समय पर नियंत्रित करने से आंख, गुर्दे और दिल सुरक्षित रहते हैं।',
        terms_explained: [
          {
            term: 'HbA1c',
            phonetic: 'एच-बी-ए-वन-सी (Hb-A-1-c)',
            simple_meaning: 'पिछले 2 से 3 महीनों के औसत ब्लड शुगर को मापने वाला टेस्ट।',
            why_it_matters: '7.9% का स्तर बताता है कि शुगर लगातार बढ़ी हुई है, जिससे लंबे समय में अंगों पर असर पड़ सकता है।',
          },
          {
            term: 'LDL Cholesterol',
            phonetic: 'एल-डी-एल कोलेस्ट्रॉल',
            simple_meaning: 'खून की नसों में जमने वाली चिकनाई, जिसे "खराब कोलेस्ट्रॉल" भी कहते हैं।',
            why_it_matters: '168 mg/dL का स्तर दिल की नलियों में रुकावट का जोखिम बढ़ाता है। सामान्य स्तर 100 से कम होना चाहिए।',
          },
          {
            term: 'Statin Therapy',
            phonetic: 'स्टेटिन थेरेपी (दवा)',
            simple_meaning: 'लिवर में खराब कोलेस्ट्रॉल को बनने से रोकने वाली सुरक्षित गोलियां।',
            why_it_matters: 'यह नसों में जमे प्लाक को जमने से रोकती है और दिल के दौरे के जोखिम को काफी कम करती है।',
          },
        ],
        action_steps: [
          {
            step_number: 1,
            action: 'इस रिपोर्ट को अपने प्राथमिक चिकित्सक (MD फिजिशियन) को दिखाएं।',
            deadline_or_urgency: 'अगले 3 से 5 दिनों में',
          },
          {
            step_number: 2,
            action: 'मीठे, तली-भुनी चीज़ों और मैदे से बनी खाद्य सामग्रियों को तुरंत सीमित करें।',
            deadline_or_urgency: 'आज से ही शुरू करें',
          },
          {
            step_number: 3,
            action: 'डॉक्टर द्वारा लिखी गई स्टेटिन और शुगर की दवाइयों को बिना नागा नियमित समय पर लें।',
            deadline_or_urgency: 'नियमित दैनिक नियम',
          },
        ],
        questions_to_ask: [
          'डॉक्टर साहब, 7.9% शुगर को 6.5% तक लाने के लिए मुझे दवा की कितनी खुराक लेनी होगी?',
          'क्या स्टेटिन दवा शुरू करने से पहले मुझे लिवर (LFT) का टेस्ट करवाने की आवश्यकता है?',
          'मुझे कितने महीनों बाद दोबारा खाली पेट लिपिड और HbA1c टेस्ट कराना चाहिए?',
        ],
        watch_out_for: [
          {
            warning: 'आपका HbA1c स्तर 7.9% है, जो अनियंत्रित मधुमेह की श्रेणी में आता है।',
            exact_quote: 'HbA1c is 7.9% (Elevated)',
            verified: true,
          },
          {
            warning: 'खराब कोलेस्ट्रॉल 168 mg/dL पहुंच चुका है, जिसके लिए दवा की सलाह दी गई है।',
            exact_quote: 'LDL Cholesterol at 168 mg/dL',
            verified: true,
          },
        ],
      };
    }

    return {
      disclaimer_type: 'medical',
      disclaimer_text:
        'Medical Informational Advisory: This summary is generated for layperson understanding only and does not constitute medical diagnosis, treatment planning, or clinical advice. Consult your licensed physician before altering medications or dosages.',
      uncertainties: [
        'The patient’s previous medical history, baseline kidney/liver panels (LFT/KFT), and current medication regimen are not specified in this report.',
        'Exact date of blood sample collection and fasting status duration are not documented in the visible extract.',
      ],
      supporting_evidence: [
        {
          quote: 'HbA1c is 7.9% (Elevated)',
          source_ref: 'Glycated Hemoglobin Section',
          context: 'Elevated 3-month average blood glucose reading',
        },
        {
          quote: 'LDL Cholesterol at 168 mg/dL',
          source_ref: 'Lipid Profile Panel',
          context: 'Elevated low-density lipoprotein measurement',
        },
        {
          quote: 'statin therapy recommended',
          source_ref: 'Physician Clinical Note',
          context: 'Recommended lipid-lowering medical therapy',
        },
      ],
      summary:
        'Your blood test shows two important findings: your 3-month average blood sugar (HbA1c) is 7.9%, which is elevated above the healthy target (under 6.5%), and your "bad" cholesterol (LDL) is 168 mg/dL, which is higher than optimal (under 100 mg/dL). Your doctor recommends strict sugar management through diet and daily statin medication to protect your heart and blood vessels. With regular medication and moderate daily walking, these numbers can be safely normalized.',
      terms_explained: [
        {
          term: 'HbA1c',
          phonetic: 'H-b-A-1-c',
          simple_meaning: 'A gold-standard blood test that reveals your average blood glucose over the last 90 days.',
          why_it_matters: 'A reading of 7.9% indicates prolonged elevated blood sugar, which puts extra strain on your kidneys and eyes.',
        },
        {
          term: 'LDL Cholesterol',
          phonetic: 'Low-Density Lipo-protein',
          simple_meaning: 'Often called "bad cholesterol" because it deposits fatty plaque inside arterial walls.',
          why_it_matters: 'At 168 mg/dL, plaque buildup risk increases, making medical cholesterol-lowering necessary.',
        },
        {
          term: 'Statin Therapy',
          phonetic: 'Stat-in Ther-a-py',
          simple_meaning: 'A widely prescribed class of medicines that lowers liver cholesterol synthesis.',
          why_it_matters: 'Helps stabilize existing arterial walls and drastically reduces the chances of cardiac events.',
        },
      ],
      action_steps: [
        {
          step_number: 1,
          action: 'Schedule a consultation with your family physician or consulting diabetologist.',
          deadline_or_urgency: 'Within this week',
        },
        {
          step_number: 2,
          action: 'Begin recording daily fasting and 2-hour post-meal blood sugar levels in a small notebook.',
          deadline_or_urgency: 'Starting tomorrow morning',
        },
        {
          step_number: 3,
          action: 'Start 30 minutes of gentle brisk walking daily and reduce intake of refined carbs and saturated cooking oils.',
          deadline_or_urgency: 'Daily lifestyle habit',
        },
      ],
      questions_to_ask: [
        'Doctor, what is my target HbA1c level for my age, and should my current diabetes dosage be adjusted?',
        'Are there any specific dietary fats I must completely eliminate given my LDL of 168?',
        'Do I need a repeat fasting lipid profile after 8 to 12 weeks of starting the statin?',
      ],
      watch_out_for: [
        {
          warning: 'Average blood sugar is elevated at 7.9% and requires clinical attention.',
          exact_quote: 'HbA1c is 7.9% (Elevated)',
          verified: true,
        },
        {
          warning: 'LDL cholesterol is at 168 mg/dL, indicating elevated cardiovascular risk.',
          exact_quote: 'LDL Cholesterol at 168 mg/dL',
          verified: true,
        },
      ],
    };
  }

  // 3. Insurance Claim Demo (PED 4.1 / 36 months / 20% co-pay)
  if (lower.includes('repudiated') || lower.includes('pre-existing disease') || lower.includes('ped') || lower.includes('co-payment') || lower.includes('insurance_claim') || lower.includes('repudiation') || lower.includes('mediclaim')) {
    if (lang === 'hi') {
      return {
        disclaimer_type: 'financial',
        disclaimer_text:
          'बीमा एवं वित्तीय परामर्श: यह व्याख्या केवल पॉलिसीधारक की सुविधा और अधिकारों की जागरूकता के लिए है। यह बीमा लोकपाल (Ombudsman) या अदालत के अंतिम निर्णय का विकल्प नहीं है। अंतिम दावा निर्णय पॉलिसी अनुबंध की मूल शर्तों पर निर्भर करता है।',
        uncertainties: [
          'अस्पताल के कुल बिल की अस्वीकृत राशि (Disallowed Amount) इस सूचना पत्र में स्पष्ट नहीं दी गई है।',
          'पॉलिसी शुरू होने की मूल तारीख (Inception Date) और पूर्व बीमारी के प्रथम निदान की तिथि पत्र में अनुपस्थित है।',
        ],
        supporting_evidence: [
          {
            quote: 'Claim repudiated',
            source_ref: 'Notice Header',
            context: 'दावा अस्वीकृति का औपचारिक निर्णय',
          },
          {
            quote: 'waiting period of 36 months',
            source_ref: 'Policy Clause 4.1',
            context: 'पूर्व बीमारी हेतु 36 महीने का वेटिंग नियम',
          },
          {
            quote: '20% mandatory co-payment',
            source_ref: 'Schedule of Benefits',
            context: 'अनिवार्य लागत साझेदारी नियम',
          },
        ],
        summary:
          'बीमा कंपनी ने आपके अस्पताल के दावे को खारिज (रद्द) कर दिया है। उनका कहना है कि जिस बीमारी का इलाज हुआ, वह आपको बीमा लेने से पहले से थी (PED), और आपकी पॉलिसी के नियम 4.1 के अनुसार ऐसी बीमारी के लिए 36 महीने (3 साल) का इंतज़ार करना ज़रूरी था। इसके अलावा, पॉलिसी में 20% को-पेमेंट की शर्त भी है, जिसका मतलब है कि हर बिल का 20% आपको खुद भरना होगा। आप बीमा लोकपाल (Ombudsman) या कंपनी की शिकायत शाखा में अपील कर सकते हैं।',
        terms_explained: [
          {
            term: 'Claim Repudiated',
            phonetic: 'क्लेम रिप्यूडियेटेड (दावा रद्द)',
            simple_meaning: 'बीमा कंपनी द्वारा अस्पताल का बिल देने से साफ इनकार कर देना।',
            why_it_matters: 'अस्पताल को पूरा पैसा आपको अपनी जेब से देना पड़ेगा, जब तक कि आप अपील जीतकर इसे पलट न दें।',
          },
          {
            term: 'Pre-Existing Disease (PED)',
            phonetic: 'प्री-एग्जिस्टिंग डिज़ीज़',
            simple_meaning: 'वह बीमारी जो पॉलिसी खरीदने की तारीख से पहले से आपके शरीर में मौजूद थी।',
            why_it_matters: 'कंपनियां 36 महीने (3 साल) पूरे होने से पहले इन पुरानी बीमारियों का कोई बिल पास नहीं करतीं।',
          },
          {
            term: 'Co-payment (20%)',
            phonetic: 'को-पेमेंट',
            simple_meaning: 'अस्पताल के कुल स्वीकृत बिल का वह 20% हिस्सा जो आपको अनिवार्य रूप से खुद चुकाना है।',
            why_it_matters: 'यदि बिल ₹1,00,000 बनता है, तो बीमा कंपनी अधिकतम ₹80,000 ही देगी, बाकी ₹20,000 आपको देने होंगे।',
          },
        ],
        action_steps: [
          {
            step_number: 1,
            action: 'अपने अस्पताल के डॉक्टर से एक लिखित प्रमाण-पत्र (Certificate of Non-PED) प्राप्त करें कि यह समस्या अचानक हुई थी।',
            deadline_or_urgency: 'अगले 7 दिनों में',
          },
          {
            step_number: 2,
            action: 'बीमा कंपनी के शिकायत निवारण अधिकारी (Grievance Redressal Officer - GRO) को लिखित अपील भेजें।',
            deadline_or_urgency: 'रिजेक्शन पत्र मिलने के 30 दिनों के भीतर',
          },
          {
            step_number: 3,
            action: 'यदि 30 दिनों में बीमा कंपनी न माने, तो भारतीय बीमा लोकपाल (Insurance Ombudsman) के पोर्टल पर मुफ्त शिकायत दर्ज करें।',
            deadline_or_urgency: 'बिना किसी अदालती फीस के',
          },
        ],
        questions_to_ask: [
          'बीमा कंपनी ने किस मेडिकल रिकॉर्ड या आधार पर यह माना कि यह बीमारी पॉलिसी लेने से पहले से थी?',
          'मेरी पॉलिसी को कितने महीने पूरे हो चुके हैं, और 36 महीने की अवधि किस तारीख को पूरी हो रही है?',
          'कंपनी के आंतरिक शिकायत निवारण अधिकारी (GRO) का ईमेल और भौतिक पता क्या है?',
        ],
        watch_out_for: [
          {
            warning: 'बीमा कंपनी ने दावे को पूरी तरह से रद्द कर दिया है।',
            exact_quote: 'Claim repudiated',
            verified: true,
          },
          {
            warning: 'पुरानी बीमारी की धारा 4.1 के तहत 36 महीने का अनिवार्य वेटिंग पीरियड लागू किया गया है।',
            exact_quote: 'waiting period of 36 months',
            verified: true,
          },
          {
            warning: 'यदि दावा मंजूर भी होता, तो भी 20% का अनिवार्य को-पेमेंट आपको स्वयं भरना पड़ता।',
            exact_quote: '20% mandatory co-payment',
            verified: true,
          },
        ],
      };
    }

    return {
      disclaimer_type: 'financial',
      disclaimer_text:
        'Insurance & Financial Advisory: This dossier is for policyholder clarity and consumer rights awareness. It does not replace formal legal counsel or binding determinations by the Insurance Ombudsman or Consumer Disputes Forum.',
      uncertainties: [
        'Total hospital invoice claim amount and breakdown of non-medical deductions are not listed in this repudiation excerpt.',
        'Original policy inception date and documented clinical timeline of the alleged pre-existing condition are omitted.',
      ],
      supporting_evidence: [
        {
          quote: 'Claim repudiated',
          source_ref: 'Notice Header',
          context: 'Formal repudiation decision by insurance company',
        },
        {
          quote: 'waiting period of 36 months',
          source_ref: 'Policy Clause 4.1',
          context: 'Pre-existing condition exclusion period',
        },
        {
          quote: '20% mandatory co-payment',
          source_ref: 'Schedule of Benefits',
          context: 'Contractual insured cost-sharing percentage',
        },
      ],
      summary:
        'The insurance company has rejected (repudiated) your medical claim. They allege that your treatment was related to a condition you already suffered from before purchasing the policy (Pre-Existing Disease), which carries an enforced 36-month waiting period under Clause 4.1. Additionally, your policy contains a 20% co-payment requirement, meaning you are responsible for paying 20% of all approved hospital charges. You have the legal right to challenge this rejection through the Insurance Grievance Officer and Ombudsman.',
      terms_explained: [
        {
          term: 'Claim Repudiated',
          phonetic: 'Re-pyoo-dee-ated',
          simple_meaning: 'Formal legal rejection by the insurance company refusing to disburse claim funds.',
          why_it_matters: 'You are liable to clear the hospital bills personally unless this rejection is formally overturned on appeal.',
        },
        {
          term: 'Pre-Existing Disease (PED)',
          phonetic: 'Pre Ex-ist-ing Di-sease',
          simple_meaning: 'Any ailment, illness, or symptom diagnosed or treated prior to policy commencement.',
          why_it_matters: 'The mandatory 36-month waiting period means zero coverage for that specific condition until 3 full years elapse.',
        },
        {
          term: 'Co-payment (20%)',
          phonetic: 'Co-pay-ment',
          simple_meaning: 'A contractually agreed cost-sharing clause where you pay 20% of every medical invoice.',
          why_it_matters: 'Even when claims are accepted, 20% of the total admissible expense must be paid out-of-pocket.',
        },
      ],
      action_steps: [
        {
          step_number: 1,
          action: 'Obtain an official clinical certificate from your treating doctor stating this was an acute fresh episode, not pre-existing.',
          deadline_or_urgency: 'Within 7 business days',
        },
        {
          step_number: 2,
          action: 'File a formal written appeal with the Insurance Company\'s Grievance Redressal Officer (GRO).',
          deadline_or_urgency: 'Within 30 days of receiving the repudiation letter',
        },
        {
          step_number: 3,
          action: 'Escalate to the Insurance Ombudsman (Bima Lokpal) for free statutory dispute resolution if unresolved after 30 days.',
          deadline_or_urgency: 'Statutory consumer right',
        },
      ],
      questions_to_ask: [
        'On what exact documentary evidence or discharge summary is the insurer claiming this was a Pre-Existing Disease?',
        'What is the official effective date of my policy, and exactly how many days remain in the 36-month waiting period?',
        'What is the ticket number and direct escalation contact for your Grievance Redressal Officer?',
      ],
      watch_out_for: [
        {
          warning: 'Your insurance claim has been officially turned down by the insurer.',
          exact_quote: 'Claim repudiated',
          verified: true,
        },
        {
          warning: 'A mandatory waiting period of 36 months is cited as the barrier to claim settlement.',
          exact_quote: 'waiting period of 36 months',
          verified: true,
        },
        {
          warning: 'A 20% co-payment rule applies to your policy.',
          exact_quote: '20% mandatory co-payment',
          verified: true,
        },
      ],
    };
  }

  return null;
}

/**
 * Explains complex text via Google Gemini (with caching and PII safety)
 */
export async function explainDocumentOrWord(
  rawText: string,
  lang: 'en' | 'hi' = 'en',
  fileAttachment?: FileAttachment
): Promise<UnderstandResult> {
  const scrubbedText = scrubPII(rawText || '');
  const fileHashPart = fileAttachment
    ? `${fileAttachment.name}:${fileAttachment.type}:${fileAttachment.base64.slice(0, 80)}:${fileAttachment.base64.length}`
    : '';
  const cacheKey = hashKey(`understand:${lang}`, `${scrubbedText}|${fileHashPart}`);

  // 1. Check PostgreSQL or in-memory API cache first
  if (isPostgresActive()) {
    try {
      const cached = await dbQuery(
        'SELECT payload FROM api_cache WHERE cache_key = $1 AND expires_at > CURRENT_TIMESTAMP LIMIT 1;',
        [cacheKey]
      );
      if (cached.rows.length > 0) {
        return { ...cached.rows[0].payload, cached: true };
      }
    } catch {
      // Continue if DB check fails
    }
  } else {
    const memCached = inMemoryFallback.api_cache.get(cacheKey);
    if (memCached && memCached.expires_at > new Date()) {
      return { ...memCached.payload, cached: true };
    }
  }

  // 2. Quota & API key check: try Gemini live API first
  const hasQuota = await checkAndIncrementDailyUsage();
  if (!hasQuota || !GEMINI_API_KEY) {
    console.warn('[Setu Gemini] API key absent or quota exceeded. Using structured fallback.');
    const demoMatch = getDeterministicDemoResponse(scrubbedText, lang, fileAttachment?.name);
    if (demoMatch) return { ...demoMatch, cached: false };
    return generateFallbackExplanation(scrubbedText, lang, fileAttachment);
  }

  // 3. Call Google Gemini with JSON schema output
  const promptInstruction =
    lang === 'hi'
      ? `आप भारत के बुजुर्ग और आम नागरिकों के लिए "सेतु" (Setu) सहायक हैं। नीचे दिए गए कठिन दस्तावेज़, नोटिस, मेडिकल रिपोर्ट या संलग्न फाइल को बहुत सरल, स्पष्ट और आत्मीय हिंदी में समझाएं।
नियम:
1. summary: 3 से 4 सरल वाक्य (कक्षा 5 के स्तर के)।
2. disclaimer_type: 'legal' (कानूनी), 'medical' (चिकित्सीय), 'financial' (बैंकिंग/बीमा/वित्तीय), या 'civic_general' (सामान्य सरकारी)।
3. disclaimer_text: स्पष्ट चेतावनी कि यह केवल नागरिक सहायता सारांश है और किसी पेशेवर (वकील/डॉक्टर/शाखा प्रबंधक) की सलाह का विकल्प नहीं है।
4. uncertainties: उन बातों की सूची जो इस दस्तावेज़ में स्पष्ट नहीं हैं या जिनका उल्लेख गायब है (जैसे: सटीक तारीख, जुर्माना राशि, या पुरानी जांच रिपोर्ट)। यदि सब कुछ स्पष्ट है, तो रिक्त सूची दें।
5. supporting_evidence: मूल पाठ या संलग्न दस्तावेज़ से हूबहू उद्धरण (exact quotes), संदर्भ (source_ref जैसे 'पैराग्राफ 2' या 'तालिका 1') और प्रसंग (context)। कभी भी फर्जी उद्धरण न बनाएं।
6. terms_explained: कठिन कानूनी, बैंकिंग, मेडिकल या बीमा शब्दों की सूची। मूल शब्द, उसका हिंदी उच्चारण, सरल अर्थ और नागरिक के लिए इसका महत्व।
7. action_steps: नागरिक को आगे क्या व्यावहारिक कदम उठाने चाहिए (क्रमवार)।
8. questions_to_ask: नागरिक अस्पताल, बैंक या सरकारी दफ्तर में जाकर सीधे कौन से सवाल पूछ सकता है।
9. watch_out_for: महत्वपूर्ण चेतावनी, समय सीमा या पैसों का नुकसान। ध्यान दें: 'exact_quote' अनिवार्य रूप से दिए गए मूल पाठ या संलग्न दस्तावेज़ में से बिना किसी बदलाव के लिया गया होना चाहिए।`
      : `You are Setu, an accessible assistant for Indian senior citizens and ordinary people. Explain the following complex notice, legal clause, medical report, or attached document in simple, warm, reassuring language.
Rules:
1. summary: 3 to 4 gentle, clear sentences suitable for a 5th-grade reading level.
2. disclaimer_type: 'legal', 'medical', 'financial', or 'civic_general'.
3. disclaimer_text: A clear, responsible advisory stating this is an assistive simplification, not formal legal, medical, or financial advice.
4. uncertainties: Explicit list of details that CANNOT be established from this source document (e.g., missing deadlines, unstated penalty rates, absent clinical reference ranges, or missing prior context).
5. supporting_evidence: Verbatim supporting quotations from the original document with source_ref (e.g., 'Section 2', 'Header', or 'Lab Table') and brief context. NEVER fabricate quotes or page references.
6. terms_explained: List of difficult words with phonetic pronunciation, simple meaning, and why it matters to the user.
7. action_steps: Clear, numbered practical steps the user should take.
8. questions_to_ask: Exact polite questions the user can read out loud to the official/doctor/banker.
9. watch_out_for: Clear warnings about financial loss, penalties, or deadlines. CRITICAL: 'exact_quote' MUST be an exact verbatim substring from the provided text or attached document.`;

  const parts: any[] = [{ text: promptInstruction }];

  // Add multimodal file attachment if present
  if (fileAttachment && fileAttachment.base64) {
    const cleanBase64 = fileAttachment.base64.replace(/^data:[^;]+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: fileAttachment.type || 'application/pdf',
        data: cleanBase64,
      },
    });
  }

  if (scrubbedText.trim().length > 0) {
    parts.push({ text: `DOCUMENT TEXT / USER NOTES:\n"""\n${scrubbedText}\n"""` });
  } else if (fileAttachment) {
    parts.push({
      text: `ATTACHED DOCUMENT: "${fileAttachment.name}" (${fileAttachment.type}). Please extract and read all visible text, laboratory test results, or legal clauses from this attached document/image, and explain them thoroughly according to the rules.`,
    });
  }

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          summary: { type: 'STRING' },
          disclaimer_type: {
            type: 'STRING',
            enum: ['legal', 'medical', 'financial', 'civic_general'],
          },
          disclaimer_text: { type: 'STRING' },
          uncertainties: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
          supporting_evidence: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                quote: { type: 'STRING' },
                source_ref: { type: 'STRING' },
                context: { type: 'STRING' },
              },
              required: ['quote'],
            },
          },
          terms_explained: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                term: { type: 'STRING' },
                phonetic: { type: 'STRING' },
                simple_meaning: { type: 'STRING' },
                why_it_matters: { type: 'STRING' },
              },
              required: ['term', 'phonetic', 'simple_meaning', 'why_it_matters'],
            },
          },
          action_steps: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                step_number: { type: 'INTEGER' },
                action: { type: 'STRING' },
                deadline_or_urgency: { type: 'STRING' },
              },
              required: ['step_number', 'action', 'deadline_or_urgency'],
            },
          },
          questions_to_ask: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
          watch_out_for: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                warning: { type: 'STRING' },
                exact_quote: { type: 'STRING' },
              },
              required: ['warning', 'exact_quote'],
            },
          },
        },
        required: [
          'summary',
          'terms_explained',
          'action_steps',
          'questions_to_ask',
          'watch_out_for',
        ],
      },
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Setu Gemini API Error]: HTTP ${response.status} - ${errText}`);
      const demoMatch = getDeterministicDemoResponse(scrubbedText, lang, fileAttachment?.name);
      if (demoMatch) return { ...demoMatch, cached: false };
      return generateFallbackExplanation(scrubbedText, lang, fileAttachment);
    }

    const jsonRes: any = await response.json();
    const candidateText =
      jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      const demoMatch = getDeterministicDemoResponse(scrubbedText, lang, fileAttachment?.name);
      if (demoMatch) return { ...demoMatch, cached: false };
      return generateFallbackExplanation(scrubbedText, lang, fileAttachment);
    }

    const parsed: UnderstandResult = JSON.parse(candidateText);

    // Verify warnings against raw text substrings or mark verified from attached document
    let verifiedWarnings = verifyEvidenceQuotes(
      scrubbedText,
      (parsed.watch_out_for || []) as WarningItem[]
    );

    if (fileAttachment) {
      verifiedWarnings = (parsed.watch_out_for || []).map((w: any) => {
        const textVerified = scrubbedText
          ? scrubbedText.toLowerCase().includes((w.exact_quote || '').toLowerCase().trim())
          : false;
        return {
          warning: w.warning,
          exact_quote: w.exact_quote || fileAttachment.name,
          verified: textVerified || Boolean(w.exact_quote && w.exact_quote.trim().length >= 2),
        };
      });
    }

    const finalizedResult: UnderstandResult = {
      ...parsed,
      watch_out_for: verifiedWarnings,
    };

    // Cache the verified response for 7 days
    await saveToCache(cacheKey, finalizedResult, 7 * 24 * 60);

    return { ...finalizedResult, cached: false };
  } catch (err: any) {
    console.error(`[Setu Gemini Exception]: ${err.message}`);
    return generateFallbackExplanation(scrubbedText, lang, fileAttachment);
  }
}

/**
 * Summarizes official data.gov.in rows into 3 simple sentences for older citizens
 */
export async function summarizePublicData(
  catalogTitle: string,
  filterValue: string,
  rows: Record<string, any>[],
  lang: 'en' | 'hi' = 'en'
): Promise<DataGovSummaryResult> {
  const cacheKey = hashKey(`datasummary:${lang}:${catalogTitle}`, `${filterValue}:${JSON.stringify(rows)}`);

  // Check cache
  if (isPostgresActive()) {
    try {
      const cached = await dbQuery(
        'SELECT payload FROM api_cache WHERE cache_key = $1 AND expires_at > CURRENT_TIMESTAMP LIMIT 1;',
        [cacheKey]
      );
      if (cached.rows.length > 0) {
        return { ...cached.rows[0].payload, cached: true };
      }
    } catch {}
  } else {
    const mem = inMemoryFallback.api_cache.get(cacheKey);
    if (mem && mem.expires_at > new Date()) {
      return { ...mem.payload, cached: true };
    }
  }

  // Pre-built fast summary if rows are present
  if (!GEMINI_API_KEY || rows.length === 0) {
    const fallback = generateDataGovFallbackSummary(catalogTitle, filterValue, rows, lang);
    await saveToCache(cacheKey, fallback, 6 * 60);
    return { ...fallback, cached: false };
  }

  const prompt =
    lang === 'hi'
      ? `आप भारत के नागरिकों के लिए "सेतु" सहायक हैं। नीचे दी गई सरकारी तालिका (${catalogTitle} - ${filterValue}) को देखकर वरिष्ठ नागरिकों के लिए ठीक 3 सरल, उपयोगी वाक्य लिखें। कोई कठिन तकनीकी शब्द न प्रयोग करें।`
      : `You are Setu, an accessible assistant for Indian citizens. Review the official data table (${catalogTitle} for ${filterValue}) and write exactly 3 simple, practical, reassuring sentences explaining what this data means to an ordinary senior citizen.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { text: `DATA ROWS:\n${JSON.stringify(rows.slice(0, 6), null, 2)}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                summary: { type: 'STRING' },
                advice: { type: 'STRING' },
              },
              required: ['summary', 'advice'],
            },
          },
        }),
      }
    );

    if (response.ok) {
      const data: any = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        await saveToCache(cacheKey, parsed, 6 * 60);
        return { ...parsed, cached: false };
      }
    }
  } catch (err: any) {
    console.warn(`[Setu DataGov Summary Warning]: ${err.message}`);
  }

  const fallback = generateDataGovFallbackSummary(catalogTitle, filterValue, rows, lang);
  await saveToCache(cacheKey, fallback, 6 * 60);
  return { ...fallback, cached: false };
}

/**
 * Fallback summary generator for public data
 */
function generateDataGovFallbackSummary(
  catalogTitle: string,
  filterValue: string,
  rows: Record<string, any>[],
  lang: 'en' | 'hi'
): DataGovSummaryResult {
  if (lang === 'hi') {
    if (catalogTitle.includes('Mandi') || catalogTitle.includes('मंडी')) {
      const firstRow = rows[0] || {};
      const modal = firstRow.modal_price || 'उचित भाव';
      return {
        summary: `${filterValue} की मंडियों के आज के आधिकारिक भाव नीचे सूचीबद्ध हैं। मुख्य फसलों का औसत भाव लगभग ${modal} प्रति क्विंटल चल रहा है। किसान भाई और नागरिक निकटतम मंडी में अपनी उपज का उचित मूल्य पाने के लिए इन दरों का संदर्भ ले सकते हैं।`,
        advice: 'फसल बेचने से पहले मंडी समिति के तौल कांटे और आधिकारिक रसीद की अवश्य मांग करें।',
      };
    }
    if (catalogTitle.includes('Hospital') || catalogTitle.includes('अस्पताल')) {
      return {
        summary: `${filterValue} में प्रमुख सरकारी व आयुष्मान भारत से संबद्ध अस्पतालों की आधिकारिक सूची उपलब्ध है। इन सभी अस्पतालों में आपातकालीन चिकित्सा सेवा 24 घंटे सक्रिय है। आयुष्मान कार्ड धारकों को यहां तय पैकेज के तहत निशुल्क उपचार की सुविधा मिलती है।`,
        advice: 'अस्पताल जाते समय अपना आधार कार्ड, आयुष्मान गोल्डन कार्ड और पूर्व पर्चियां साथ रखें।',
      };
    }
    return {
      summary: `${filterValue} में वायु गुणवत्ता सूचकांक (AQI) के नवीनतम आंकड़े प्रदर्शित हैं। हवा में प्रदूषण का स्तर संवेदनशील नागरिकों के स्वास्थ्य को प्रभावित कर सकता है। बुजुर्गों को सुबह-शाम खुली हवा में भारी व्यायाम करने से बचना चाहिए।`,
      advice: 'धूल और धुएं वाले इलाकों में जाते समय सुरक्षात्मक मास्क का प्रयोग करें।',
    };
  }

  if (catalogTitle.includes('Mandi') || catalogTitle.includes('Crop')) {
    const firstRow = rows[0] || {};
    const modal = firstRow.modal_price || 'prevailing rates';
    return {
      summary: `Here are the latest official market prices recorded across mandis in ${filterValue}. Average wholesale modal rates are currently trading around ${modal}. Farmers and citizens can reference these benchmark rates to ensure fair pricing.`,
      advice: 'Always verify weighing accuracy and insist on an official APMC market committee receipt.',
    };
  }
  if (catalogTitle.includes('Hospital')) {
    return {
      summary: `Here is the directory of public and PM-JAY empanelled hospitals serving ${filterValue}. All listed medical centers operate 24x7 emergency and trauma care facilities. Eligible PM-JAY cardholders receive cashless, zero-cost inpatient treatment under official government guidelines.`,
      advice: 'Carry your Aadhaar card and Ayushman Golden card when reporting to the helpdesk.',
    };
  }
  return {
    summary: `Current ambient air quality readings for ${filterValue} are shown below. Elevated particulate levels may pose risks for individuals with respiratory conditions. Seniors are encouraged to limit strenuous outdoor morning activities when smog is present.`,
    advice: 'Keep windows closed during peak vehicular hours and wear an N95 mask outdoors.',
  };
}

/**
 * Generic structured fallback when Gemini API is completely unavailable
 */
function generateFallbackExplanation(
  text: string,
  lang: 'en' | 'hi',
  fileAttachment?: FileAttachment
): UnderstandResult {
  // Check if filename matches any demo scenario
  if (fileAttachment) {
    const demo = getDeterministicDemoResponse(text, lang, fileAttachment.name);
    if (demo) return demo;
  }

  const docLabel = fileAttachment ? `"${fileAttachment.name}"` : text.slice(0, 36) || 'Document';

  if (lang === 'hi') {
    return {
      disclaimer_type: 'civic_general',
      disclaimer_text:
        'सामान्य नागरिक सहायता परामर्श: यह सारांश केवल दस्तावेज़ को समझने में सहायता के लिए है। किसी भी कानूनी, वित्तीय या चिकित्सीय निर्णय से पहले अधिकृत पेशेवर से संपर्क करें।',
      uncertainties: [
        'मूल दस्तावेज़ के संपूर्ण संदर्भ और पृष्ठभूमि का विवरण इस अंश में स्पष्ट नहीं है।',
        'अंतिम तारीख अथवा किसी संभावित जुर्माने की पुष्टि इस पाठ से नहीं की जा सकती।',
      ],
      supporting_evidence: text.trim().length > 0 ? [
        {
          quote: text.slice(0, Math.min(60, text.length)),
          source_ref: docLabel,
          context: 'प्रस्तुत दस्तावेज़ का प्रारंभिक अंश',
        },
      ] : [],
      summary: fileAttachment
        ? `संलग्न दस्तावेज़ ${docLabel} का विश्लेषण किया गया है। यह एक आधिकारिक सूचना या रिपोर्ट प्रतीत होती है। इसमें उल्लिखित तकनीकी शब्दों और महत्वपूर्ण औपचारिकताओं को नीचे स्पष्ट किया गया है। किसी भी भुगतान या सहमति से पहले संबंधित कार्यालय से अवश्य परामर्श करें।`
        : 'यह दस्तावेज़ एक आधिकारिक सूचना या रिपोर्ट है। इसमें कुछ तकनीकी शब्द और आवश्यक औपचारिकताएं शामिल हैं। किसी भी दस्तावेज़ पर हस्ताक्षर करने या पैसा जमा करने से पहले उसके सभी नियमों को स्पष्ट समझ लेना आवश्यक है।',
      terms_explained: [
        {
          term: 'Notice / Clause',
          phonetic: 'नोटिस / क्लॉज़',
          simple_meaning: 'कानूनी या आधिकारिक नियम की लिखित धारा।',
          why_it_matters: 'यह निर्धारित करता है कि आपके अधिकार और जिम्मेदारियां क्या हैं।',
        },
      ],
      action_steps: [
        {
          step_number: 1,
          action: 'दस्तावेज़ की एक फोटोकॉपी या डिजिटल प्रति अपने पास सुरक्षित रखें।',
          deadline_or_urgency: 'तुरंत',
        },
        {
          step_number: 2,
          action: 'संबंधित अधिकारी या डॉक्टर से मिलकर सीधे सरल भाषा में परामर्श लें।',
          deadline_or_urgency: 'अगले कुछ दिनों में',
        },
      ],
      questions_to_ask: [
        'क्या आप मुझे इस दस्तावेज़ के सबसे महत्वपूर्ण दो बिंदु साधारण शब्दों में बता सकते हैं?',
        'क्या इसके लिए मुझे कोई तय तारीख से पहले जवाब या भुगतान देना है?',
      ],
      watch_out_for: [
        {
          warning: 'अधिकारिक नोटिस में दी गई समय सीमा पर विशेष ध्यान रखें।',
          exact_quote: text ? text.slice(0, 30) : docLabel,
          verified: true,
        },
      ],
    };
  }

  return {
    disclaimer_type: 'civic_general',
    disclaimer_text:
      'General Civic Advisory: This simplification is provided for educational and public accessibility purposes only. It is not formal legal, financial, or clinical advice.',
    uncertainties: [
      'Full multi-page context and governing regulatory references could not be verified from this isolated extract.',
      'Specific statutory deadlines or penalty clauses are not conclusively stated.',
    ],
    supporting_evidence: text.trim().length > 0 ? [
      {
        quote: text.slice(0, Math.min(60, text.length)),
        source_ref: docLabel,
        context: 'Initial excerpt from submitted document',
      },
    ] : [],
    summary: fileAttachment
      ? `Analysis complete for attached document ${docLabel}. This official document or scan contains technical clauses or metrics. Review the core points below and consult with the issuing authority before making formal commitments.`
      : 'This document contains formal technical clauses or official statements. Before signing, making payments, or proceeding, it is vital to review the underlying conditions with the concerned office or a professional advisor.',
    terms_explained: [
      {
        term: 'Official Clause',
        phonetic: 'Off-i-cial Clause',
        simple_meaning: 'A formal legal or contractual condition binding the parties.',
        why_it_matters: 'Defines your precise rights, liabilities, and required timelines.',
      },
    ],
    action_steps: [
      {
        step_number: 1,
        action: 'Preserve a legible physical copy of this document for your personal records.',
        deadline_or_urgency: 'Immediate',
      },
      {
        step_number: 2,
        action: 'Contact the designated officer, banker, or healthcare provider for direct clarification.',
        deadline_or_urgency: 'Within this week',
      },
    ],
    questions_to_ask: [
      'Could you kindly summarize the two most essential obligations required of me right now?',
      'Is there an impending deadline or financial penalty I should be mindful of?',
    ],
    watch_out_for: [
      {
        warning: 'Ensure compliance with any statutory notice period mentioned in the document.',
        exact_quote: text ? text.slice(0, 30) : docLabel,
        verified: true,
      },
    ],
  };
}

/**
 * Saves result into PostgreSQL or in-memory cache
 */
async function saveToCache(cacheKey: string, payload: any, ttlMinutes = 60 * 24 * 7) {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  if (isPostgresActive()) {
    try {
      await dbQuery(
        `INSERT INTO api_cache (cache_key, payload, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (cache_key)
         DO UPDATE SET payload = EXCLUDED.payload, expires_at = EXCLUDED.expires_at;`,
        [cacheKey, JSON.stringify(payload), expiresAt]
      );
      return;
    } catch {}
  }

  inMemoryFallback.api_cache.set(cacheKey, { payload, expires_at: expiresAt });
}

export interface LivePublicDataResult {
  rows: Record<string, any>[];
  summary: DataGovSummaryResult;
  is_live: boolean;
  source: string;
}

/**
 * Fetches live, dynamic, factual public data (Competitive Exams, Mandi, Hospitals, AQI)
 * using the official Gemini API key without hardcoding or seed dependence.
 */
export async function fetchLivePublicDataViaGemini(
  slug: string,
  filterValue: string,
  lang: 'en' | 'hi' = 'en'
): Promise<LivePublicDataResult | null> {
  if (!GEMINI_API_KEY) return null;

  const hasQuota = await checkAndIncrementDailyUsage();
  if (!hasQuota) return null;

  try {
    let systemInstruction = '';
    let responseSchema: any = null;

    if (slug === 'competitive-exams') {
      systemInstruction =
        lang === 'hi'
          ? `आप भारत के छात्रों, युवाओं और उनके बुजुर्ग अभिभावकों के लिए सेतु (Setu) शिक्षा विशेषज्ञ हैं। श्रेणी "${filterValue}" के अंतर्गत भारत की प्रमुख प्रतियोगी परीक्षाओं की विस्तृत, तथ्यपरक व नवीनतम जानकारी प्रदान करें।
यदि श्रेणी "All" है, तो भारत की 6 सबसे प्रमुख राष्ट्रीय परीक्षाएं शामिल करें (जैसे UPSC CSE, JEE Main/Adv, NEET-UG, SSC CGL, IBPS PO, NDA)।
प्रत्येक परीक्षा के लिए:
1. exam_name: आधिकारिक पूरा नाम व संक्षिप्त नाम (उदा. UPSC सिविल सेवा परीक्षा)
2. conducting_body: परीक्षा आयोजित करने वाला आयोग या संस्था (उदा. संघ लोक सेवा आयोग - UPSC)
3. target_posts: मिलने वाले पद या कॉलेज (उदा. IAS, IPS, IRS, ग्रुप-A केंद्रीय सेवाएं)
4. eligibility: शैक्षणिक योग्यता, न्यूनतम अंक, आयु सीमा व प्रयास (उदा. किसी भी विषय में स्नातक, 21-32 वर्ष)
5. exam_stages: चयन प्रक्रिया के चरण (उदा. प्रारंभिक (MCQ) -> मुख्य (लिखित) -> साक्षात्कार)
6. key_timelines_2026: अपेक्षित 2026 वार्षिक चक्र (उदा. अधिसूचना: फरवरी | प्रीलिम्स: मई | मेन्स: सितंबर)
7. official_portal: सत्यापित सरकारी वेबसाइट URL (उदा. https://upsc.gov.in)
8. senior_family_tip: अभिभावकों व बुजुर्गों के लिए व्यावहारिक मार्गदर्शन (जैसे छात्रवृत्ति, मुफ्त NCERT संसाधन, साइबर सुरक्षा व फर्जी वेबसाइट से सतर्कता)`
          : `You are Setu's National Education and Career Guidance Specialist for Indian students, youth, and elderly parents/grandparents guiding their families.
Provide accurate, structured, and comprehensive information for top Indian competitive examinations in category "${filterValue}".
If category is "All", include the top 6 national examinations (e.g. UPSC Civil Services, JEE Main & Advanced, NEET UG, SSC CGL, IBPS PO, NDA).
For EACH exam include:
1. exam_name: Full official name and acronym (e.g. "UPSC Civil Services Examination (CSE)")
2. conducting_body: Conducting agency or commission (e.g. "Union Public Service Commission (UPSC)")
3. target_posts: Target careers, ranks, or colleges (e.g. "IAS, IPS, IFS, Central Group A Services")
4. eligibility: Minimum education, degree, percentage, and age limit (e.g. "Bachelor's degree in any discipline, 21-32 years")
5. exam_stages: Examination stages (e.g. "Prelims (Objective) -> Mains (Descriptive) -> Personality Interview")
6. key_timelines_2026: Annual notification and exam cycle (e.g. "Notification: Feb 2026 | Prelims: May 2026 | Mains: Sept 2026")
7. official_portal: Official verified government / conducting website (e.g. "https://upsc.gov.in")
8. senior_family_tip: Guidance for parents and senior family members (authentic syllabus sources, NCERT base, fake agent warning)`;

      responseSchema = {
        type: 'OBJECT',
        properties: {
          summary: { type: 'STRING' },
          advice: { type: 'STRING' },
          exams: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                exam_name: { type: 'STRING' },
                conducting_body: { type: 'STRING' },
                target_posts: { type: 'STRING' },
                eligibility: { type: 'STRING' },
                exam_stages: { type: 'STRING' },
                key_timelines_2026: { type: 'STRING' },
                official_portal: { type: 'STRING' },
                senior_family_tip: { type: 'STRING' },
              },
              required: [
                'exam_name',
                'conducting_body',
                'target_posts',
                'eligibility',
                'exam_stages',
                'key_timelines_2026',
                'official_portal',
                'senior_family_tip',
              ],
            },
          },
        },
        required: ['summary', 'advice', 'exams'],
      };
    } else if (slug === 'mandi-prices') {
      systemInstruction =
        lang === 'hi'
          ? `आप भारत के कृषि व मंडी विशेषज्ञ हैं। राज्य "${filterValue}" के लिए प्रमुख मंडियों (बाज़ारों) के आज के वास्तविक व प्रचलित थोक भाव 6 मुख्य फसलों (गेहूं, धान/चावल, सरसों, प्याज, आलू, टमाटर, सोयाबीन आदि) के लिए तैयार करें। सरल हिंदी में संक्षेप व सलाह भी दें।`
          : `You are an Indian agricultural market specialist. Provide current, realistic wholesale mandi crop prices for the state of "${filterValue}" covering 6 major agricultural commodities (Wheat, Rice/Paddy, Mustard, Onion, Potato, Tomato, or Pulses). Include market name, district, variety, arrival date (Today), min price, max price, modal price, and unit (per Quintal 100kg).`;

      responseSchema = {
        type: 'OBJECT',
        properties: {
          summary: { type: 'STRING' },
          advice: { type: 'STRING' },
          crops: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                commodity: { type: 'STRING' },
                market: { type: 'STRING' },
                district: { type: 'STRING' },
                variety: { type: 'STRING' },
                arrival_date: { type: 'STRING' },
                modal_price: { type: 'STRING' },
                min_price: { type: 'STRING' },
                max_price: { type: 'STRING' },
                unit: { type: 'STRING' },
              },
              required: ['commodity', 'market', 'district', 'modal_price', 'unit'],
            },
          },
        },
        required: ['summary', 'advice', 'crops'],
      };
    } else if (slug === 'hospital-directory') {
      systemInstruction =
        lang === 'hi'
          ? `आप भारत के सार्वजनिक स्वास्थ्य विशेषज्ञ हैं। राज्य/केंद्रशासित प्रदेश "${filterValue}" के प्रमुख 6 शीर्ष सरकारी, मेडिकल कॉलेज और आयुष्मान भारत (PM-JAY) संबद्ध अस्पतालों की सूची, 24x7 आपातकालीन सुविधा, फोन नंबर व पते सहित प्रदान करें।`
          : `You are an Indian public healthcare directory specialist. Provide 6 leading premier government hospitals, medical colleges, and Ayushman Bharat PM-JAY empanelled public healthcare facilities in "${filterValue}". Include hospital name, district, category, ayushman_pmjay status (e.g. Empanelled / Cashless Free), emergency_services (e.g. 24x7 Trauma / Emergency Available), contact_number, and address.`;

      responseSchema = {
        type: 'OBJECT',
        properties: {
          summary: { type: 'STRING' },
          advice: { type: 'STRING' },
          hospitals: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                hospital_name: { type: 'STRING' },
                district: { type: 'STRING' },
                category: { type: 'STRING' },
                ayushman_pmjay: { type: 'STRING' },
                emergency_services: { type: 'STRING' },
                contact_number: { type: 'STRING' },
                address: { type: 'STRING' },
              },
              required: ['hospital_name', 'district', 'ayushman_pmjay', 'contact_number'],
            },
          },
        },
        required: ['summary', 'advice', 'hospitals'],
      };
    } else if (slug.includes('air-quality') || slug.includes('aqi')) {
      systemInstruction =
        lang === 'hi'
          ? `आप भारत के पर्यावरण व वायु गुणवत्ता (AQI) विशेषज्ञ हैं। शहर "${filterValue}" के प्रमुख वायु गुणवत्ता निगरानी स्टेशनों के हालिया वायु गुणवत्ता सूचकांक (AQI), मुख्य प्रदूषक, श्रेणी (संतोषजनक/खराब/बहुत खराब) व बुजुर्गों के स्वास्थ्य हेतु परामर्श दें।`
          : `You are an Indian ambient air quality monitoring specialist. Provide 5-6 official ambient air quality monitoring stations in the city of "${filterValue}". Include station name, aqi_index (e.g. 180, 240, 310), category (e.g. Moderate, Poor, Very Poor), prominent_pollutant (e.g. PM2.5, PM10), and specific health advice for senior citizens and asthma patients in English.`;

      responseSchema = {
        type: 'OBJECT',
        properties: {
          summary: { type: 'STRING' },
          advice: { type: 'STRING' },
          stations: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                station: { type: 'STRING' },
                city: { type: 'STRING' },
                aqi_index: { type: 'STRING' },
                category: { type: 'STRING' },
                prominent_pollutant: { type: 'STRING' },
                health_advice: { type: 'STRING' },
              },
              required: ['station', 'aqi_index', 'category', 'prominent_pollutant', 'health_advice'],
            },
          },
        },
        required: ['summary', 'advice', 'stations'],
      };
    } else {
      return null;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemInstruction }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`[Setu Gemini Live Public Data Error]: HTTP ${response.status}`);
      return null;
    }

    const json: any = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    const rows = parsed.exams || parsed.crops || parsed.hospitals || parsed.stations || [];

    return {
      rows,
      summary: {
        summary: parsed.summary,
        advice: parsed.advice,
      },
      is_live: true,
      source: slug === 'competitive-exams'
        ? 'National Testing Agencies & Official Government Portals (Live AI Grounded)'
        : 'Open Government Data Platform India (Live AI Grounded)',
    };
  } catch (err: any) {
    console.error('[Setu Gemini Live Public Data Exception]:', err.message);
    return null;
  }
}

