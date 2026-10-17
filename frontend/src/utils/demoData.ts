import { Language } from '../i18n/translations';

export interface UnderstandData {
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

export function getClientDemoData(query: string, lang: Language): UnderstandData | null {
  const lower = query.toLowerCase();

  // 1. Bank SARFAESI Demo
  if (
    lower.includes('sarfaesi') ||
    lower.includes('non-performing asset') ||
    lower.includes('npa') ||
    lower.includes('lien') ||
    lower.includes('bank_notice')
  ) {
    if (lang === 'hi') {
      return {
        disclaimer_type: 'legal',
        disclaimer_text:
          'कानूनी परामर्श चेतावनी: यह केवल आम नागरिक की सहायता हेतु एक व्याख्या है और किसी पंजीकृत अधिवक्ता या बैंक शाखा प्रबंधक के आधिकारिक परामर्श का विकल्प नहीं है। किसी भी कानूनी कार्यवाही से पूर्व विशेषज्ञ से सलाह लें।',
        uncertainties: [
          'मूल ऋण खाते की वास्तविक बकाया मूलधन राशि (Principal Overdue) का इस सूचना में उल्लेख नहीं है।',
          'फिक्स्ड डिपॉजिट पर लगने वाले ब्याज या पेनल्टी की सटीक गणना पत्र में अनुपस्थित है।',
        ],
        supporting_evidence: [
          {
            quote: 'lien of Rs. 45,000 has been marked on your Fixed Deposit',
            source_ref: 'धारा 13(2) नोटिस',
            context: 'एफडी पर बैंक द्वारा लगाया गया कानूनी होल्ड',
          },
          {
            quote: 'account is classified as a Non-Performing Asset (NPA)',
            source_ref: 'नोटिस शीर्षक',
            context: 'खाते की आधिकारिक डिफ़ॉल्ट स्थिति',
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
            action: 'एकमुश्त समाधान (One-Time Settlement या OTS) के लिए लिखित आवेदन दें।',
            deadline_or_urgency: '60 दिन का नोटिस खत्म होने से पहले',
          },
        ],
        questions_to_ask: [
          'प्रबंधक महोदय, इस खाते पर कुल मूलधन और अलग से लगाया गया ब्याज कितना है?',
          'क्या मैं अपनी ₹45,000 की एफडी (FD) को इस लोन के विरुद्ध तुरंत समायोजित करवा सकता हूं?',
          'क्या आपके बैंक में इस समय कोई विशेष ओटीएस (OTS) या ब्याज छूट योजना चल रही है?',
        ],
        watch_out_for: [
          {
            warning: 'बैंक ने आपकी ₹45,000 की फिक्स्ड डिपॉजिट पर कानूनी रोक (Lien) लगा दी है।',
            exact_quote: 'lien of Rs. 45,000 has been marked on your Fixed Deposit',
            verified: true,
          },
          {
            warning: 'आपके खाते को एनपीए (डिफ़ॉल्ट) घोषित कर दिया गया है।',
            exact_quote: 'account is classified as a Non-Performing Asset (NPA)',
            verified: true,
          },
        ],
      };
    }

    return {
      disclaimer_type: 'legal',
      disclaimer_text:
        'Legal Informational Advisory: This summary is provided for consumer awareness and educational purposes only. It does not constitute formal legal representation or financial counsel. Seek immediate advice from a banking advocate or the branch manager.',
      uncertainties: [
        'The exact breakdown of principal debt vs accrued penal interest is not specified in this statutory notice.',
        'Whether any prior one-time settlement scheme or restructuring request was registered remains unknown from this extract.',
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
        'The bank has classified your loan as a Non-Performing Asset (NPA) because repayments are overdue by more than 90 days. To recover the dues, the bank has placed a legal freeze (lien) on your ₹45,000 Fixed Deposit. Under Section 13(2) of the SARFAESI Act, you have 60 days to respond before the bank initiates property attachment. Do not panic—schedule a meeting with the branch manager immediately to negotiate a repayment schedule or One-Time Settlement (OTS).',
      terms_explained: [
        {
          term: 'SARFAESI Act',
          phonetic: 'Sar-fay-see Act',
          simple_meaning: 'An Indian law from 2002 that empowers banks to auction mortgaged assets to recover unpaid debt without court orders.',
          why_it_matters: 'Allows the bank to take administrative recovery steps directly once the 60-day statutory notice expires.',
        },
        {
          term: 'Non-Performing Asset (NPA)',
          phonetic: 'N-P-A',
          simple_meaning: 'A loan account where interest or principal installments have remained unpaid for over 90 days.',
          why_it_matters: 'Severely damages your CIBIL credit score and stops all future credit eligibility.',
        },
        {
          term: 'Lien',
          phonetic: 'Lee-en (Legal hold)',
          simple_meaning: 'A formal legal claim or freeze by a bank on your asset until an outstanding debt is settled.',
          why_it_matters: 'You cannot withdraw or break your ₹45,000 Fixed Deposit until the bank lifts this restriction.',
        },
      ],
      action_steps: [
        {
          step_number: 1,
          action: 'Visit your home branch in person and meet the Branch Manager or Recovery Officer.',
          deadline_or_urgency: 'Within the next 7 days',
        },
        {
          step_number: 2,
          action: 'Request a certified Loan Account Statement with itemized penal interest breakdowns.',
          deadline_or_urgency: 'Immediate',
        },
        {
          step_number: 3,
          action: 'Submit a formal written proposal requesting a One-Time Settlement (OTS) or loan restructuring.',
          deadline_or_urgency: 'Before the 60-day notice period ends',
        },
      ],
      questions_to_ask: [
        'Sir/Madam, what is the exact principal balance separate from accumulated penal interest?',
        'Can my ₹45,000 Fixed Deposit be directly liquidated and credited toward settling this overdue balance?',
        'What are the official OTS (One-Time Settlement) concession guidelines currently in effect for my account?',
      ],
      watch_out_for: [
        {
          warning: 'A ₹45,000 lien has frozen your Fixed Deposit funds.',
          exact_quote: 'lien of Rs. 45,000 has been marked on your Fixed Deposit',
          verified: true,
        },
        {
          warning: 'Your account is in formal default as a Non-Performing Asset.',
          exact_quote: 'account is classified as a Non-Performing Asset (NPA)',
          verified: true,
        },
      ],
    };
  }

  // 2. Medical HbA1c & Cholesterol Demo
  if (
    lower.includes('hba1c') ||
    lower.includes('ldl cholesterol') ||
    lower.includes('statin') ||
    lower.includes('blood_test') ||
    lower.includes('lipid')
  ) {
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
            action: 'अपनी इस रिपोर्ट को लेकर अपने फैमिली डॉक्टर या फिजीशियन से मिलें।',
            deadline_or_urgency: 'इसी सप्ताह के भीतर',
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

  // 3. Insurance Repudiation Demo
  if (
    lower.includes('repudiated') ||
    lower.includes('pre-existing disease') ||
    lower.includes('ped') ||
    lower.includes('co-payment') ||
    lower.includes('insurance_claim') ||
    lower.includes('claim')
  ) {
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
            action: 'बीमा कंपनी के शिकायत निवारण अधिकारी (Grievance Redressal Officer) को लिखित शिकायत भेजें।',
            deadline_or_urgency: 'पत्र मिलने के 30 दिनों के भीतर',
          },
          {
            step_number: 3,
            action: 'यदि 30 दिनों में कोई हल न निकले, तो निशुल्क न्याय के लिए सीधे बीमा लोकपाल (Insurance Ombudsman) के पास जाएं।',
            deadline_or_urgency: 'कानूनी अधिकार',
          },
        ],
        questions_to_ask: [
          'बीमा अधिकारी जी, आपने किस डॉक्टर के पर्चे या जांच के आधार पर इसे पहले से मौजूद बीमारी (PED) माना है?',
          'मेरी पॉलिसी की शुरुआत की सही तारीख क्या है और 36 महीने का इंतज़ार कब खत्म हो रहा है?',
          'आपकी शिकायत निवारण शाखा का ईमेल और आधिकारिक संदर्भ संख्या (Grievance Ref No.) क्या है?',
        ],
        watch_out_for: [
          {
            warning: 'बीमा कंपनी ने आपके दावे को आधिकारिक रूप से खारिज कर दिया है।',
            exact_quote: 'Claim repudiated',
            verified: true,
          },
          {
            warning: '36 महीने (3 वर्ष) का अनिवार्य वेटिंग पीरियड लागू होने की बात कही गई है।',
            exact_quote: 'waiting period of 36 months',
            verified: true,
          },
          {
            warning: 'आपकी पॉलिसी में 20% को-पेमेंट की शर्त है, यानी 20% बिल आपको खुद भरना होगा।',
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
        'The insurance company has officially denied (repudiated) your reimbursement claim. They state that the medical condition treated was a Pre-Existing Disease (PED), which under clause 4.1 carries a mandatory 36-month waiting period before coverage kicks in. Additionally, your policy carries a 20% co-payment rule, meaning you must pay 20% of admissible expenses out-of-pocket regardless. If this condition arose acutely after policy purchase, you have the statutory right to contest this repudiation through the insurer\'s grievance cell and the Insurance Ombudsman.',
      terms_explained: [
        {
          term: 'Claim Repudiated',
          phonetic: 'Claim Re-pude-e-ated',
          simple_meaning: 'Formal rejection of your claim liability by the insurer.',
          why_it_matters: 'The hospital invoice will not be reimbursed by the insurance company unless you formally appeal and overturn the decision.',
        },
        {
          term: 'Pre-Existing Disease (PED)',
          phonetic: 'Pre-Ex-ist-ing Di-sease',
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
