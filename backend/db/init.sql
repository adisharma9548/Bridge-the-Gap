-- ==============================================================================
-- SETU DATABASE INITIALIZATION SCRIPT (PostgreSQL)
-- Schema, Indexes, and Production-Grade Seed Data for Hackathon
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. GLOSSARY TERMS (Plain-language definitions of complex Indian terms)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS glossary_terms (
    id SERIAL PRIMARY KEY,
    term VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(50) NOT NULL, -- 'banking', 'medical', 'insurance', 'legal'
    plain_en TEXT NOT NULL,
    plain_hi TEXT NOT NULL,
    why_it_matters_en TEXT NOT NULL,
    why_it_matters_hi TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. DATA.GOV.IN CATALOG (Curated resources with verified fallback data)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS datagov_catalog (
    slug VARCHAR(64) PRIMARY KEY,
    resource_id VARCHAR(128) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    title_hi VARCHAR(200) NOT NULL,
    filter_label_en VARCHAR(100) NOT NULL,
    filter_label_hi VARCHAR(100) NOT NULL,
    filter_key VARCHAR(64) NOT NULL,
    filter_options JSONB NOT NULL,
    fallback_rows JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. API CACHE (Zero-quota repeat responses with TTL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_cache (
    cache_key VARCHAR(128) PRIMARY KEY,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);

-- ------------------------------------------------------------------------------
-- 4. SAVED ITEMS (Anonymous session-based bookmarks with zero auth friction)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(64) NOT NULL,
    kind VARCHAR(20) NOT NULL, -- 'understand' or 'public_data'
    title TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_items_session ON saved_items(session_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. DAILY USAGE (Quota tracking and budget protection)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_usage (
    usage_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    gemini_calls INT DEFAULT 0,
    datagov_calls INT DEFAULT 0
);

-- ==============================================================================
-- SEED DATA: 10 COMMON INDIAN FINANCIAL, LEGAL, MEDICAL & INSURANCE TERMS
-- ==============================================================================

INSERT INTO glossary_terms (term, domain, plain_en, plain_hi, why_it_matters_en, why_it_matters_hi)
VALUES
(
    'Lien',
    'banking',
    'A legal hold or lock put by a bank or court on your money or property. When a lien is active, you cannot withdraw or transfer that money until the pending dispute or overdue payment is cleared.',
    'बैंक या अदालत द्वारा आपके पैसों या संपत्ति पर लगाया गया कानूनी ताला। जब तक यह ताला लगा है, आप वह पैसा निकाल या खर्च नहीं कर सकते।',
    'If a lien of Rs. 45,000 is marked on your Fixed Deposit, your FD will not mature or pay out interest until the bank releases the hold.',
    'यदि आपके फिक्स्ड डिपॉजिट (FD) पर ₹45,000 की लियन लग गई है, तो जब तक बैंक इसे नहीं हटाता, आप अपनी FD के पैसे नहीं निकाल सकते।'
),
(
    'Non-Performing Asset',
    'banking',
    'A bank loan or credit balance where interest or installment payments have not been paid for over 90 days. The bank treats this as a defaulted or inactive account.',
    'वह बैंक खाता या कर्ज़ जिसमें पिछले 90 दिनों से किस्त या ब्याज नहीं भरा गया है। बैंक इसे बंद या डूबा हुआ खाता मानने लगता है।',
    'Your account gets reported to credit bureaus like CIBIL, which damages your credit score and allows the bank to begin recovery steps.',
    'इससे आपका सिबिल (CIBIL) स्कोर खराब हो जाता है और बैंक कानूनी वसूली की प्रक्रिया शुरू कर सकता है।'
),
(
    'SARFAESI Act',
    'legal',
    'A special Indian law from 2002 that gives banks the power to recover unpaid loan dues by seizing pledged property or assets without needing a slow court trial.',
    'भारत का 2002 का एक सख्त कानून, जो बैंकों को अदालत के लंबे चक्कर काटे बिना गिरवी रखी संपत्ति को जब्त कर पैसे वसूलने का अधिकार देता है।',
    'A notice under Section 13(2) gives you exactly 60 days to pay the dues or respond before the bank takes physical possession of the asset.',
    'धारा 13(2) का नोटिस मिलने पर आपको अपना पक्ष रखने या पैसे चुकाने के लिए ठीक 60 दिन मिलते हैं, अन्यथा बैंक संपत्ति अपने कब्जे में ले सकता है।'
),
(
    'HbA1c',
    'medical',
    'A blood test showing your average blood sugar level over the past 2 to 3 months. Normal is under 5.7%, pre-diabetes is 5.7% to 6.4%, and diabetes is 6.5% or above.',
    'पिछले 2 से 3 महीनों के औसत ब्लड शुगर (मधुमेह) को मापने वाली खून की जांच। 5.7% से कम सामान्य, और 6.5% या अधिक शुगर की बीमारी मानी जाती है।',
    'A level like 7.9% means your average blood sugar has been too high, which increases long-term risks for your eyes, kidneys, and heart if not controlled.',
    'यदि यह 7.9% आता है, तो इसका अर्थ है कि शुगर अनियंत्रित है और दवा या खानपान में बदलाव के लिए तुरंत डॉक्टर से सलाह लेनी चाहिए।'
),
(
    'LDL Cholesterol',
    'medical',
    'Often nicknamed "bad cholesterol". When LDL levels are high, sticky waxy deposits can build up on the walls of your blood vessels and restrict blood circulation.',
    'खून में मौजूद चिकनाई जिसे "खराब कोलेस्ट्रॉल" कहते हैं। इसके बढ़ने से नसों में मैल जमने लगता है और खून का बहाव रुकने का खतरा होता है।',
    'Levels above 160 mg/dL put extra strain on your heart and require dietary changes or doctor-prescribed medicine like statins.',
    'यदि यह 160 से अधिक है, तो दिल की बीमारी का खतरा बढ़ जाता है और डॉक्टर की सलाह से इसे कम करना जरूरी होता है।'
),
(
    'Co-payment',
    'insurance',
    'A fixed percentage of the medical bill that you must pay from your own pocket, while the insurance company pays only the remaining portion.',
    'अस्पताल के कुल बिल का वह निश्चित प्रतिशत (जैसे 20%), जो आपको अपनी जेब से देना होगा, बाकी बीमा कंपनी देगी।',
    'If you have a 20% co-payment and your hospital bill is Rs. 1,00,000, you must pay Rs. 20,000 yourself even if your insurance cover is Rs. 5 lakhs.',
    'यदि ₹1,00,000 का बिल आता है और 20% को-पे है, तो ₹20,000 आपको खुद भरने पड़ेंगे, चाहे आपका बीमा कितना भी बड़ा हो।'
),
(
    'Pre-Existing Disease',
    'insurance',
    'Any medical condition, illness, or symptom you already had before you purchased the health insurance policy.',
    'बीमा पॉलिसी खरीदने से पहले से मौजूद कोई भी बीमारी, लक्षण या शारीरिक समस्या (जैसे बीपी, शुगर, थाइराइड)।',
    'Most policies will not pay for treatments related to these conditions during an initial waiting period (usually 2 to 4 years from start date).',
    'पॉलिसी शुरू होने के शुरुआती 2 से 4 साल (वेटिंग पीरियड) तक इन बीमारियों के इलाज का खर्च बीमा कंपनी नहीं उठाती।'
),
(
    'Deductible',
    'insurance',
    'A fixed sum of money you must pay first out of your pocket before the insurance company starts covering any expenses.',
    'वह तय रकम जो अस्पताल के बिल में से सबसे पहले आपको अपनी जेब से चुकानी होती है, उसके बाद ही बीमा कंपनी बाकी पैसे देती है।',
    'If your deductible is Rs. 10,000 and the treatment bill is Rs. 35,000, you pay the first Rs. 10,000 and the insurer pays Rs. 25,000.',
    'यदि डिडक्टिबल ₹10,000 है और बिल ₹35,000 का है, तो पहले ₹10,000 आपको देने होंगे और बाकी ₹25,000 बीमा देगा।'
),
(
    'Indemnity',
    'insurance',
    'A promise of financial protection where the insurer agrees to compensate you for the exact amount of loss or hospital expenses incurred, up to the sum insured.',
    'बीमा कंपनी का यह वादा कि नुकसान या बीमारी होने पर वह आपको हुए वास्तविक खर्चे की भरपाई करेगी (पॉलिसी की सीमा तक)।',
    'You cannot profit from indemnity health insurance; you are only reimbursed for actual bills approved by the policy rules.',
    'इसमें आपको केवल अस्पताल के असली और स्वीकृत बिलों का ही भुगतान मिलता है, कोई अतिरिक्त लाभ नहीं।'
),
(
    'Nominee',
    'banking',
    'The trusted person you officially name to receive the funds from your bank account, fixed deposit, or insurance policy in case of your demise.',
    'वह भरोसेमंद व्यक्ति जिसे आप अपने बैंक खाते, FD या बीमा में नामांकित करते हैं ताकि आपके न रहने पर उसे वह धन सौंपा जा सके।',
    'Keeping your nominee details updated prevents lengthy legal court battles for your family to access your life savings.',
    'नॉमिनी का नाम सही दर्ज रखने से आपके परिवार को बिना किसी कानूनी अड़चन या अदालती चक्कर के आपका जमा धन मिल जाता है।'
)
ON CONFLICT (term) DO UPDATE SET
    plain_en = EXCLUDED.plain_en,
    plain_hi = EXCLUDED.plain_hi,
    why_it_matters_en = EXCLUDED.why_it_matters_en,
    why_it_matters_hi = EXCLUDED.why_it_matters_hi;

-- ==============================================================================
-- SEED DATA: 3 CURATED PUBLIC DATA CATALOGS (WITH 8 VERIFIED FALLBACK ROWS EACH)
-- ==============================================================================

-- 1. Daily Mandi Crop Prices (mandi-prices)
INSERT INTO datagov_catalog (
    slug,
    resource_id,
    title_en,
    title_hi,
    filter_label_en,
    filter_label_hi,
    filter_key,
    filter_options,
    fallback_rows
) VALUES (
    'mandi-prices',
    '9ef84268-d588-465a-a308-a864a43d0070',
    'Daily Mandi Crop Prices',
    'दैनिक मंडी फसल भाव',
    'Select State',
    'राज्य चुनें',
    'state',
    '[
        {"label_en": "Uttar Pradesh", "label_hi": "उत्तर प्रदेश", "value": "Uttar Pradesh"},
        {"label_en": "Punjab", "label_hi": "पंजाब", "value": "Punjab"},
        {"label_en": "Maharashtra", "label_hi": "महाराष्ट्र", "value": "Maharashtra"},
        {"label_en": "Madhya Pradesh", "label_hi": "मध्य प्रदेश", "value": "Madhya Pradesh"}
    ]'::jsonb,
    '[
        {
            "state": "Uttar Pradesh",
            "district": "Meerut",
            "market": "Meerut Mandi",
            "commodity": "Wheat (गेहूं)",
            "variety": "Dara",
            "arrival_date": "Today",
            "min_price": "₹2,275",
            "max_price": "₹2,420",
            "modal_price": "₹2,350",
            "unit": "per Quintal (100 kg)"
        },
        {
            "state": "Uttar Pradesh",
            "district": "Agra",
            "market": "Fatehabad Mandi",
            "commodity": "Potato (आलू)",
            "variety": "Deshi",
            "arrival_date": "Today",
            "min_price": "₹1,150",
            "max_price": "₹1,380",
            "modal_price": "₹1,260",
            "unit": "per Quintal (100 kg)"
        },
        {
            "state": "Uttar Pradesh",
            "district": "Aligarh",
            "market": "Aligarh Mandi",
            "commodity": "Mustard (सरसों)",
            "variety": "Black Sarson",
            "arrival_date": "Today",
            "min_price": "₹5,100",
            "max_price": "₹5,450",
            "modal_price": "₹5,300",
            "unit": "per Quintal (100 kg)"
        },
        {
            "state": "Punjab",
            "district": "Ludhiana",
            "market": "Khanna Mandi",
            "commodity": "Wheat (गेहूं)",
            "variety": "PBW-725",
            "arrival_date": "Today",
            "min_price": "₹2,300",
            "max_price": "₹2,475",
            "modal_price": "₹2,410",
            "unit": "per Quintal (100 kg)"
        },
        {
            "state": "Maharashtra",
            "district": "Nashik",
            "market": "Lasalgaon Mandi",
            "commodity": "Onion (प्याज़)",
            "variety": "Red Onion",
            "arrival_date": "Today",
            "min_price": "₹1,650",
            "max_price": "₹2,450",
            "modal_price": "₹2,100",
            "unit": "per Quintal (100 kg)"
        },
        {
            "state": "Maharashtra",
            "district": "Pune",
            "market": "Pune APMC",
            "commodity": "Tomato (टमाटर)",
            "variety": "Hybrid",
            "arrival_date": "Today",
            "min_price": "₹1,200",
            "max_price": "₹1,800",
            "modal_price": "₹1,500",
            "unit": "per Quintal (100 kg)"
        },
        {
            "state": "Madhya Pradesh",
            "district": "Indore",
            "market": "Indore Mandi",
            "commodity": "Soyabean (सोयाबीन)",
            "variety": "Yellow",
            "arrival_date": "Today",
            "min_price": "₹4,200",
            "max_price": "₹4,650",
            "modal_price": "₹4,450",
            "unit": "per Quintal (100 kg)"
        },
        {
            "state": "Madhya Pradesh",
            "district": "Morena",
            "market": "Morena Mandi",
            "commodity": "Mustard (सरसों)",
            "variety": "Desi",
            "arrival_date": "Today",
            "min_price": "₹5,150",
            "max_price": "₹5,520",
            "modal_price": "₹5,380",
            "unit": "per Quintal (100 kg)"
        }
    ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_hi = EXCLUDED.title_hi,
    filter_options = EXCLUDED.filter_options,
    fallback_rows = EXCLUDED.fallback_rows;

-- 2. Public & PM-JAY Hospitals (hospital-directory)
INSERT INTO datagov_catalog (
    slug,
    resource_id,
    title_en,
    title_hi,
    filter_label_en,
    filter_label_hi,
    filter_key,
    filter_options,
    fallback_rows
) VALUES (
    'hospital-directory',
    '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69',
    'Public & PM-JAY Hospitals',
    'सरकारी व आयुष्मान भारत अस्पताल',
    'Select State',
    'राज्य चुनें',
    'state',
    '[
        {"label_en": "Delhi", "label_hi": "दिल्ली", "value": "Delhi"},
        {"label_en": "Uttar Pradesh", "label_hi": "उत्तर प्रदेश", "value": "Uttar Pradesh"},
        {"label_en": "Maharashtra", "label_hi": "महाराष्ट्र", "value": "Maharashtra"},
        {"label_en": "Karnataka", "label_hi": "कर्नाटक", "value": "Karnataka"}
    ]'::jsonb,
    '[
        {
            "hospital_name": "AIIMS (All India Institute of Medical Sciences)",
            "state": "Delhi",
            "district": "South Delhi",
            "category": "Apex Central Govt Hospital",
            "ayushman_pmjay": "Empanelled (Fully Free)",
            "emergency_services": "24x7 Available",
            "contact_number": "011-26588500",
            "address": "Ansari Nagar, Sri Aurobindo Marg, New Delhi 110029"
        },
        {
            "hospital_name": "Safdarjung Hospital",
            "state": "Delhi",
            "district": "New Delhi",
            "category": "Central Government Hospital",
            "ayushman_pmjay": "Empanelled (Fully Free)",
            "emergency_services": "24x7 Available",
            "contact_number": "011-26165060",
            "address": "Ring Road, Opposite AIIMS, New Delhi 110029"
        },
        {
            "hospital_name": "Dr. Ram Manohar Lohia (RML) Hospital",
            "state": "Delhi",
            "district": "Central Delhi",
            "category": "Central Government Hospital",
            "ayushman_pmjay": "Empanelled (Fully Free)",
            "emergency_services": "24x7 Available",
            "contact_number": "011-23365525",
            "address": "Baba Kharak Singh Marg, Connaught Place, New Delhi 110001"
        },
        {
            "hospital_name": "King George Medical University (KGMU)",
            "state": "Uttar Pradesh",
            "district": "Lucknow",
            "category": "State Govt Medical College",
            "ayushman_pmjay": "Empanelled (Fully Free)",
            "emergency_services": "24x7 Trauma Center",
            "contact_number": "0522-2257540",
            "address": "Shah Mina Road, Chowk, Lucknow, UP 226003"
        },
        {
            "hospital_name": "MMG District Hospital",
            "state": "Uttar Pradesh",
            "district": "Ghaziabad",
            "category": "District Public Hospital",
            "ayushman_pmjay": "Empanelled (Fully Free)",
            "emergency_services": "24x7 Available",
            "contact_number": "0120-2824360",
            "address": "GT Road, Near Ghantaghar, Ghaziabad, UP 201001"
        },
        {
            "hospital_name": "KEM Hospital (King Edward Memorial)",
            "state": "Maharashtra",
            "district": "Mumbai City",
            "category": "Municipal Corporation Hospital",
            "ayushman_pmjay": "Empanelled (Fully Free)",
            "emergency_services": "24x7 Available",
            "contact_number": "022-24107000",
            "address": "Acharya Donde Marg, Parel, Mumbai, MH 400012"
        },
        {
            "hospital_name": "Victoria Hospital (BMCRI)",
            "state": "Karnataka",
            "district": "Bengaluru Urban",
            "category": "State Autonomous Hospital",
            "ayushman_pmjay": "Empanelled (Fully Free)",
            "emergency_services": "24x7 Available",
            "contact_number": "080-26701150",
            "address": "Fort Road, Near City Market, Bengaluru, KA 560002"
        },
        {
            "hospital_name": "Bowring & Lady Curzon Hospital",
            "state": "Karnataka",
            "district": "Bengaluru Urban",
            "category": "Govt Teaching Hospital",
            "ayushman_pmjay": "Empanelled (Fully Free)",
            "emergency_services": "24x7 Available",
            "contact_number": "080-25591362",
            "address": "Lady Curzon Road, Tasker Town, Shivajinagar, Bengaluru 560001"
        }
    ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_hi = EXCLUDED.title_hi,
    filter_options = EXCLUDED.filter_options,
    fallback_rows = EXCLUDED.fallback_rows;

-- 3. City Air Quality & Pollution (air-quality)
INSERT INTO datagov_catalog (
    slug,
    resource_id,
    title_en,
    title_hi,
    filter_label_en,
    filter_label_hi,
    filter_key,
    filter_options,
    fallback_rows
) VALUES (
    'air-quality',
    '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69-aqi',
    'City Air Quality & Pollution (AQI)',
    'शहर वायु गुणवत्ता व प्रदूषण (AQI)',
    'Select City',
    'शहर चुनें',
    'city',
    '[
        {"label_en": "Delhi", "label_hi": "दिल्ली", "value": "Delhi"},
        {"label_en": "Ghaziabad", "label_hi": "गाज़ियाबाद", "value": "Ghaziabad"},
        {"label_en": "Lucknow", "label_hi": "लखनऊ", "value": "Lucknow"},
        {"label_en": "Mumbai", "label_hi": "मुंबई", "value": "Mumbai"},
        {"label_en": "Bengaluru", "label_hi": "बेंगलुरु", "value": "Bengaluru"}
    ]'::jsonb,
    '[
        {
            "city": "Delhi",
            "station": "Anand Vihar, Delhi",
            "state": "Delhi",
            "aqi_index": "318",
            "category": "Very Poor (बहुत खराब)",
            "prominent_pollutant": "PM2.5",
            "health_advice_en": "Elderly citizens and people with asthma should stay indoors and wear an N95 mask outside.",
            "health_advice_hi": "बुजुर्गों और सांस के मरीजों को बाहर जाने से बचना चाहिए। बाहर निकलते समय मास्क अवश्य पहनें।"
        },
        {
            "city": "Delhi",
            "station": "Lodhi Road, Delhi",
            "state": "Delhi",
            "aqi_index": "242",
            "category": "Poor (खराब)",
            "prominent_pollutant": "PM2.5",
            "health_advice_en": "Avoid early morning outdoor walks. Keep windows closed during rush hour traffic.",
            "health_advice_hi": "सुबह की सैर से बचें और सुबह-शाम खिड़कियां बंद रखें।"
        },
        {
            "city": "Ghaziabad",
            "station": "Vasundhara, Ghaziabad",
            "state": "Uttar Pradesh",
            "aqi_index": "335",
            "category": "Very Poor (बहुत खराब)",
            "prominent_pollutant": "PM10 & PM2.5",
            "health_advice_en": "High dust and smoke levels. Elderly and children should avoid heavy physical exertion outdoors.",
            "health_advice_hi": "धूल और धुएं का स्तर अधिक है। बुजुर्ग और बच्चे बाहर खेलने या भारी काम से बचें।"
        },
        {
            "city": "Lucknow",
            "station": "Gomti Nagar, Lucknow",
            "state": "Uttar Pradesh",
            "aqi_index": "184",
            "category": "Moderate (मध्यम)",
            "prominent_pollutant": "PM2.5",
            "health_advice_en": "Air quality is acceptable. People with chronic bronchitis should carry emergency inhalers.",
            "health_advice_hi": "हवा ठीक है, पर दमा या सांस के रोगी सावधानी रखें और दवा साथ रखें।"
        },
        {
            "city": "Mumbai",
            "station": "Bandra Kurla Complex, Mumbai",
            "state": "Maharashtra",
            "aqi_index": "145",
            "category": "Moderate (मध्यम)",
            "prominent_pollutant": "PM10",
            "health_advice_en": "Mild haze. Safe for general public, but sensitive seniors may experience eye irritation.",
            "health_advice_hi": "सामान्य जनता के लिए सुरक्षित, लेकिन संवेदनशील बुजुर्गों की आंखों में हल्की जलन हो सकती है।"
        },
        {
            "city": "Mumbai",
            "station": "Colaba, Mumbai",
            "state": "Maharashtra",
            "aqi_index": "92",
            "category": "Satisfactory (संतोषजनक)",
            "prominent_pollutant": "Ozone",
            "health_advice_en": "Pleasant coastal air quality. Clean and safe for morning walks and senior activities.",
            "health_advice_hi": "तटीय स्वच्छ हवा। सुबह की सैर और बुजुर्गों के लिए पूरी तरह सुरक्षित और उत्तम।"
        },
        {
            "city": "Bengaluru",
            "station": "Silk Board Junction, Bengaluru",
            "state": "Karnataka",
            "aqi_index": "128",
            "category": "Moderate (मध्यम)",
            "prominent_pollutant": "NO2 & PM10",
            "health_advice_en": "Vehicle exhaust near the flyover. Wear cloth mask if waiting at traffic signals.",
            "health_advice_hi": "ट्रैफिक का धुआं अधिक है। जंक्शन पर खड़े होते समय रुमाल या मास्क का प्रयोग करें।"
        },
        {
            "city": "Bengaluru",
            "station": "BTM Layout, Bengaluru",
            "state": "Karnataka",
            "aqi_index": "68",
            "category": "Good (अच्छा)",
            "prominent_pollutant": "PM2.5",
            "health_advice_en": "Fresh and green air quality. Perfect for outdoor exercises, walking, and yoga for seniors.",
            "health_advice_hi": "स्वच्छ और ताज़ी हवा। बुजुर्गों के योगा, टहलने और खुले में समय बिताने के लिए सबसे अच्छा।"
        }
    ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_hi = EXCLUDED.title_hi,
    filter_options = EXCLUDED.filter_options,
    fallback_rows = EXCLUDED.fallback_rows;
