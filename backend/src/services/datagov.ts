import dotenv from 'dotenv';
import { dbQuery, inMemoryFallback, isPostgresActive } from '../db';
import { summarizePublicData, fetchLivePublicDataViaGemini, DataGovSummaryResult } from './gemini';

dotenv.config();

export interface CatalogItem {
  slug: string;
  resource_id: string;
  title_en: string;
  title_hi: string;
  filter_label_en: string;
  filter_label_hi: string;
  filter_key: string;
  filter_options: Array<{
    label_en: string;
    label_hi: string;
    value: string;
  }>;
}

export interface PublicDataResponse {
  catalog: CatalogItem;
  filter_value: string;
  rows: Record<string, any>[];
  summary: DataGovSummaryResult;
  source_badge: {
    source: string;
    is_live: boolean;
    timestamp: string;
    resource_id: string;
  };
}

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || '';
const REQUEST_TIMEOUT_MS = 6000; // Strict 6-second timeout for live demo responsiveness

// In-Memory Catalog Seeds as resilient fallback
const DEFAULT_CATALOG: Array<CatalogItem & { fallback_rows: Record<string, any>[] }> = [
  {
    slug: 'mandi-prices',
    resource_id: '9ef84268-d588-465a-a308-a864a43d0070',
    title_en: 'Daily Mandi Crop Prices',
    title_hi: 'दैनिक मंडी फसल भाव',
    filter_label_en: 'Select State',
    filter_label_hi: 'राज्य चुनें',
    filter_key: 'state',
    filter_options: [
      { label_en: 'Uttar Pradesh', label_hi: 'उत्तर प्रदेश', value: 'Uttar Pradesh' },
      { label_en: 'Punjab', label_hi: 'पंजाब', value: 'Punjab' },
      { label_en: 'Maharashtra', label_hi: 'महाराष्ट्र', value: 'Maharashtra' },
      { label_en: 'Madhya Pradesh', label_hi: 'मध्य प्रदेश', value: 'Madhya Pradesh' },
    ],
    fallback_rows: [
      {
        state: 'Uttar Pradesh',
        district: 'Meerut',
        market: 'Meerut Mandi',
        commodity: 'Wheat (गेहूं)',
        variety: 'Dara',
        arrival_date: 'Today',
        min_price: '₹2,275',
        max_price: '₹2,420',
        modal_price: '₹2,350',
        unit: 'per Quintal (100 kg)',
      },
      {
        state: 'Uttar Pradesh',
        district: 'Agra',
        market: 'Fatehabad Mandi',
        commodity: 'Potato (आलू)',
        variety: 'Deshi',
        arrival_date: 'Today',
        min_price: '₹1,150',
        max_price: '₹1,380',
        modal_price: '₹1,260',
        unit: 'per Quintal (100 kg)',
      },
      {
        state: 'Uttar Pradesh',
        district: 'Aligarh',
        market: 'Aligarh Mandi',
        commodity: 'Mustard (सरसों)',
        variety: 'Black Sarson',
        arrival_date: 'Today',
        min_price: '₹5,100',
        max_price: '₹5,450',
        modal_price: '₹5,300',
        unit: 'per Quintal (100 kg)',
      },
      {
        state: 'Punjab',
        district: 'Ludhiana',
        market: 'Khanna Mandi',
        commodity: 'Wheat (गेहूं)',
        variety: 'PBW-725',
        arrival_date: 'Today',
        min_price: '₹2,300',
        max_price: '₹2,475',
        modal_price: '₹2,410',
        unit: 'per Quintal (100 kg)',
      },
      {
        state: 'Maharashtra',
        district: 'Nashik',
        market: 'Lasalgaon Mandi',
        commodity: 'Onion (प्याज़)',
        variety: 'Red Onion',
        arrival_date: 'Today',
        min_price: '₹1,650',
        max_price: '₹2,450',
        modal_price: '₹2,100',
        unit: 'per Quintal (100 kg)',
      },
      {
        state: 'Maharashtra',
        district: 'Pune',
        market: 'Pune APMC',
        commodity: 'Tomato (टमाटर)',
        variety: 'Hybrid',
        arrival_date: 'Today',
        min_price: '₹1,200',
        max_price: '₹1,800',
        modal_price: '₹1,500',
        unit: 'per Quintal (100 kg)',
      },
      {
        state: 'Madhya Pradesh',
        district: 'Indore',
        market: 'Indore Mandi',
        commodity: 'Soyabean (सोयाबीन)',
        variety: 'Yellow',
        arrival_date: 'Today',
        min_price: '₹4,200',
        max_price: '₹4,650',
        modal_price: '₹4,450',
        unit: 'per Quintal (100 kg)',
      },
      {
        state: 'Madhya Pradesh',
        district: 'Morena',
        market: 'Morena Mandi',
        commodity: 'Mustard (सरसों)',
        variety: 'Desi',
        arrival_date: 'Today',
        min_price: '₹5,150',
        max_price: '₹5,520',
        modal_price: '₹5,380',
        unit: 'per Quintal (100 kg)',
      },
    ],
  },
  {
    slug: 'hospital-directory',
    resource_id: '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69',
    title_en: 'Public & PM-JAY Hospitals',
    title_hi: 'सरकारी व आयुष्मान भारत अस्पताल',
    filter_label_en: 'Select State',
    filter_label_hi: 'राज्य चुनें',
    filter_key: 'state',
    filter_options: [
      { label_en: 'Delhi', label_hi: 'दिल्ली', value: 'Delhi' },
      { label_en: 'Uttar Pradesh', label_hi: 'उत्तर प्रदेश', value: 'Uttar Pradesh' },
      { label_en: 'Maharashtra', label_hi: 'महाराष्ट्र', value: 'Maharashtra' },
      { label_en: 'Karnataka', label_hi: 'कर्नाटक', value: 'Karnataka' },
    ],
    fallback_rows: [
      {
        hospital_name: 'AIIMS (All India Institute of Medical Sciences)',
        state: 'Delhi',
        district: 'South Delhi',
        category: 'Apex Central Govt Hospital',
        ayushman_pmjay: 'Empanelled (Fully Free)',
        emergency_services: '24x7 Available',
        contact_number: '011-26588500',
        address: 'Ansari Nagar, Sri Aurobindo Marg, New Delhi 110029',
      },
      {
        hospital_name: 'Safdarjung Hospital',
        state: 'Delhi',
        district: 'New Delhi',
        category: 'Central Government Hospital',
        ayushman_pmjay: 'Empanelled (Fully Free)',
        emergency_services: '24x7 Available',
        contact_number: '011-26165060',
        address: 'Ring Road, Opposite AIIMS, New Delhi 110029',
      },
      {
        hospital_name: 'Dr. Ram Manohar Lohia (RML) Hospital',
        state: 'Delhi',
        district: 'Central Delhi',
        category: 'Central Government Hospital',
        ayushman_pmjay: 'Empanelled (Fully Free)',
        emergency_services: '24x7 Available',
        contact_number: '011-23365525',
        address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi 110001',
      },
      {
        hospital_name: 'King George Medical University (KGMU)',
        state: 'Uttar Pradesh',
        district: 'Lucknow',
        category: 'State Govt Medical College',
        ayushman_pmjay: 'Empanelled (Fully Free)',
        emergency_services: '24x7 Trauma Center',
        contact_number: '0522-2257540',
        address: 'Shah Mina Road, Chowk, Lucknow, UP 226003',
      },
      {
        hospital_name: 'MMG District Hospital',
        state: 'Uttar Pradesh',
        district: 'Ghaziabad',
        category: 'District Public Hospital',
        ayushman_pmjay: 'Empanelled (Fully Free)',
        emergency_services: '24x7 Available',
        contact_number: '0120-2824360',
        address: 'GT Road, Near Ghantaghar, Ghaziabad, UP 201001',
      },
      {
        hospital_name: 'KEM Hospital (King Edward Memorial)',
        state: 'Maharashtra',
        district: 'Mumbai City',
        category: 'Municipal Corporation Hospital',
        ayushman_pmjay: 'Empanelled (Fully Free)',
        emergency_services: '24x7 Available',
        contact_number: '022-24107000',
        address: 'Acharya Donde Marg, Parel, Mumbai, MH 400012',
      },
      {
        hospital_name: 'Victoria Hospital (BMCRI)',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        category: 'State Autonomous Hospital',
        ayushman_pmjay: 'Empanelled (Fully Free)',
        emergency_services: '24x7 Available',
        contact_number: '080-26701150',
        address: 'Fort Road, Near City Market, Bengaluru, KA 560002',
      },
      {
        hospital_name: 'Bowring & Lady Curzon Hospital',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        category: 'Govt Teaching Hospital',
        ayushman_pmjay: 'Empanelled (Fully Free)',
        emergency_services: '24x7 Available',
        contact_number: '080-25591362',
        address: 'Lady Curzon Road, Tasker Town, Shivajinagar, Bengaluru 560001',
      },
    ],
  },
  {
    slug: 'air-quality',
    resource_id: '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69-aqi',
    title_en: 'City Air Quality & Pollution (AQI)',
    title_hi: 'शहर वायु गुणवत्ता व प्रदूषण (AQI)',
    filter_label_en: 'Select City',
    filter_label_hi: 'शहर चुनें',
    filter_key: 'city',
    filter_options: [
      { label_en: 'Delhi', label_hi: 'दिल्ली', value: 'Delhi' },
      { label_en: 'Ghaziabad', label_hi: 'गाज़ियाबाद', value: 'Ghaziabad' },
      { label_en: 'Lucknow', label_hi: 'लखनऊ', value: 'Lucknow' },
      { label_en: 'Mumbai', label_hi: 'मुंबई', value: 'Mumbai' },
      { label_en: 'Bengaluru', label_hi: 'बेंगलुरु', value: 'Bengaluru' },
    ],
    fallback_rows: [
      {
        city: 'Delhi',
        station: 'Anand Vihar, Delhi',
        state: 'Delhi',
        aqi_index: '318',
        category: 'Very Poor (बहुत खराब)',
        prominent_pollutant: 'PM2.5',
        health_advice_en: 'Elderly citizens and people with asthma should stay indoors and wear an N95 mask outside.',
        health_advice_hi: 'बुजुर्गों और सांस के मरीजों को बाहर जाने से बचना चाहिए। बाहर निकलते समय मास्क अवश्य पहनें।',
      },
      {
        city: 'Delhi',
        station: 'Lodhi Road, Delhi',
        state: 'Delhi',
        aqi_index: '242',
        category: 'Poor (खराब)',
        prominent_pollutant: 'PM2.5',
        health_advice_en: 'Avoid early morning outdoor walks. Keep windows closed during rush hour traffic.',
        health_advice_hi: 'सुबह की सैर से बचें और सुबह-शाम खिड़कियां बंद रखें।',
      },
      {
        city: 'Ghaziabad',
        station: 'Vasundhara, Ghaziabad',
        state: 'Uttar Pradesh',
        aqi_index: '335',
        category: 'Very Poor (बहुत खराब)',
        prominent_pollutant: 'PM10 & PM2.5',
        health_advice_en: 'High dust and smoke levels. Elderly and children should avoid heavy physical exertion outdoors.',
        health_advice_hi: 'धूल और धुएं का स्तर अधिक है। बुजुर्ग और बच्चे बाहर खेलने या भारी काम से बचें।',
      },
      {
        city: 'Lucknow',
        station: 'Gomti Nagar, Lucknow',
        state: 'Uttar Pradesh',
        aqi_index: '184',
        category: 'Moderate (मध्यम)',
        prominent_pollutant: 'PM2.5',
        health_advice_en: 'Air quality is acceptable. People with chronic bronchitis should carry emergency inhalers.',
        health_advice_hi: 'हवा ठीक है, पर दमा या सांस के रोगी सावधानी रखें और दवा साथ रखें।',
      },
      {
        city: 'Mumbai',
        station: 'Bandra Kurla Complex, Mumbai',
        state: 'Maharashtra',
        aqi_index: '145',
        category: 'Moderate (मध्यम)',
        prominent_pollutant: 'PM10',
        health_advice_en: 'Mild haze. Safe for general public, but sensitive seniors may experience eye irritation.',
        health_advice_hi: 'सामान्य जनता के लिए सुरक्षित, लेकिन संवेदनशील बुजुर्गों की आंखों में हल्की जलन हो सकती है।',
      },
      {
        city: 'Mumbai',
        station: 'Colaba, Mumbai',
        state: 'Maharashtra',
        aqi_index: '92',
        category: 'Satisfactory (संतोषजनक)',
        prominent_pollutant: 'Ozone',
        health_advice_en: 'Pleasant coastal air quality. Clean and safe for morning walks and senior activities.',
        health_advice_hi: 'तटीय स्वच्छ हवा। सुबह की सैर और बुजुर्गों के लिए पूरी तरह सुरक्षित और उत्तम।',
      },
      {
        city: 'Bengaluru',
        station: 'Silk Board Junction, Bengaluru',
        state: 'Karnataka',
        aqi_index: '128',
        category: 'Moderate (मध्यम)',
        prominent_pollutant: 'NO2 & PM10',
        health_advice_en: 'Vehicle exhaust near the flyover. Wear cloth mask if waiting at traffic signals.',
        health_advice_hi: 'ट्रैफिक का धुआं अधिक है। जंक्शन पर खड़े होते समय रुमाल या मास्क का प्रयोग करें।',
      },
      {
        city: 'Bengaluru',
        station: 'BTM Layout, Bengaluru',
        state: 'Karnataka',
        aqi_index: '68',
        category: 'Good (अच्छा)',
        prominent_pollutant: 'PM2.5',
        health_advice_en: 'Fresh and green air quality. Perfect for outdoor exercises, walking, and yoga for seniors.',
        health_advice_hi: 'स्वच्छ और ताज़ी हवा। बुजुर्गों के योगा, टहलने और खुले में समय बिताने के लिए सबसे अच्छा।',
      },
    ],
  },
  {
    slug: 'competitive-exams',
    resource_id: 'upsc-nta-exam-portal',
    title_en: 'Competitive Exams & Education',
    title_hi: 'प्रतियोगी परीक्षाएं व उच्च शिक्षा',
    filter_label_en: 'Select Exam Stream / Category',
    filter_label_hi: 'परीक्षा श्रेणी चुनें',
    filter_key: 'category',
    filter_options: [
      { label_en: 'All Top Competitive Exams', label_hi: 'सभी प्रमुख प्रतियोगी परीक्षाएं', value: 'All' },
      { label_en: 'Civil Services & Govt (UPSC, SSC, State PSC)', label_hi: 'सिविल सेवा व सरकारी (UPSC, SSC)', value: 'Civil Services & Govt' },
      { label_en: 'Engineering & Technology (JEE, GATE)', label_hi: 'इंजीनियरिंग व तकनीकी (JEE, GATE)', value: 'Engineering & Technology' },
      { label_en: 'Medical & Healthcare (NEET UG/PG)', label_hi: 'मेडिकल व स्वास्थ्य (NEET UG/PG)', value: 'Medical & Healthcare' },
      { label_en: 'Banking & Insurance (IBPS, SBI PO)', label_hi: 'बैंकिंग व बीमा (IBPS, SBI PO)', value: 'Banking & Insurance' },
      { label_en: 'Defence & Armed Forces (NDA, CDS, AFCAT)', label_hi: 'रक्षा व सैन्य सेवाएं (NDA, CDS)', value: 'Defence & Armed Forces' },
      { label_en: 'University & Teaching (CUET, UGC NET)', label_hi: 'विश्वविद्यालय प्रवेश व शिक्षण (CUET, NET)', value: 'University & Teaching' },
    ],
    fallback_rows: [
      {
        exam_name: 'UPSC Civil Services Examination (CSE)',
        conducting_body: 'Union Public Service Commission (UPSC)',
        target_posts: 'IAS, IPS, IFS, IRS, Central Group A & B Civil Services',
        eligibility: "Bachelor's degree in any discipline; Age: 21 to 32 years (Relaxations: OBC +3 yrs, SC/ST +5 yrs)",
        exam_stages: 'Stage 1: Prelims (Objective MCQs) ➔ Stage 2: Mains (9 Written Papers) ➔ Stage 3: Personality Interview',
        key_timelines_2026: 'Notification: Feb 2026 | Prelims Exam: May 2026 | Mains Exam: Sept 2026',
        official_portal: 'https://upsc.gov.in',
        senior_family_tip: 'Previous year papers and official answer keys are available completely free on upsc.gov.in. Watch out for unauthorized third-party coaching websites charging high verification fees.',
      },
      {
        exam_name: 'SSC Combined Graduate Level (SSC CGL)',
        conducting_body: 'Staff Selection Commission (SSC)',
        target_posts: 'Assistant Section Officer (ASO), Income Tax Inspector, Central Excise Inspector, Auditor',
        eligibility: "Bachelor's degree in any stream; Age: 18 to 32 years depending on post",
        exam_stages: 'Tier 1 (Computer Based Test) ➔ Tier 2 (CBT + Typing / Data Entry Speed Test)',
        key_timelines_2026: 'Notification: June 2026 | Tier 1 Exam: Sept–Oct 2026',
        official_portal: 'https://ssc.gov.in',
        senior_family_tip: 'Ensure the candidate registers strictly through the new ssc.gov.in one-time registration (OTR) portal. Adhaar verification speeds up candidate clearance.',
      },
      {
        exam_name: 'JEE Main & JEE Advanced',
        conducting_body: 'National Testing Agency (NTA) & IITs',
        target_posts: 'B.Tech / B.E. admissions at IITs, NITs, IIITs, and Centrally Funded Technical Institutions',
        eligibility: '10+2 with Physics, Mathematics & Chemistry; minimum 75% aggregate marks for IIT/NIT admissions',
        exam_stages: 'Session 1 (Jan) & Session 2 (April) CBT ➔ Top 2.5 Lakh qualifiers write JEE Advanced (May)',
        key_timelines_2026: 'Session 1: Jan 2026 | Session 2: April 2026 | JEE Advanced: May 2026',
        official_portal: 'https://jeemain.nta.nic.in',
        senior_family_tip: 'NTA provides official computer-based practice test centers across district centers free of charge for students without home computers.',
      },
      {
        exam_name: 'NEET-UG (National Eligibility cum Entrance Test)',
        conducting_body: 'National Testing Agency (NTA)',
        target_posts: 'MBBS, BDS, BAMS, BHMS & Medical College admissions nationwide',
        eligibility: '10+2 with Physics, Chemistry, Biology/Biotechnology; minimum age 17 years by Dec 31st',
        exam_stages: 'Single Pen-and-Paper (OMR) Exam with 200 Questions (Physics, Chemistry, Botany, Zoology)',
        key_timelines_2026: 'Notification: Feb 2026 | Pen-and-Paper Exam: First Sunday of May 2026',
        official_portal: 'https://exams.nta.ac.in/NEET',
        senior_family_tip: 'Government Medical College seats have strictly regulated government fee structures. PM-JAY and state scholarship schemes assist students from economically weaker families.',
      },
      {
        exam_name: 'IBPS PO (Probationary Officer)',
        conducting_body: 'Institute of Banking Personnel Selection (IBPS)',
        target_posts: 'Probationary Officer (Scale I) in 11 Public Sector Banks (PNB, BoB, Canara, etc.)',
        eligibility: "Bachelor's degree in any discipline; Age: 20 to 30 years",
        exam_stages: 'Preliminary Online Exam ➔ Main Examination ➔ Common Interview',
        key_timelines_2026: 'Notification: Aug 2026 | Prelims: Oct 2026 | Mains: Nov 2026',
        official_portal: 'https://ibps.in',
        senior_family_tip: 'Public sector bank exams have zero interview bias at Preliminary stage and offer extensive pre-exam training for SC/ST and minority community candidates.',
      },
    ],
  },
];

/**
 * Retrieves the available catalog topics for the frontend cards
 */
export async function getCatalogList(): Promise<CatalogItem[]> {
  if (isPostgresActive()) {
    try {
      const res = await dbQuery<CatalogItem>(
        'SELECT slug, resource_id, title_en, title_hi, filter_label_en, filter_label_hi, filter_key, filter_options FROM datagov_catalog;'
      );
      if (res.rows.length > 0) {
        return res.rows;
      }
    } catch {}
  }

  return DEFAULT_CATALOG.map(({ fallback_rows, ...rest }) => rest);
}

/**
 * Queries official data.gov.in API with strict 6s timeout, response caching,
 * and automatic fallback to verified seed rows.
 */
export async function queryPublicData(
  slug: string,
  filterValue: string,
  lang: 'en' | 'hi' = 'en'
): Promise<PublicDataResponse> {
  // Find catalog item
  let catalogItem: (CatalogItem & { fallback_rows: Record<string, any>[] }) | undefined;

  if (isPostgresActive()) {
    try {
      const res = await dbQuery(
        'SELECT slug, resource_id, title_en, title_hi, filter_label_en, filter_label_hi, filter_key, filter_options, fallback_rows FROM datagov_catalog WHERE slug = $1 LIMIT 1;',
        [slug]
      );
      if (res.rows.length > 0) {
        catalogItem = res.rows[0];
      }
    } catch {}
  }

  if (!catalogItem) {
    catalogItem = DEFAULT_CATALOG.find((c) => c.slug === slug) || DEFAULT_CATALOG[0];
  }

  const { filter_key, resource_id, title_en, fallback_rows } = catalogItem;
  const cacheKey = `datagov:${slug}:${filterValue.toLowerCase().trim()}`;

  // 1. Check Cache first (6-hour TTL)
  if (isPostgresActive()) {
    try {
      const cached = await dbQuery(
        'SELECT payload FROM api_cache WHERE cache_key = $1 AND expires_at > CURRENT_TIMESTAMP LIMIT 1;',
        [cacheKey]
      );
      if (cached.rows.length > 0) {
        const payload: PublicDataResponse = cached.rows[0].payload;
        // Generate summary in chosen language
        payload.summary = await summarizePublicData(title_en, filterValue, payload.rows, lang);
        return payload;
      }
    } catch {}
  } else {
    const mem = inMemoryFallback.api_cache.get(cacheKey);
    if (mem && mem.expires_at > new Date()) {
      const payload: PublicDataResponse = mem.payload;
      payload.summary = await summarizePublicData(title_en, filterValue, payload.rows, lang);
      return payload;
    }
  }

  // 2. Attempt Live data.gov.in API call if key is present
  let liveRows: Record<string, any>[] | null = null;
  let isLive = false;
  let liveSummary: DataGovSummaryResult | null = null;
  let liveSource = 'Open Government Data Platform India (data.gov.in)';

  if (DATA_GOV_API_KEY && !resource_id.includes('aqi') && slug !== 'competitive-exams') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const url = `https://api.data.gov.in/resource/${resource_id}?api-key=${DATA_GOV_API_KEY}&format=json&limit=10&filters[${filter_key}]=${encodeURIComponent(
        filterValue
      )}`;

      // Safe logging without leaking api-key
      console.log(`[Setu DataGov] Requesting resource: ${resource_id} with filter [${filter_key}=${filterValue}]`);

      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (resp.ok) {
        const data: any = await resp.json();
        if (data?.records && Array.isArray(data.records) && data.records.length > 0) {
          liveRows = data.records;
          isLive = true;
          console.log(`✅ [Setu DataGov] Live records received (${liveRows?.length} rows)`);
        }
      }
    } catch (err: any) {
      clearTimeout(timeout);
      console.warn(`⚠️ [Setu DataGov] Live fetch failed or timed out (${err.message}). Using verified fallback rows.`);
    }
  }

  // 3. If no live data.gov.in rows, fetch online structured data using Gemini 3.8 Flash!
  if (!liveRows || liveRows.length === 0) {
    try {
      const geminiLive = await fetchLivePublicDataViaGemini(slug, filterValue, lang);
      if (geminiLive && geminiLive.rows && geminiLive.rows.length > 0) {
        liveRows = geminiLive.rows;
        isLive = true;
        liveSummary = geminiLive.summary;
        liveSource = geminiLive.source;
        console.log(`✅ [Setu Gemini Live Data] Online records generated (${liveRows.length} rows) for [${slug}:${filterValue}]`);
      }
    } catch (err: any) {
      console.warn(`[Setu Gemini Live Data] Fallback: ${err.message}`);
    }
  }

  // 4. Fallback to verified local rows if live fetch fails or is offline
  let rowsToReturn: Record<string, any>[] = [];

  if (liveRows && liveRows.length > 0) {
    rowsToReturn = liveRows;
  } else {
    // Filter fallback rows by value
    const valLower = filterValue.toLowerCase().trim();
    rowsToReturn = fallback_rows.filter((row: Record<string, any>) => {
      const fieldVal = String(row[filter_key] || '').toLowerCase();
      return fieldVal.includes(valLower) || valLower.includes(fieldVal);
    });

    if (rowsToReturn.length === 0) {
      // If no exact match, return all fallback rows for this topic
      rowsToReturn = fallback_rows.slice(0, 6);
    }
  }

  // 5. Generate plain-language summary via Gemini if not provided by live generation
  const summary = liveSummary || (await summarizePublicData(title_en, filterValue, rowsToReturn, lang));

  const responsePayload: PublicDataResponse = {
    catalog: {
      slug: catalogItem.slug,
      resource_id: catalogItem.resource_id,
      title_en: catalogItem.title_en,
      title_hi: catalogItem.title_hi,
      filter_label_en: catalogItem.filter_label_en,
      filter_label_hi: catalogItem.filter_label_hi,
      filter_key: catalogItem.filter_key,
      filter_options: catalogItem.filter_options,
    },
    filter_value: filterValue,
    rows: rowsToReturn,
    summary,
    source_badge: {
      source: liveSource,
      is_live: isLive,
      timestamp: new Date().toISOString(),
      resource_id: catalogItem.resource_id,
    },
  };

  // 5. Cache response for 6 hours
  const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
  if (isPostgresActive()) {
    try {
      await dbQuery(
        `INSERT INTO api_cache (cache_key, payload, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (cache_key)
         DO UPDATE SET payload = EXCLUDED.payload, expires_at = EXCLUDED.expires_at;`,
        [cacheKey, JSON.stringify(responsePayload), expiresAt]
      );
    } catch {}
  } else {
    inMemoryFallback.api_cache.set(cacheKey, { payload: responsePayload, expires_at: expiresAt });
  }

  return responsePayload;
}
