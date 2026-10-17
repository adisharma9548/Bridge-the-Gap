export type Language = 'en' | 'hi';

export interface TranslationDictionary {
  brandName: string;
  brandTagline: string;
  homeBtn: string;
  understandTab: string;
  findTab: string;
  savedTab: string;
  fontScalerLabel: string;
  normalFont: string;
  largeFont: string;
  xlargeFont: string;

  // Flow 1: Understand
  understandHeading: string;
  understandSubtitle: string;
  demoSectionTitle: string;
  demoBankTitle: string;
  demoBankDesc: string;
  demoMedicalTitle: string;
  demoMedicalDesc: string;
  demoInsuranceTitle: string;
  demoInsuranceDesc: string;
  inputLabel: string;
  inputPlaceholder: string;
  speakBtn: string;
  listeningNow: string;
  clearBtn: string;
  explainBtn: string;
  analyzingText: string;
  charactersCount: string;
  ctrlEnterHint: string;
  activeScenario: string;

  // Controlled Voice Console
  voiceConsoleTitle: string;
  voiceListeningPrompt: string;
  voicePausedPrompt: string;
  voiceTapToAnalyse: string;
  voiceTapToCancel: string;
  voiceResumeListening: string;
  voicePauseListening: string;
  voiceEditTranscriptHint: string;
  voicePermissionPrompt: string;

  // 5 Output Sections + Evidence & Uncertainties
  sectionMeaningTitle: string;
  sectionTermsTitle: string;
  sectionActionsTitle: string;
  sectionQuestionsTitle: string;
  sectionWatchoutTitle: string;
  uncertaintiesTitle: string;
  uncertaintiesDesc: string;
  supportingEvidenceTitle: string;
  disclaimerLegal: string;
  disclaimerMedical: string;
  disclaimerFinancial: string;
  disclaimerCivic: string;
  listenAloudBtn: string;
  stopListeningBtn: string;
  listenSection: string;
  pronounceTerm: string;
  copyBtn: string;
  copiedBtn: string;
  saveForLaterBtn: string;
  savedSuccessBtn: string;
  verifiedEvidenceBadge: string;
  unverifiedWarningBadge: string;
  originalTextQuoteLabel: string;
  whyItMattersLabel: string;
  actionDoneLabel: string;
  actionProgress: string;
  allActionsDone: string;
  askDoctorOrOfficial: string;

  // Flow 2: Find Public Info
  findHeading: string;
  findSubtitle: string;
  selectCatalogTitle: string;
  searchPublicInfoPlaceholder: string;
  verifiedSourceBadge: string;
  aiGroundedBadge: string;
  mandiTitle: string;
  mandiDesc: string;
  hospitalTitle: string;
  hospitalDesc: string;
  aqiTitle: string;
  aqiDesc: string;
  educationTitle: string;
  educationDesc: string;
  educationFilterLabel: string;
  conductingBodyLabel: string;
  targetPostsLabel: string;
  eligibilityLabel: string;
  examStagesLabel: string;
  timelinesLabel: string;
  officialPortalBtn: string;
  familyGuidanceTip: string;
  filterLabel: string;
  showInfoBtn: string;
  fetchingData: string;
  officialSummaryTitle: string;
  practicalAdviceTitle: string;
  recordsTableTitle: string;
  sourceBadgeLabel: string;
  liveBadge: string;
  snapshotBadge: string;

  // Flow 3: Resources Bridge
  resourcesTab: string;
  resourcesHeading: string;
  resourcesSubtitle: string;
  catAll: string;
  catMentors: string;
  catScholarships: string;
  catInternships: string;
  catFunding: string;
  catTools: string;
  filterTargetLabel: string;
  searchResourcesPlaceholder: string;
  whyItMatchesTitle: string;
  missingRequirementsTitle: string;
  eligibilityChecklistTitle: string;
  officialPortalLink: string;
  verifiedDateLabel: string;
  locationLabel: string;
  noResourcesFound: string;

  // Flow 3: Saved Items
  savedHeading: string;
  savedSubtitle: string;
  savedEmptyTitle: string;
  savedEmptyDesc: string;
  deleteBtn: string;
  confirmDelete: string;
  viewDetailsBtn: string;
  savedDossierTitle: string;
  backToList: string;

  // Static Footer / Disclaimer
  disclaimerText: string;

  // File Attachments
  attachFileBtn: string;
  attachFileHint: string;
  fileAttachedLabel: string;
  removeFileBtn: string;
  fileTooLarge: string;
  unsupportedFileType: string;
  explainFileBtn: string;
  dragDropNotice: string;
  dismissBanner: string;

  // Errors & Alerts
  errorEmptyInput: string;
  errorFailedFetch: string;
  speechNotSupported: string;

  // Citizen Auth & OTP
  signInBtn: string;
  registerBtn: string;
  signOutBtn: string;
  myAccountTitle: string;
  signInOrRegisterTitle: string;
  signInTab: string;
  registerTab: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  sendOtpBtn: string;
  sendingOtp: string;
  otpSentMessage: string;
  enterOtpTitle: string;
  enterOtpSubtitle: string;
  verifyAndContinueBtn: string;
  verifyingOtp: string;
  resendOtpBtn: string;
  resendCountdown: string;
  otpSpamHint: string;
  authSuccessGreeting: string;
  aiEngineSelectorLabel: string;
  aiEngineAuto: string;
  aiEngineGemini: string;
  aiEngineGroq: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    brandName: 'Setu',
    brandTagline: 'Public Knowledge & Accessibility Platform',
    homeBtn: 'Home',
    understandTab: 'Explain Document',
    findTab: 'Public Data Explorer',
    savedTab: 'Saved Records',
    fontScalerLabel: 'Reading Size',
    normalFont: 'A',
    largeFont: 'A+',
    xlargeFont: 'A++',

    // Flow 1: Understand
    understandHeading: 'Plain-Language Document Explainer',
    understandSubtitle:
      'Translate complex legal notices, hospital lab reports, loan letters, and insurance clauses into clear, grade-5 language.',
    demoSectionTitle: 'Try a Real-World Scenario',
    demoBankTitle: 'Bank SARFAESI Default Notice',
    demoBankDesc: 'Account classified as NPA with a Rs. 45,000 lien marked on Fixed Deposit.',
    demoMedicalTitle: 'Comprehensive Blood Lipid & HbA1c Panel',
    demoMedicalDesc: 'Elevated HbA1c at 7.9% and LDL cholesterol at 168 mg/dL with statin prescription.',
    demoInsuranceTitle: 'Health Insurance Claim Repudiation Letter',
    demoInsuranceDesc: 'Claim denied under Pre-Existing Disease (PED) 36-month waiting period and 20% co-payment.',
    inputLabel: 'Document Text or Notice Clause',
    inputPlaceholder:
      'Paste difficult clauses from notices, medical lab reports, or government communications here...',
    speakBtn: 'Voice Dictation',
    listeningNow: 'Listening... Speak now',
    clearBtn: 'Clear Text',
    explainBtn: 'Analyze & Explain',
    analyzingText: 'Analyzing terms, verifying evidence, and simplifying...',
    charactersCount: 'characters',
    ctrlEnterHint: 'Press Ctrl + Enter to analyze',
    activeScenario: 'Loaded Scenario',

    // Controlled Voice Console
    voiceConsoleTitle: 'Voice Dictation Console',
    voiceListeningPrompt: 'Listening — speak at your own pace. Pausing is completely okay.',
    voicePausedPrompt: 'Paused — your spoken words are preserved safely. Tap to Resume or Tap to Analyse.',
    voiceTapToAnalyse: 'Tap to Analyse',
    voiceTapToCancel: 'Tap to Cancel',
    voiceResumeListening: 'Resume Speaking',
    voicePauseListening: 'Pause',
    voiceEditTranscriptHint: 'You can edit or correct the transcript directly in this box before analyzing.',
    voicePermissionPrompt: 'Requesting microphone access...',

    // 5 Output Sections
    sectionMeaningTitle: 'Core Summary',
    sectionTermsTitle: 'Key Terminology Defined',
    sectionActionsTitle: 'Recommended Next Steps',
    sectionQuestionsTitle: 'Questions to Ask Your Official or Doctor',
    sectionWatchoutTitle: 'Important Warnings & Deadlines',
    uncertaintiesTitle: 'Things This Document Does Not Make Clear',
    uncertaintiesDesc: 'Information absent or inconclusive in the source text. Verify these before taking action.',
    supportingEvidenceTitle: 'Supporting Quotes & Document References',
    disclaimerLegal: 'Legal Informational Advisory',
    disclaimerMedical: 'Medical Informational Advisory',
    disclaimerFinancial: 'Financial & Insurance Advisory',
    disclaimerCivic: 'General Civic Advisory',
    listenAloudBtn: 'Listen Aloud',
    stopListeningBtn: 'Stop Audio',
    listenSection: 'Listen to section',
    pronounceTerm: 'Hear pronunciation',
    copyBtn: 'Copy',
    copiedBtn: 'Copied!',
    saveForLaterBtn: 'Save Record',
    savedSuccessBtn: 'Saved to Records',
    verifiedEvidenceBadge: 'Verified from source text',
    unverifiedWarningBadge: 'General advisory',
    originalTextQuoteLabel: 'Verbatim clause from document:',
    whyItMattersLabel: 'Impact on you:',
    actionDoneLabel: 'Completed',
    actionProgress: 'completed',
    allActionsDone: 'All recommended action steps completed',
    askDoctorOrOfficial: 'Direct question to read out loud:',

    // Flow 2: Find Public Info
    findHeading: 'Official Public Data Explorer',
    findSubtitle:
      'Direct connection to verified datasets on the Open Government Data Platform India (data.gov.in) translated into practical insights.',
    selectCatalogTitle: 'Select Dataset Category',
    searchPublicInfoPlaceholder: 'Search government schemes, crops, hospitals, or topics...',
    verifiedSourceBadge: 'Official Government Source',
    aiGroundedBadge: 'AI-Assisted Plain Summary',
    mandiTitle: 'Daily Mandi Wholesale Prices',
    mandiDesc: 'Official wholesale rates for wheat, potato, onion, and mustard across Indian mandis.',
    hospitalTitle: 'Public & PM-JAY Empanelled Hospitals',
    hospitalDesc: 'Directory of government healthcare facilities with 24x7 trauma care and cashless treatment.',
    aqiTitle: 'City Air Quality & Pollution (AQI)',
    aqiDesc: 'Real-time air pollution levels and evidence-based health guidance for senior citizens.',
    educationTitle: 'Competitive Exams & Education',
    educationDesc: 'Syllabus, eligibility, important dates & career paths for UPSC, SSC, JEE, NEET, Banking & Defence.',
    educationFilterLabel: 'Filter by Exam Stream / Category',
    conductingBodyLabel: 'Conducting Body:',
    targetPostsLabel: 'Target Careers / Posts:',
    eligibilityLabel: 'Eligibility & Criteria:',
    examStagesLabel: 'Exam Selection Stages:',
    timelinesLabel: '2026 Annual Cycle Timelines:',
    officialPortalBtn: 'Visit Official Portal',
    familyGuidanceTip: 'Family & Senior Citizen Guidance Note:',
    filterLabel: 'Filter by Region / State',
    showInfoBtn: 'Query Official Data',
    fetchingData: 'Retrieving official government records...',
    officialSummaryTitle: 'Plain-Language Data Insights',
    practicalAdviceTitle: 'Citizen Health & Practical Advisory',
    recordsTableTitle: 'Official Government Records',
    sourceBadgeLabel: 'Open Government Data Platform India (data.gov.in)',
    liveBadge: 'Live API',
    snapshotBadge: 'Verified Archive',

    // Flow 3: Resources Bridge
    resourcesTab: 'Resources Bridge',
    resourcesHeading: 'Curated Civic & Educational Opportunities',
    resourcesSubtitle: 'Discover verified government programs, helplines, scholarships, funding schemes, and digital citizen services.',
    catAll: 'All Categories',
    catMentors: 'Mentors & Helplines',
    catScholarships: 'Scholarships & Education',
    catInternships: 'Internships & Opportunities',
    catFunding: 'Funding & Grants',
    catTools: 'Citizen Tools & Services',
    filterTargetLabel: 'Beneficiary Group',
    searchResourcesPlaceholder: 'Search by scheme, service name, or keywords...',
    whyItMatchesTitle: 'Why This Matches Your Needs',
    missingRequirementsTitle: 'Important Eligibility Check',
    eligibilityChecklistTitle: 'Key Requirements',
    officialPortalLink: 'Visit Official Portal',
    verifiedDateLabel: 'Verified:',
    locationLabel: 'Coverage:',
    noResourcesFound: 'No resources match your filters. Try selecting "All Categories".',

    // Flow 3: Saved Items
    savedHeading: 'Saved Reference Records',
    savedSubtitle: 'Locally cached explanations and public data queries available offline without re-typing.',
    savedEmptyTitle: 'No saved records found',
    savedEmptyDesc:
      'When reviewing any document explanation or public data query, click "Save Record" to store it here for future reference.',
    deleteBtn: 'Remove',
    confirmDelete: 'Are you sure you want to permanently remove this saved record?',
    viewDetailsBtn: 'View Full Dossier',
    savedDossierTitle: 'Offline Reference Dossier',
    backToList: 'Back to saved records',

    // Disclaimer
    disclaimerText:
      'Setu is an assistive public accessibility platform designed to explain complex information and public data. It does not replace professional legal, medical, or banking advice.',

    // File Attachments
    attachFileBtn: 'Attach File / Scan',
    attachFileHint: 'Supports PDF, JPG, PNG, WEBP, or TXT (up to 20MB)',
    fileAttachedLabel: 'Attached Document',
    removeFileBtn: 'Remove',
    fileTooLarge: 'File exceeds 20MB limit. Please choose a smaller document.',
    unsupportedFileType: 'Unsupported format. Please choose a PDF, image (JPG/PNG), or TXT document.',
    explainFileBtn: 'Analyze Document',
    dragDropNotice: 'Drop your document here',
    dismissBanner: 'Dismiss',

    // Errors & Alerts
    errorEmptyInput: 'Please enter document text or select one of the real-world scenarios above.',
    errorFailedFetch: 'Unable to complete the request. Please check your network connection and retry.',
    speechNotSupported: 'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.',

    // Citizen Auth & OTP
    signInBtn: 'Sign In / Register',
    registerBtn: 'Create Account',
    signOutBtn: 'Sign Out',
    myAccountTitle: 'My Citizen Account',
    signInOrRegisterTitle: 'Citizen Sign In / Registration',
    signInTab: 'Sign In',
    registerTab: 'New Registration',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    emailLabel: 'Email Address',
    emailPlaceholder: 'e.g. adisharma9548@gmail.com',
    sendOtpBtn: 'Send Email Verification Code',
    sendingOtp: 'Sending verification code...',
    otpSentMessage: 'A 6-digit verification code has been dispatched to your email address.',
    enterOtpTitle: 'Enter Verification Code',
    enterOtpSubtitle: 'Please enter the 6-digit numeric OTP sent to',
    verifyAndContinueBtn: 'Verify & Sign In',
    verifyingOtp: 'Verifying code...',
    resendOtpBtn: 'Resend Code',
    resendCountdown: 'Resend code in',
    otpSpamHint: 'Note: Check your spam or promotions folder if the email does not appear in your inbox.',
    authSuccessGreeting: 'Namaste! You have successfully signed in.',
    aiEngineSelectorLabel: 'AI Engine',
    aiEngineAuto: 'Auto (Hybrid)',
    aiEngineGemini: 'Gemini 3.1 Flash Lite',
    aiEngineGroq: 'Groq 120B (Ultra-Fast)',
  },
  hi: {
    brandName: 'सेतु (Setu)',
    brandTagline: 'नागरिक सूचना एवं सुगम भाषा सेतु',
    homeBtn: 'होम',
    understandTab: 'दस्तावेज़ समझें',
    findTab: 'सरकारी आंकड़े',
    savedTab: 'सहेजे गए रिकॉर्ड',
    fontScalerLabel: 'अक्षर का आकार',
    normalFont: 'अ',
    largeFont: 'अ+',
    xlargeFont: 'अ++',

    // Flow 1: Understand
    understandHeading: 'कठिन दस्तावेज़ व नोटिस का सरल अनुवाद',
    understandSubtitle:
      'बैंक नोटिस, अस्पताल की लैब रिपोर्ट, कानूनी पत्र या बीमा क्लेम की तकनीकी भाषा को कक्षा 5 के स्तर की आसान हिंदी में समझें।',
    demoSectionTitle: 'वास्तविक उदाहरण चुनकर देखें',
    demoBankTitle: 'बैंक सरफेसी (SARFAESI) डिफ़ॉल्ट नोटिस',
    demoBankDesc: 'खाता एनपीए घोषित और फिक्स्ड डिपॉजिट (FD) पर ₹45,000 की रोक (लियन)।',
    demoMedicalTitle: 'ब्लड शुगर (HbA1c) व कोलेस्ट्रॉल रिपोर्ट',
    demoMedicalDesc: 'HbA1c 7.9% और बढ़ा हुआ एलडीएल कोलेस्ट्रॉल (168) व स्टेटिन दवा का परामर्श।',
    demoInsuranceTitle: 'स्वास्थ्य बीमा क्लेम रिजेक्शन पत्र',
    demoInsuranceDesc: 'पुरानी बीमारी (PED) 36 माह वेटिंग पीरियड व 20% को-पेमेंट के कारण क्लेम रद्द।',
    inputLabel: 'दस्तावेज़ का पाठ या नोटिस की धारा',
    inputPlaceholder:
      'सूचना, अस्पताल रिपोर्ट या सरकारी पत्र के कठिन वाक्यों को यहां पेस्ट करें या लिखें...',
    speakBtn: 'बोलकर लिखें',
    listeningNow: 'सुन रहे हैं... कृपया बोलिए',
    clearBtn: 'साफ़ करें',
    explainBtn: 'विश्लेषण करें और समझाएं',
    analyzingText: 'दस्तावेज़ का विश्लेषण व सत्यापन किया जा रहा है...',
    charactersCount: 'अक्षर',
    ctrlEnterHint: 'विश्लेषण के लिए Ctrl + Enter दबाएं',
    activeScenario: 'चयनित उदाहरण',

    // Controlled Voice Console
    voiceConsoleTitle: 'आवाज़ इनपुट कंसोल',
    voiceListeningPrompt: 'सुन रहे हैं — बिना जल्दबाजी के अपनी गति से बोलें। बीच में रुकना बिल्कुल ठीक है।',
    voicePausedPrompt: 'रुक गया — आपके बोले गए शब्द सुरक्षित हैं। दोबारा बोलने के लिए "फिर से बोलें" या "विश्लेषण करें" दबाएं।',
    voiceTapToAnalyse: 'विश्लेषण करें',
    voiceTapToCancel: 'रद्द करें',
    voiceResumeListening: 'फिर से बोलें',
    voicePauseListening: 'रोकें',
    voiceEditTranscriptHint: 'विश्लेषण करने से पहले आप शब्दों में बदलाव या सुधार कर सकते हैं।',
    voicePermissionPrompt: 'माइक्रोफ़ोन अनुमति ली जा रही है...',

    // 5 Output Sections
    sectionMeaningTitle: 'दस्तावेज़ का मुख्य सार',
    sectionTermsTitle: 'कठिन शब्दों की परिभाषा',
    sectionActionsTitle: 'आगे क्या कदम उठाएं (चेकलिस्ट)',
    sectionQuestionsTitle: 'अधिकारी या डॉक्टर से पूछने योग्य सवाल',
    sectionWatchoutTitle: 'सावधानी व महत्वपूर्ण समय सीमा',
    uncertaintiesTitle: 'इस दस्तावेज़ में जो बातें स्पष्ट नहीं हैं',
    uncertaintiesDesc: 'मूल पाठ में अनुपस्थित या अधूरी जानकारी। कोई भी कदम उठाने से पहले इनकी पुष्टि अवश्य करें।',
    supportingEvidenceTitle: 'मूल दस्तावेज़ से प्रमाण व उद्धरण',
    disclaimerLegal: 'कानूनी सूचना परामर्श',
    disclaimerMedical: 'चिकित्सीय सूचना परामर्श',
    disclaimerFinancial: 'वित्तीय व बीमा परामर्श',
    disclaimerCivic: 'सामान्य नागरिक सहायता परामर्श',
    listenAloudBtn: 'बोलकर सुनें',
    stopListeningBtn: 'आवाज़ बंद करें',
    listenSection: 'यह अनुभाग सुनें',
    pronounceTerm: 'उच्चारण सुनें',
    copyBtn: 'कॉपी करें',
    copiedBtn: 'कॉपी हो गया!',
    saveForLaterBtn: 'रिकॉर्ड सहेजें',
    savedSuccessBtn: 'सहेजा गया',
    verifiedEvidenceBadge: 'मूल दस्तावेज़ से सत्यापित',
    unverifiedWarningBadge: 'सामान्य परामर्श',
    originalTextQuoteLabel: 'मूल दस्तावेज़ का हूबहू वाक्य:',
    whyItMattersLabel: 'आपके लिए इसका क्या प्रभाव है:',
    actionDoneLabel: 'पूर्ण',
    actionProgress: 'पूर्ण',
    allActionsDone: 'सभी अनुशंसित कदम पूरे कर लिए गए',
    askDoctorOrOfficial: 'अस्पताल या बैंक में यह सवाल पूछें:',

    // Flow 2: Find Public Info
    findHeading: 'आधिकारिक सरकारी आंकड़े एवं विश्लेषण',
    findSubtitle:
      'भारत सरकार के आधिकारिक पोर्टल (data.gov.in) के प्रमाणित आंकड़ों का सरल नागरिक विश्लेषण।',
    selectCatalogTitle: 'डेटा श्रेणी चुनें',
    searchPublicInfoPlaceholder: 'सरकारी योजना, फसल, अस्पताल या विषय खोजें...',
    verifiedSourceBadge: 'आधिकारिक सरकारी स्रोत',
    aiGroundedBadge: 'एआई-सहायता प्राप्त सरल निष्कर्ष',
    mandiTitle: 'दैनिक थोक मंडी भाव',
    mandiDesc: 'विभिन्न राज्यों की मंडियों में गेहूं, आलू, प्याज और सरसों के आज के आधिकारिक थोक भाव।',
    hospitalTitle: 'सरकारी व आयुष्मान भारत अस्पताल',
    hospitalDesc: '24 घंटे इमरजेंसी और मुफ्त आयुष्मान भारत इलाज वाले सरकारी अस्पतालों की आधिकारिक सूची।',
    aqiTitle: 'शहर वायु गुणवत्ता सूचकांक (AQI)',
    aqiDesc: 'वायु प्रदूषण सूचकांक और बुजुर्गों के स्वास्थ्य व सुबह की सैर के लिए परामर्श।',
    educationTitle: 'प्रतियोगी परीक्षाएं व उच्च शिक्षा',
    educationDesc: 'UPSC, SSC, JEE, NEET, बैंकिंग व रक्षा परीक्षाओं की पात्रता, तिथियां, चयन प्रक्रिया व सलाह।',
    educationFilterLabel: 'परीक्षा श्रेणी या वर्ग चुनें',
    conductingBodyLabel: 'आयोजक आयोग / संस्था:',
    targetPostsLabel: 'मिलने वाले पद व करियर:',
    eligibilityLabel: 'शैक्षणिक योग्यता व पात्रता:',
    examStagesLabel: 'चयन प्रक्रिया के चरण:',
    timelinesLabel: '2026 वार्षिक परीक्षा चक्र:',
    officialPortalBtn: 'आधिकारिक पोर्टल खोलें',
    familyGuidanceTip: 'अभिभावकों व परिवार के लिए मार्गदर्शन:',
    filterLabel: 'राज्य या श्रेणी चुनें',
    showInfoBtn: 'आधिकारिक डेटा देखें',
    fetchingData: 'सरकारी रिकॉर्ड प्राप्त किए जा रहे हैं...',
    officialSummaryTitle: 'डेटा का सरल निष्कर्ष',
    practicalAdviceTitle: 'नागरिक परामर्श व सुझाव',
    recordsTableTitle: 'आधिकारिक रिकॉर्ड तालिका',
    sourceBadgeLabel: 'स्रोत: भारत सरकार ओपन डेटा पोर्टल (data.gov.in)',
    liveBadge: 'लाइव डेटा',
    snapshotBadge: 'सत्यापित स्नैपशॉट',

    // Flow 3: Resources Bridge
    resourcesTab: 'संसाधन सेतु',
    resourcesHeading: 'प्रमाणित नागरिक एवं शैक्षिक अवसर',
    resourcesSubtitle: 'सत्यापित सरकारी योजनाएं, हेल्पलाइन, छात्रवृत्तियां, ऋण और डिजिटल नागरिक सेवाएं प्राप्त करें।',
    catAll: 'सभी श्रेणियां',
    catMentors: 'मार्गदर्शक व हेल्पलाइन',
    catScholarships: 'छात्रवृत्तियां व शिक्षा',
    catInternships: 'इंटर्नशिप व अवसर',
    catFunding: 'ऋण व सरकारी अनुदान',
    catTools: 'नागरिक उपकरण व सेवाएं',
    filterTargetLabel: 'लाभार्थी वर्ग',
    searchResourcesPlaceholder: 'योजना या सेवा का नाम लिखकर खोजें...',
    whyItMatchesTitle: 'यह आपके लिए क्यों उपयोगी है',
    missingRequirementsTitle: 'पात्रता संबंधी महत्वपूर्ण जांच',
    eligibilityChecklistTitle: 'मुख्य आवश्यकताएं',
    officialPortalLink: 'आधिकारिक पोर्टल खोलें',
    verifiedDateLabel: 'सत्यापन तिथि:',
    locationLabel: 'क्षेत्र:',
    noResourcesFound: 'कोई संसाधन नहीं मिला। कृपया "सभी श्रेणियां" चुनकर देखें।',

    // Flow 3: Saved Items
    savedHeading: 'सहेजे गए संदर्भ रिकॉर्ड',
    savedSubtitle: 'आपके डिवाइस पर सुरक्षित रिकॉर्ड, जिन्हें बिना दोबारा टाइप किए कभी भी देखा जा सकता है।',
    savedEmptyTitle: 'कोई सहेजा गया रिकॉर्ड नहीं है',
    savedEmptyDesc:
      'किसी भी व्याख्या या सरकारी डेटा के परिणाम पर "रिकॉर्ड सहेजें" बटन दबाकर उसे यहां सुरक्षित रखें।',
    deleteBtn: 'हटाएं',
    confirmDelete: 'क्या आप वाकई इस सहेजे गए रिकॉर्ड को हटाना चाहते हैं?',
    viewDetailsBtn: 'पूरा विवरण देखें',
    savedDossierTitle: 'ऑफ़लाइन संदर्भ विवरण',
    backToList: 'सहेजे गए रिकॉर्ड पर वापस जाएं',

    // Disclaimer
    disclaimerText:
      'सेतु कठिन शब्दों और सरकारी आंकड़ों को समझाने वाला एक सहायक डिजिटल माध्यम है। यह किसी डॉक्टर, वकील या बैंक अधिकारी के आधिकारिक परामर्श का विकल्प नहीं है।',

    // File Attachments
    attachFileBtn: 'फाइल या फोटो जोड़ें',
    attachFileHint: 'PDF, JPG, PNG या TXT फाइल (20MB तक समर्थित)',
    fileAttachedLabel: 'संलग्न दस्तावेज़',
    removeFileBtn: 'हटाएं',
    fileTooLarge: 'फाइल का आकार 20MB से अधिक है। कृपया छोटा दस्तावेज़ चुनें।',
    unsupportedFileType: 'असमर्थित प्रारूप। कृपया PDF, फोटो या TXT फाइल चुनें।',
    explainFileBtn: 'दस्तावेज़ का विश्लेषण करें',
    dragDropNotice: 'दस्तावेज़ संलग्न करने के लिए यहां छोड़ें',
    dismissBanner: 'हटाएं',

    // Errors & Alerts
    errorEmptyInput: 'कृपया कुछ वाक्य लिखें या ऊपर दिए गए उदाहरणों में से कोई एक चुनें।',
    errorFailedFetch: 'अनुरोध पूरा नहीं हो सका। कृपया इंटरनेट जांचें और पुनः प्रयास करें।',
    speechNotSupported: 'इस ब्राउज़र में बोलने की सुविधा उपलब्ध नहीं है। कृपया Google Chrome का उपयोग करें।',

    // Citizen Auth & OTP
    signInBtn: 'साइन इन / खाता बनाएं',
    registerBtn: 'नया खाता बनाएं',
    signOutBtn: 'साइन आउट',
    myAccountTitle: 'मेरा नागरिक खाता',
    signInOrRegisterTitle: 'नागरिक लॉगिन / पंजीकरण',
    signInTab: 'साइन इन करें',
    registerTab: 'नया पंजीकरण',
    fullNameLabel: 'पूरा नाम',
    fullNamePlaceholder: 'अपना पूरा नाम दर्ज करें',
    emailLabel: 'ईमेल पता',
    emailPlaceholder: 'उदा. adisharma9548@gmail.com',
    sendOtpBtn: 'ईमेल पर सत्यापन कोड (OTP) भेजें',
    sendingOtp: 'सत्यापन कोड भेजा जा रहा है...',
    otpSentMessage: 'आपके ईमेल पते पर 6 अंकों का सत्यापन कोड भेज दिया गया है।',
    enterOtpTitle: 'सत्यापन कोड दर्ज करें',
    enterOtpSubtitle: 'कृपया अपने ईमेल पर आया 6-अंकीय कोड यहां दर्ज करें:',
    verifyAndContinueBtn: 'सत्यापित करें और आगे बढ़ें',
    verifyingOtp: 'कोड की पुष्टि की जा रही है...',
    resendOtpBtn: 'कोड दोबारा भेजें',
    resendCountdown: 'कोड पुनः भेजें:',
    otpSpamHint: 'सूचना: यदि इनबॉक्स में ईमेल न मिले तो स्पैम (Spam) या प्रमोशन्स फोल्डर अवश्य देखें।',
    authSuccessGreeting: 'नमस्ते! आप सफलतापूर्वक साइन इन हो चुके हैं।',
    aiEngineSelectorLabel: 'एआई इंजन',
    aiEngineAuto: 'ऑटो (हाइब्रिड)',
    aiEngineGemini: 'जेमिनी 3.1 फ्लैश लाइट',
    aiEngineGroq: 'ग्रोक 120B (अल्ट्रा-फास्ट)',
  },
};

