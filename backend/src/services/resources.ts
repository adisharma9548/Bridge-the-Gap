export type ResourceCategory =
  | 'mentors-orgs'
  | 'scholarships-education'
  | 'internships-competitions'
  | 'funding-grants'
  | 'tools-services';

export interface CivicResource {
  id: string;
  category: ResourceCategory;
  title_en: string;
  title_hi: string;
  provider_en: string;
  provider_hi: string;
  description_en: string;
  description_hi: string;
  official_link: string;
  target_audience_en: string;
  target_audience_hi: string;
  eligibility_requirements_en: string[];
  eligibility_requirements_hi: string[];
  why_it_matches_en: string;
  why_it_matches_hi: string;
  missing_requirements_warning_en: string;
  missing_requirements_warning_hi: string;
  deadline_or_schedule: string;
  verification_date: string;
  verified_source: string;
  location_coverage: string;
}

export const CURATED_RESOURCES: CivicResource[] = [
  // 1. MENTORS & ORGANISATIONS
  {
    id: 'res-elderline-14567',
    category: 'mentors-orgs',
    title_en: 'Elderline (National Senior Citizen Helpline - 14567)',
    title_hi: 'एल्डरलाइन (राष्ट्रीय वरिष्ठ नागरिक हेल्पलाइन - 14567)',
    provider_en: 'Ministry of Social Justice and Empowerment, Govt. of India',
    provider_hi: 'सामाजिक न्याय एवं अधिकारिता मंत्रालय, भारत सरकार',
    description_en: 'Toll-free national helpline offering emotional support, legal guidance, rescue services, and assistance against elder abuse and neglect across all Indian states.',
    description_hi: 'बुजुर्गों के लिए निःशुल्क राष्ट्रीय हेल्पलाइन। कानूनी सलाह, पेंशन सहायता, स्वास्थ्य मार्गदर्शन और उत्पीड़न से सुरक्षा के लिए 14567 पर सुबह 8 से शाम 8 बजे तक संपर्क करें।',
    official_link: 'https://socialjustice.gov.in',
    target_audience_en: 'Senior Citizens (Aged 60+) and their caregivers',
    target_audience_hi: 'वरिष्ठ नागरिक (60 वर्ष व अधिक) और उनके परिजन',
    eligibility_requirements_en: [
      'Age: 60 years or above',
      'Resident of India',
      'No fees or charges required'
    ],
    eligibility_requirements_hi: [
      'आयु 60 वर्ष या उससे अधिक होनी चाहिए',
      'भारत का निवासी होना अनिवार्य है',
      'पूरी तरह निःशुल्क सेवा है'
    ],
    why_it_matches_en: 'Connects older citizens directly with certified district social welfare officers and field coordinators without bureaucratic delay.',
    why_it_matches_hi: 'बिना किसी दफ्तर के चक्कर काटे सीधे जिले के समाज कल्याण अधिकारियों से संपर्क स्थापित कराता है।',
    missing_requirements_warning_en: 'Keep pension passbook, Aadhaar card, or local address proof accessible when calling for property or pension disputes.',
    missing_requirements_warning_hi: 'पेंशन या संपत्ति विवाद में सहायता लेते समय आधार कार्ड या स्थानीय पता प्रमाण पास रखें।',
    deadline_or_schedule: 'Active Daily: 8:00 AM to 8:00 PM (All 365 Days)',
    verification_date: 'March 2026',
    verified_source: 'Ministry of Social Justice & Empowerment Official Portal',
    location_coverage: 'All India',
  },
  {
    id: 'res-nalsa-legal-aid',
    category: 'mentors-orgs',
    title_en: 'NALSA Free Legal Aid & Lok Adalat Services',
    title_hi: 'नालसा निःशुल्क कानूनी सहायता व लोक अदालत सेवा',
    provider_en: 'National Legal Services Authority (NALSA) & Supreme Court of India',
    provider_hi: 'राष्ट्रीय विधिक सेवा प्राधिकरण (नालसा)',
    description_en: 'Provides free certified legal counsel, advocates, and mediation for senior citizens, women, children, and economically weaker individuals under Section 12 of the LSA Act.',
    description_hi: 'वरिष्ठ नागरिकों, महिलाओं और आर्थिक रूप से कमजोर वर्ग के लिए कोर्ट में वकील और कानूनी सलाह पूरी तरह निःशुल्क प्रदान करने वाली वैधानिक संस्था।',
    official_link: 'https://nalsa.gov.in',
    target_audience_en: 'Senior citizens, women, disabled persons, and low-income citizens',
    target_audience_hi: 'बुजुर्ग, महिलाएं, दिव्यांग और सीमित आय वर्ग के नागरिक',
    eligibility_requirements_en: [
      'Senior citizens, women, persons with disabilities, or annual income below state threshold (typically ₹3,00,000)',
      'Valid identity proof (Aadhaar or Voter ID)'
    ],
    eligibility_requirements_hi: [
      'वरिष्ठ नागरिक, महिलाएं, दिव्यांग या राज्य द्वारा निर्धारित आय सीमा (सामान्यतः ₹3 लाख) से कम आय',
      'वैध पहचान पत्र (आधार कार्ड या वोटर आईडी)'
    ],
    why_it_matches_en: 'Eliminates extortionate lawyer fees for bank notices, tenancy disputes, and inheritance documentation.',
    why_it_matches_hi: 'बैंक नोटिस, किराएदारी या पैतृक संपत्ति के मुकदमों में भारी वकील फीस से बचाता है।',
    missing_requirements_warning_en: 'Requires an official written application filed at the District Legal Services Authority (DLSA) office located in the District Court premises.',
    missing_requirements_warning_hi: 'जिला अदालत परिसर में स्थित जिला विधिक सेवा प्राधिकरण (DLSA) कार्यालय में लिखित आवेदन देना आवश्यक है।',
    deadline_or_schedule: 'Continuous throughout the year; National Lok Adalats held quarterly',
    verification_date: 'February 2026',
    verified_source: 'NALSA Official Government Directory (nalsa.gov.in)',
    location_coverage: 'All District Courts nationwide',
  },

  // 2. SCHOLARSHIPS & EDUCATION OPPORTUNITIES
  {
    id: 'res-national-scholarship-portal',
    category: 'scholarships-education',
    title_en: 'National Scholarship Portal (NSP Central Schemes)',
    title_hi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP केंद्रीय योजनाएं)',
    provider_en: 'Ministry of Education & Ministry of Minority Affairs, Govt. of India',
    provider_hi: 'शिक्षा मंत्रालय, भारत सरकार',
    description_en: 'Unified one-stop portal providing pre-matric, post-matric, merit-cum-means, and higher education scholarships disbursed directly into candidate bank accounts via DBT.',
    description_hi: 'स्कूली व कॉलेज छात्रों के लिए केंद्र सरकार का एकल छात्रवृत्ति पोर्टल। सीधे बैंक खाते में DBT के माध्यम से आर्थिक सहायता भेजी जाती है।',
    official_link: 'https://scholarships.gov.in',
    target_audience_en: 'Students enrolled in Class 1 to PhD across recognized Indian institutions',
    target_audience_hi: 'कक्षा 1 से लेकर पीएचडी तक के मान्यता प्राप्त स्कूल व कॉलेज के विद्यार्थी',
    eligibility_requirements_en: [
      'Enrolled in recognized school, college, or university',
      'Minimum 50% to 60% marks in previous final examination depending on scheme',
      'Family annual income under ₹2,50,000 to ₹8,00,000 depending on category'
    ],
    eligibility_requirements_hi: [
      'मान्यता प्राप्त विद्यालय या विश्वविद्यालय में नामांकित होना चाहिए',
      'पिछली कक्षा में न्यूनतम 50% से 60% अंक',
      'परिवार की वार्षिक आय योजनानुसार ₹2.5 लाख से ₹8 लाख के भीतर'
    ],
    why_it_matches_en: 'Guaranteed government-funded fee waiver and monthly stipend for deserving youth without third-party broker fees.',
    why_it_matches_hi: 'बिना किसी दलाल के सीधे खाते में फीस प्रतिपूर्ति व मासिक वजीफा।',
    missing_requirements_warning_en: 'Aadhaar must be linked to active bank account (Aadhaar Seeding / NPCI mapping) to receive DBT funds.',
    missing_requirements_warning_hi: 'छात्र का बैंक खाता आधार से एनपीसीआई (NPCI) मैप्ड होना अनिवार्य है, अन्यथा पैसा अटक सकता है।',
    deadline_or_schedule: 'Academic Cycle 2026: Applications open July–October 2026',
    verification_date: 'March 2026',
    verified_source: 'NSP Official Government Portal (scholarships.gov.in)',
    location_coverage: 'All India',
  },
  {
    id: 'res-swayam-free-education',
    category: 'scholarships-education',
    title_en: 'SWAYAM & NPTEL Free Higher Education Certification',
    title_hi: 'स्वयं (SWAYAM) व NPTEL निःशुल्क उच्च शिक्षा व डिग्री क्रेडिट',
    provider_en: 'Ministry of Education & IITs / IIMs / UGC',
    provider_hi: 'शिक्षा मंत्रालय एवं प्रमुख आईआईटी/आईआईएम',
    description_en: 'Free open online course repository covering engineering, humanities, commerce, law, and senior learning taught by premier IIT professors with transferable university credits.',
    description_hi: 'आईआईटी और केंद्रीय विश्वविद्यालयों के प्राध्यापकों द्वारा तैयार 3000+ निःशुल्क ऑनलाइन पाठ्यक्रम। विश्वविद्यालय परीक्षा में क्रेडिट ट्रांसफर की सुविधा।',
    official_link: 'https://swayam.gov.in',
    target_audience_en: 'High school students, college undergraduates, working professionals, and lifelong senior learners',
    target_audience_hi: 'कॉलेज छात्र, पेशेवर और नई चीजें सीखने के इच्छुक वरिष्ठ नागरिक',
    eligibility_requirements_en: [
      'Open to all citizens regardless of age or background',
      'Internet connection and web browser',
      'Certification exam optional with nominal subsidized fee'
    ],
    eligibility_requirements_hi: [
      'सभी भारतीय नागरिकों के लिए खुली शिक्षा',
      'इंटरनेट और स्मार्टफोन या कंप्यूटर आवश्यक',
      'प्रमाण-पत्र परीक्षा स्वैच्छिक है'
    ],
    why_it_matches_en: 'Complete access to high-value higher education courseware without expensive private tuition fees.',
    why_it_matches_hi: 'बिना किसी महंगी कोचिंग फीस के देश के सर्वश्रेष्ठ प्रोफेसरों से निःशुल्क अध्ययन।',
    missing_requirements_warning_en: 'Course content is completely free; only final proctored exam voucher requires registration.',
    missing_requirements_warning_hi: 'पढ़ाई पूरी तरह निःशुल्क है; केवल परीक्षा प्रमाण पत्र के लिए पंजीकरण करना होता है।',
    deadline_or_schedule: 'Two cycles per year: January–June & July–November sessions',
    verification_date: 'February 2026',
    verified_source: 'Ministry of Education SWAYAM Portal (swayam.gov.in)',
    location_coverage: 'Online / Accessible Nationwide',
  },

  // 3. INTERNSHIPS & COMPETITIONS
  {
    id: 'res-pm-internship-scheme',
    category: 'internships-competitions',
    title_en: 'Prime Minister Internship Scheme (PMIS)',
    title_hi: 'प्रधानमंत्री इंटर्नशिप योजना (PMIS)',
    provider_en: 'Ministry of Corporate Affairs, Govt. of India',
    provider_hi: 'कॉरपोरेट कार्य मंत्रालय, भारत सरकार',
    description_en: 'Provides 12 months of structured corporate training with India\'s top 500 private sector companies, featuring a ₹5,000 monthly stipend plus ₹6,000 one-time contingency grant.',
    description_hi: 'देश की शीर्ष 500 कंपनियों में 12 महीने की व्यावहारिक ट्रेनिंग। ₹5,000 मासिक स्टाइपेंड और ₹6,000 एकमुश्त सहायता राशि सीधे खाते में।',
    official_link: 'https://pminternship.mca.gov.in',
    target_audience_en: 'Youth aged 21 to 24 with 10th, 12th, ITI, Polytechnic, or Graduate degree',
    target_audience_hi: '21 से 24 वर्ष के युवा (10वीं, 12वीं, आईटीआई, डिप्लोमा या स्नातक)',
    eligibility_requirements_en: [
      'Age: 21 to 24 years at the time of application',
      'Educational qualifications: Class 10th, 12th, ITI, Polytechnic Diploma, or BA/BSc/BCom/BCA',
      'Candidate must not be employed full-time or enrolled in full-time formal education'
    ],
    eligibility_requirements_hi: [
      'आयु 21 से 24 वर्ष के बीच होनी चाहिए',
      'शैक्षणिक योग्यता: 10वीं, 12वीं, आईटीआई, डिप्लोमा या स्नातक',
      'उम्मीदवार पूर्णकालिक नौकरी या नियमित शिक्षा में न हो'
    ],
    why_it_matches_en: 'Offers premier real-world industry exposure with zero fees and guaranteed monthly government allowance.',
    why_it_matches_hi: 'शीर्ष कंपनियों में काम का अनुभव और सरकार द्वारा सुनिश्चित मासिक वजीफा।',
    missing_requirements_warning_en: 'Graduates from IITs, IIMs, IISER, CA, CMA, or MBBS are NOT eligible; family annual income must not exceed ₹8 Lakhs.',
    missing_requirements_warning_hi: 'आईआईटी/आईआईएम या सीए/एमबीबीएस डिग्री वाले पात्र नहीं हैं; पारिवारिक आय ₹8 लाख से अधिक नहीं होनी चाहिए।',
    deadline_or_schedule: 'Batch Rounds open semi-annually on pminternship.mca.gov.in',
    verification_date: 'March 2026',
    verified_source: 'Ministry of Corporate Affairs Portal (pminternship.mca.gov.in)',
    location_coverage: 'Pan-India across 730+ districts',
  },
  {
    id: 'res-aicte-internship-portal',
    category: 'internships-competitions',
    title_en: 'AICTE National Internship Portal (Govt & Municipal)',
    title_hi: 'एआईसीटीई राष्ट्रीय इंटर्नशिप पोर्टल (सरकारी व नगर निगम)',
    provider_en: 'All India Council for Technical Education (AICTE)',
    provider_hi: 'अखिल भारतीय तकनीकी शिक्षा परिषद (AICTE)',
    description_en: 'Central repository listing over 1 Crore verified internship openings across Smart Cities, Urban Local Bodies, NHAI, state departments, and registered MSMEs.',
    description_hi: '1 करोड़ से अधिक सत्यापित इंटर्नशिप अवसर। स्मार्ट सिटी, नगर निगम, भारतीय राष्ट्रीय राजमार्ग प्राधिकरण (NHAI) और तकनीकी विभागों में अवसर।',
    official_link: 'https://internship.aicte-india.org',
    target_audience_en: 'Diploma, Polytechnic, Engineering, Arts & Science college students',
    target_audience_hi: 'पॉलिटेक्निक, इंजीनियरिंग, कला व विज्ञान महाविद्यालय के छात्र',
    eligibility_requirements_en: [
      'Currently enrolled in or recently graduated from a recognized Indian institute',
      'Registered student profile with valid student ID'
    ],
    eligibility_requirements_hi: [
      'मान्यता प्राप्त संस्थान का छात्र या हालिया स्नातक',
      'वैध छात्र पहचान पत्र'
    ],
    why_it_matches_en: 'Direct access to government municipal internships with verified completion certificates valuable for public job recruitment.',
    why_it_matches_hi: 'सरकारी विभागों में काम का आधिकारिक अनुभव और प्रमाणित प्रमाण-पत्र।',
    missing_requirements_warning_en: 'Ensure your college/polytechnic is registered on the AICTE portal to validate academic internship credits.',
    missing_requirements_warning_hi: 'संस्थान का एआईसीटीई पोर्टल पर कोड होना आवश्यक है ताकि कॉलेज क्रेडिट मिल सके।',
    deadline_or_schedule: 'Rolling listings updated weekly year-round',
    verification_date: 'February 2026',
    verified_source: 'AICTE Portal (internship.aicte-india.org)',
    location_coverage: 'All Indian Municipalities and States',
  },

  // 4. FUNDING RESOURCES
  {
    id: 'res-pm-mudra-yojana',
    category: 'funding-grants',
    title_en: 'Pradhan Mantri MUDRA Yojana (PMMY Collateral-Free Loans)',
    title_hi: 'प्रधानमंत्री मुद्रा योजना (PMMY बिना गारंटी कर्ज़)',
    provider_en: 'MUDRA / Department of Financial Services, Ministry of Finance',
    provider_hi: 'वित्तीय सेवाएं विभाग, वित्त मंत्रालय, भारत सरकार',
    description_en: 'Provides institutional loans up to ₹20 Lakhs to non-corporate, non-farm small and micro enterprises without collateral or mortgage through all commercial banks.',
    description_hi: 'छोटा व्यापार, दुकान या सेवा उद्यम शुरू करने के लिए ₹20 लाख तक का बिना गारंटी का कर्ज़ (शिशु, किशोर, तरुण व तरुण प्लस)।',
    official_link: 'https://www.mudra.org.in',
    target_audience_en: 'Small shopkeepers, artisans, fruit vendors, small manufacturers, women entrepreneurs',
    target_audience_hi: 'छोटे दुकानदार, दस्तकार, कारीगर, फल-सब्जी विक्रेता और लघु उद्यमी',
    eligibility_requirements_en: [
      'Indian citizen with viable non-farm business proposal',
      'No history of default in any bank or financial institution',
      'Categories: Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 Lakh), Tarun (₹5 Lakh to ₹20 Lakh)'
    ],
    eligibility_requirements_hi: [
      'गैर-कृषि व्यवसाय की योजना वाला भारतीय नागरिक',
      'किसी भी बैंक में पूर्व डिफ़ॉल्ट या एनपीए न हो',
      'श्रेणियां: शिशु (₹50,000 तक), किशोर (₹50,000 से ₹5 लाख), तरुण (₹20 लाख तक)'
    ],
    why_it_matches_en: 'Requires no mortgage or land pledge, protecting family home and personal savings from seizure.',
    why_it_matches_hi: 'बिना घर या जमीन गिरवी रखे बैंकों से पारदर्शी दर पर ऋण मिलता है।',
    missing_requirements_warning_en: 'Beware of fraudulent agents charging advance "processing fees"; apply directly through your nearest public sector bank branch or Udyami Mitra portal.',
    missing_requirements_warning_hi: 'दलालों या फर्जी अप्रूवल लेटर के झांसे में न आएं; सीधे अपने नजदीकी सरकारी बैंक से आवेदन करें।',
    deadline_or_schedule: 'Open round-the-clock across all public sector and commercial banks',
    verification_date: 'March 2026',
    verified_source: 'Official MUDRA Bank Portal (mudra.org.in)',
    location_coverage: 'All Indian Banks & NBFCs',
  },
  {
    id: 'res-pm-svanidhi',
    category: 'funding-grants',
    title_en: 'PM SVANidhi (Microcredit for Street Vendors & Small Traders)',
    title_hi: 'पीएम स्वनिधि (स्ट्रीट वेंडर व छोटे व्यापारियों के लिए सूक्ष्म ऋण)',
    provider_en: 'Ministry of Housing and Urban Affairs (MoHUA)',
    provider_hi: 'आवासन और शहरी कार्य मंत्रालय, भारत सरकार',
    description_en: 'Special microcredit scheme providing collateral-free working capital loan starting at ₹10,000 (1st tranche), ₹20,000 (2nd tranche), and up to ₹50,000 (3rd tranche) with 7% interest subsidy.',
    description_hi: 'रेहड़ी-पटरी वालों और छोटे फेरीवालों के लिए ₹10,000 से ₹50,000 तक का सस्ता कार्यशील पूंजी ऋण। समय पर चुकाने पर 7% ब्याज सब्सिडी और डिजिटल कैशबैक।',
    official_link: 'https://pmsvanidhi.mohua.gov.in',
    target_audience_en: 'Urban and peri-urban street vendors, hawkers, cobblers, vegetable/fruit sellers',
    target_audience_hi: 'सड़क किनारे दुकान लगाने वाले, फेरीवाले, मोची, फल-सब्जी विक्रेता',
    eligibility_requirements_en: [
      'Street vendors possessing Certificate of Vending / Identity Card issued by Urban Local Body (ULB)',
      'Aadhaar-linked active bank account'
    ],
    eligibility_requirements_hi: [
      'नगर पालिका या नगर निगम द्वारा जारी वेंडिंग प्रमाण पत्र या पहचान पत्र',
      'आधार से जुड़ा बैंक खाता'
    ],
    why_it_matches_en: 'Helps elderly and self-employed micro-traders avoid predatory local moneylenders charging 10% daily interest.',
    why_it_matches_hi: 'साहूकारों के भारी ब्याज के चंगुल से मुक्ति दिलाकर औपचारिक बैंकिंग से जोड़ता है।',
    missing_requirements_warning_en: 'Vendors without ULB cards must obtain a Letter of Recommendation (LoR) from their local municipal ward office.',
    missing_requirements_warning_hi: 'वेंडर कार्ड न होने पर स्थानीय वार्ड कार्यालय से सिफारिश पत्र (LoR) लेना आवश्यक है।',
    deadline_or_schedule: 'Active scheme across all Urban Local Bodies nationwide',
    verification_date: 'January 2026',
    verified_source: 'MoHUA PM SVANidhi Portal (pmsvanidhi.mohua.gov.in)',
    location_coverage: 'All Urban Local Bodies nationwide',
  },

  // 5. USEFUL TOOLS & PUBLIC SERVICES
  {
    id: 'res-digilocker-service',
    category: 'tools-services',
    title_en: 'DigiLocker (Official Digital Document Wallet)',
    title_hi: 'डिजिलॉकर (आधिकारिक डिजिटल दस्तावेज़ वॉलेट)',
    provider_en: 'Ministry of Electronics and Information Technology (MeitY)',
    provider_hi: 'इलेक्ट्रॉनिकी एवं सूचना प्रौद्योगिकी मंत्रालय (MeitY)',
    description_en: 'Government cloud service providing 1 GB of secure storage for legally valid digital copies of Aadhaar, Driving Licence, Pension Payment Orders (PPO), Marksheets, and Property Papers.',
    description_hi: 'भारत सरकार का सुरक्षित डिजिटल लॉकर। आधार कार्ड, ड्राइविंग लाइसेंस, पेंशन पेमेंट ऑर्डर (PPO) और मार्कशीट की कानूनी रूप से मान्य प्रतियां हमेशा फोन में रखें।',
    official_link: 'https://www.digilocker.gov.in',
    target_audience_en: 'All Indian citizens with an Aadhaar card',
    target_audience_hi: 'आधार कार्ड धारक सभी भारतीय नागरिक व वरिष्ठ जन',
    eligibility_requirements_en: [
      'Aadhaar number with mobile number linked for OTP verification',
      'Free of cost for lifetime'
    ],
    eligibility_requirements_hi: [
      'आधार नंबर और उससे जुड़ा मोबाइल नंबर (OTP सत्यापन हेतु)',
      'आजीवन पूरी तरह निःशुल्क'
    ],
    why_it_matches_en: 'Seniors no longer need to carry fragile physical paper notices, ration cards, or pension orders when visiting government desks.',
    why_it_matches_hi: 'सरकारी दफ्तरों में मूल कागजात खोने के डर के बिना मोबाइल से ही मूल वैध दस्तावेज दिखाना संभव।',
    missing_requirements_warning_en: 'Digital documents in DigiLocker have statutory parity with original documents under Rule 9A of the Information Technology Rules 2016.',
    missing_requirements_warning_hi: 'आईटी अधिनियम 2016 के नियम 9ए के तहत डिजिलॉकर के दस्तावेज मूल कागजात के बराबर मान्य हैं।',
    deadline_or_schedule: 'Available 24x7 online and via Android/iOS applications',
    verification_date: 'March 2026',
    verified_source: 'MeitY Official DigiLocker Portal (digilocker.gov.in)',
    location_coverage: 'All India',
  },
  {
    id: 'res-esanjeevani-telemedicine',
    category: 'tools-services',
    title_en: 'eSanjeevani (National Telemedicine Doctor Consultations)',
    title_hi: 'ई-संजीवनी (राष्ट्रीय निःशुल्क डॉक्टर परामर्श सेवा)',
    provider_en: 'Ministry of Health and Family Welfare (MoHFW)',
    provider_hi: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय, भारत सरकार',
    description_en: 'Free patient-to-doctor video teleconsultation service connecting citizens directly with registered government medical officers, specialist physicians, and AIIMS doctors.',
    description_hi: 'घर बैठे सरकारी डॉक्टरों और विशेषज्ञों से वीडियो कॉल पर मुफ्त सलाह और ई-प्रिस्क्रिप्शन (दवा की पर्ची) प्राप्त करने की राष्ट्रीय सेवा।',
    official_link: 'https://esanjeevani.mohfw.gov.in',
    target_audience_en: 'Seniors with mobility constraints, rural patients, and families needing specialist second opinions',
    target_audience_hi: 'चलने-फिरने में असमर्थ बुजुर्ग, दूरदराज के नागरिक और पारिवारिक मरीज',
    eligibility_requirements_en: [
      'Smartphone, tablet, or laptop with camera and internet connection',
      'Indian mobile number for OTP login'
    ],
    eligibility_requirements_hi: [
      'कैमरा और इंटरनेट युक्त स्मार्टफोन या कंप्यूटर',
      'ओटीपी के लिए भारतीय मोबाइल नंबर'
    ],
    why_it_matches_en: 'Prevents fragile elderly citizens from standing in crowded, exhausting hospital OPD queues just for routine prescription renewals.',
    why_it_matches_hi: 'नियमित दवा नवीनीकरण के लिए बुजुर्गों को अस्पताल की लंबी लाइनों में खड़े होने की आवश्यकता नहीं।',
    missing_requirements_warning_en: 'Keep your previous medical records, blood test results, and discharge summary handy to upload during the consultation.',
    missing_requirements_warning_hi: 'कॉल शुरू होने से पहले पुरानी मेडिकल रिपोर्ट और खून की जांच के कागजात साथ रखें।',
    deadline_or_schedule: 'Active Daily: 9:00 AM to 5:00 PM (Monday to Saturday)',
    verification_date: 'March 2026',
    verified_source: 'MoHFW eSanjeevani Portal (esanjeevani.mohfw.gov.in)',
    location_coverage: 'All States and Union Territories',
  },
  {
    id: 'res-nch-consumer-helpline',
    category: 'tools-services',
    title_en: 'National Consumer Helpline (NCH - 1915)',
    title_hi: 'राष्ट्रीय उपभोक्ता हेल्पलाइन (NCH - 1915)',
    provider_en: 'Department of Consumer Affairs, Govt. of India',
    provider_hi: 'उपभोक्ता मामले विभाग, भारत सरकार',
    description_en: 'Government dispute resolution helpline handling wrongful bank charges, rejected insurance claims, fake online billing, and medical overcharging without court fees.',
    description_hi: 'बैंकों द्वारा गलत शुल्क काटने, बीमा क्लेम रोकने, बिजली बिल या धोखाधड़ी की शिकायतों का बिना कोर्ट फीस त्वरित समाधान कराने वाली हेल्पलाइन।',
    official_link: 'https://consumerhelpline.gov.in',
    target_audience_en: 'Any citizen aggrieved by unfair trade practices, insurance repudiation, or banking deficiency',
    target_audience_hi: 'अनुचित व्यापार, गलत बैंक शुल्क या बीमा इनकार से पीड़ित कोई भी नागरिक',
    eligibility_requirements_en: [
      'Details of the transaction or policy/account number',
      'Toll-free dial 1915 or SMS to 8800001915'
    ],
    eligibility_requirements_hi: [
      'लेन-देन, पॉलिसी नंबर या बैंक खाता विवरण',
      'टोल-फ्री नंबर 1915 पर कॉल करें या एसएमएस भेजें'
    ],
    why_it_matches_en: 'Over 80% of consumer grievances against corporate insurers and banks are resolved through direct regulatory intervention.',
    why_it_matches_hi: 'बीमा कंपनियों और बैंकों के खिलाफ शिकायतों का अधिकांश समाधान नियामक दबाव से यहीं हो जाता है।',
    missing_requirements_warning_en: 'Always keep your docket / complaint tracking number saved for follow-ups.',
    missing_requirements_warning_hi: 'शिकायत दर्ज होने के बाद मिलने वाले डॉकेट नंबर को भविष्य के लिए सुरक्षित रखें।',
    deadline_or_schedule: 'Toll-free 1915 available Monday to Saturday 8:00 AM to 8:00 PM',
    verification_date: 'February 2026',
    verified_source: 'Department of Consumer Affairs (consumerhelpline.gov.in)',
    location_coverage: 'Pan-India',
  }
];

export function queryResources(params: {
  category?: string;
  search?: string;
  target?: string;
  location?: string;
}): CivicResource[] {
  let list = [...CURATED_RESOURCES];

  if (params.category && params.category !== 'all') {
    list = list.filter((r) => r.category === params.category);
  }

  if (params.target && params.target !== 'all') {
    const targetLower = params.target.toLowerCase();
    list = list.filter(
      (r) =>
        r.target_audience_en.toLowerCase().includes(targetLower) ||
        r.target_audience_hi.toLowerCase().includes(targetLower)
    );
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (r) =>
        r.title_en.toLowerCase().includes(q) ||
        r.title_hi.toLowerCase().includes(q) ||
        r.description_en.toLowerCase().includes(q) ||
        r.description_hi.toLowerCase().includes(q) ||
        r.provider_en.toLowerCase().includes(q) ||
        r.provider_hi.toLowerCase().includes(q) ||
        r.why_it_matches_en.toLowerCase().includes(q) ||
        r.why_it_matches_hi.toLowerCase().includes(q)
    );
  }

  return list;
}
