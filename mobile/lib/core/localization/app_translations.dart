enum AppLanguage { en, hi }

class AppTranslations {
  static const Map<String, Map<AppLanguage, String>> _strings = {
    // Brand & General
    'brandName': {AppLanguage.en: 'Setu', AppLanguage.hi: 'सेतु'},
    'brandTagline': {
      AppLanguage.en: 'Public Knowledge & Accessibility Platform',
      AppLanguage.hi: 'नागरिक ज्ञान व सहायता मंच',
    },
    'tabExplain': {AppLanguage.en: 'Explain', AppLanguage.hi: 'व्याख्या'},
    'tabFind': {AppLanguage.en: 'Public Data', AppLanguage.hi: 'सार्वजनिक डेटा'},
    'tabResources': {AppLanguage.en: 'Resources', AppLanguage.hi: 'संसाधन'},
    'tabSaved': {AppLanguage.en: 'Saved', AppLanguage.hi: 'सुरक्षित'},

    // Intake & Demos
    'understandHeading': {
      AppLanguage.en: 'Document Action Dossier',
      AppLanguage.hi: 'दस्तावेज़ कार्य योजना व व्याख्या',
    },
    'understandSubtitle': {
      AppLanguage.en: 'Plain-language clarity, verbatim quotes, uncertainties & statutory civic remedies.',
      AppLanguage.hi: 'सरल भाषा में सारांश, मूल उद्धरण, संशय एवं वैधानिक नागरिक सहायता।',
    },
    'sampleNoticesLabel': {
      AppLanguage.en: 'Tap a real-world notice to evaluate:',
      AppLanguage.hi: 'परीक्षण हेतु वास्तविक नोटिस चुनें:',
    },
    'demoBankTitle': {AppLanguage.en: 'SARFAESI Bank Notice', AppLanguage.hi: 'सरफेसी बैंक नोटिस'},
    'demoBankDesc': {
      AppLanguage.en: 'NPA default & fixed deposit lien',
      AppLanguage.hi: 'एनपीए डिफ़ॉल्ट व एफडी लियन',
    },
    'demoMedicalTitle': {AppLanguage.en: 'Clinical Lab Panel', AppLanguage.hi: 'लैब रक्त रिपोर्ट'},
    'demoMedicalDesc': {
      AppLanguage.en: 'Elevated HbA1c 7.9% & statin advice',
      AppLanguage.hi: 'बढ़ी शुगर 7.9% व कोलेस्ट्रॉल',
    },
    'demoInsuranceTitle': {AppLanguage.en: 'Insurance Claim Repudiation', AppLanguage.hi: 'बीमा क्लेम निरस्तीकरण'},
    'demoInsuranceDesc': {
      AppLanguage.en: 'PED Clause 4.1 & 20% co-payment rejection',
      AppLanguage.hi: 'पुरानी बीमारी नियम 4.1 व को-पेमेंट',
    },
    'inputPlaceholder': {
      AppLanguage.en: 'Paste notice text, medical report, legal document, or attach a file...',
      AppLanguage.hi: 'नोटिस का पाठ, मेडिकल रिपोर्ट, कानूनी कागज़ात यहां पेस्ट करें या फाइल जोड़ें...',
    },
    'attachFile': {AppLanguage.en: 'Attach File', AppLanguage.hi: 'फाइल जोड़ें'},
    'removeFile': {AppLanguage.en: 'Remove', AppLanguage.hi: 'हटाएं'},
    'fileAttached': {AppLanguage.en: 'Attached Document:', AppLanguage.hi: 'संलग्न दस्तावेज़:'},
    'supportedFileTypes': {
      AppLanguage.en: 'PDF, JPG, PNG, WEBP, or TXT (up to 20MB)',
      AppLanguage.hi: 'पीडीएफ, जेपीजी, पीएनजी, वेबपी या टीएक्सटी (20MB तक)',
    },
    'voiceInput': {AppLanguage.en: 'Voice Input', AppLanguage.hi: 'आवाज से बोलें'},
    'clear': {AppLanguage.en: 'Clear', AppLanguage.hi: 'साफ करें'},
    'analyseDocument': {AppLanguage.en: 'Analyse Document', AppLanguage.hi: 'दस्तावेज़ समझें'},
    'analysing': {
      AppLanguage.en: 'Generating 5-Stage Case Dossier...',
      AppLanguage.hi: '5-चरणीय केस फाइल तैयार हो रही है...',
    },

    // Voice Console
    'voiceListening': {
      AppLanguage.en: 'Listening... Speak clearly in Hindi or English',
      AppLanguage.hi: 'सुन रहे हैं... स्पष्ट बोलें (हिन्दी या अंग्रेज़ी)',
    },
    'voicePaused': {
      AppLanguage.en: 'Speech paused. Review text below.',
      AppLanguage.hi: 'आवाज रोकी गई। नीचे का पाठ जांचें।',
    },
    'voiceResume': {AppLanguage.en: 'Resume', AppLanguage.hi: 'जारी रखें'},
    'voicePause': {AppLanguage.en: 'Pause', AppLanguage.hi: 'रोकें'},
    'voiceAnalyse': {AppLanguage.en: 'Analyse Spoken Text', AppLanguage.hi: 'बोले गए पाठ का विश्लेषण करें'},
    'voiceCancel': {AppLanguage.en: 'Cancel', AppLanguage.hi: 'रद्द करें'},

    // 5 Stages
    'stage1Title': {
      AppLanguage.en: 'Stage 1: Plain-Language Summary',
      AppLanguage.hi: 'चरण 1: सरल भाषा में सार',
    },
    'stage2Title': {
      AppLanguage.en: 'Stage 2: Verbatim Evidence & Terminology',
      AppLanguage.hi: 'चरण 2: मूल कानूनी उद्धरण व पारिभाषिक शब्द',
    },
    'stage3Title': {
      AppLanguage.en: 'Stage 3: Uncertainties & Missing Facts',
      AppLanguage.hi: 'चरण 3: संशय व दस्तावेज़ में अनुपस्थित तथ्य',
    },
    'stage4Title': {
      AppLanguage.en: 'Stage 4: Action Checklist & Questions',
      AppLanguage.hi: 'चरण 4: त्वरित कदम व अधिकारियों से पूछने योग्य प्रश्न',
    },
    'stage5Title': {
      AppLanguage.en: 'Stage 5: Connected Official Civic Resources',
      AppLanguage.hi: 'चरण 5: जुड़े हुए आधिकारिक नागरिक पोर्टल व हेल्पलाइन',
    },

    // Dossier Details
    'statutoryAdvisory': {AppLanguage.en: 'Statutory Advisory', AppLanguage.hi: 'वैधानिक परामर्श'},
    'supportingQuotes': {AppLanguage.en: 'Supporting Verbatim Quotes', AppLanguage.hi: 'समर्थक मूल उद्धरण'},
    'definedTerms': {AppLanguage.en: 'Key Terms Explained', AppLanguage.hi: 'मुख्य शब्दों का अर्थ'},
    'simpleMeaning': {AppLanguage.en: 'Simple Meaning:', AppLanguage.hi: 'सरल अर्थ:'},
    'whyItMatters': {AppLanguage.en: 'Why It Matters:', AppLanguage.hi: 'यह क्यों महत्वपूर्ण है:'},
    'exactWarning': {AppLanguage.en: 'Statutory Warning / Exact Quote:', AppLanguage.hi: 'सख्त चेतावनी / मूल उद्धरण:'},
    'checklistUrgency': {AppLanguage.en: 'Deadline / Urgency:', AppLanguage.hi: 'समय सीमा / प्राथमिकता:'},
    'questionsForOfficials': {
      AppLanguage.en: 'Questions to Ask Your Official / Physician',
      AppLanguage.hi: 'अधिकारी अथवा चिकित्सक से पूछने योग्य प्रश्न',
    },
    'listenAloud': {AppLanguage.en: 'Listen Aloud', AppLanguage.hi: 'सुनें (बोलकर)'},
    'stopListening': {AppLanguage.en: 'Stop Audio', AppLanguage.hi: 'आवाज रोकें'},
    'copyQuestion': {AppLanguage.en: 'Copy Question', AppLanguage.hi: 'प्रश्न कॉपी करें'},
    'copied': {AppLanguage.en: 'Copied!', AppLanguage.hi: 'कॉपी हो गया!'},
    'saveCaseFile': {AppLanguage.en: 'Save to My Records', AppLanguage.hi: 'मेरे रिकॉर्ड में सहेजें'},
    'savedSuccess': {AppLanguage.en: 'Case File Saved', AppLanguage.hi: 'केस फाइल सहेजी गई'},

    // Civic Resources Card
    'whyMatched': {AppLanguage.en: 'Why this is matched:', AppLanguage.hi: 'यह क्यों जुड़ा है:'},
    'howItAssists': {AppLanguage.en: 'Next Action Step:', AppLanguage.hi: 'अगला कदम:'},
    'prerequisites': {AppLanguage.en: 'Prerequisites & Documents:', AppLanguage.hi: 'आवश्यक दस्तावेज व शर्तें:'},
    'openPortal': {AppLanguage.en: 'Open Official Portal', AppLanguage.hi: 'आधिकारिक पोर्टल खोलें'},
    'verifiedGovtBadge': {AppLanguage.en: 'Verified Statutory Resource', AppLanguage.hi: 'सत्यापित वैधानिक सेवा'},

    // Public Data Flow
    'findHeading': {
      AppLanguage.en: 'Public Data & Civic Directory',
      AppLanguage.hi: 'सार्वजनिक डेटा व सरकारी सेवाएं',
    },
    'findSubtitle': {
      AppLanguage.en: 'Official Mandi crop rates, 24x7 hospitals, AQI, and national exams.',
      AppLanguage.hi: 'दैनिक मंडी भाव, 24x7 सरकारी अस्पताल, वायु गुणवत्ता व प्रतियोगी परीक्षाएं।',
    },
    'selectCatalog': {AppLanguage.en: 'Select Information Category', AppLanguage.hi: 'श्रेणी चुनें'},
    'filterBy': {AppLanguage.en: 'Filter by:', AppLanguage.hi: 'फ़िल्टर करें:'},
    'officialSummary': {AppLanguage.en: 'Grounded Official Summary', AppLanguage.hi: 'आधिकारिक विश्लेषण'},
    'actionableAdvice': {AppLanguage.en: 'Practical Citizen Advice', AppLanguage.hi: 'व्यावहारिक नागरिक सलाह'},

    // Auth Flow
    'account': {AppLanguage.en: 'Citizen Account', AppLanguage.hi: 'नागरिक खाता'},
    'signIn': {AppLanguage.en: 'Sign In', AppLanguage.hi: 'साइन इन करें'},
    'register': {AppLanguage.en: 'Register', AppLanguage.hi: 'नया खाता बनाएं'},
    'signOut': {AppLanguage.en: 'Sign Out', AppLanguage.hi: 'साइन आउट'},
    'emailLabel': {AppLanguage.en: 'Email Address', AppLanguage.hi: 'ईमेल पता'},
    'emailPlaceholder': {AppLanguage.en: 'name@example.com', AppLanguage.hi: 'name@example.com'},
    'nameLabel': {AppLanguage.en: 'Full Name', AppLanguage.hi: 'पूरा नाम'},
    'namePlaceholder': {AppLanguage.en: 'e.g., Aadi Sharma', AppLanguage.hi: 'जैसे, आदि शर्मा'},
    'sendOtp': {AppLanguage.en: 'Send Verification Code', AppLanguage.hi: 'सत्यापन कोड भेजें'},
    'enterOtp': {AppLanguage.en: 'Enter 6-Digit Code', AppLanguage.hi: '6-अंकों का कोड दर्ज करें'},
    'verifyOtp': {AppLanguage.en: 'Verify & Sign In', AppLanguage.hi: 'सत्यापित करें व प्रवेश करें'},
    'otpHint': {
      AppLanguage.en: 'A 6-digit code was sent to your email. No passwords needed.',
      AppLanguage.hi: 'आपके ईमेल पर 6 अंकों का कोड भेजा गया है। पासवर्ड की आवश्यकता नहीं है।',
    },
    'signedInAs': {AppLanguage.en: 'Signed in as', AppLanguage.hi: 'लॉग इन किया गया:'},
    'resendOtp': {AppLanguage.en: 'Resend Code', AppLanguage.hi: 'पुनः कोड भेजें'},

    // Saved Records
    'savedHeading': {AppLanguage.en: 'Saved Case Files & Records', AppLanguage.hi: 'सहेजे गए केस फाइल व रिकॉर्ड'},
    'savedSubtitle': {
      AppLanguage.en: 'Synchronized with your Setu account across mobile and web.',
      AppLanguage.hi: 'आपके सेतु खाते के साथ मोबाइल और वेब दोनों पर सिंक किए गए।',
    },
    'noSavedRecords': {
      AppLanguage.en: 'No saved case files yet. Analyse a document or public query and tap "Save".',
      AppLanguage.hi: 'अभी कोई सुरक्षित केस फाइल नहीं है। किसी दस्तावेज़ की व्याख्या कर "सहेजें" दबाएं।',
    },
    'deleteRecord': {AppLanguage.en: 'Delete', AppLanguage.hi: 'हटाएं'},
    'viewCaseFile': {AppLanguage.en: 'Open Dossier', AppLanguage.hi: 'केस फाइल खोलें'},

    // Server & Diagnostics
    'serverSettings': {AppLanguage.en: 'Server Connection', AppLanguage.hi: 'सर्वर सेटिंग्स'},
    'serverUrl': {AppLanguage.en: 'API Base URL', AppLanguage.hi: 'एपीआई पता'},
    'save': {AppLanguage.en: 'Save', AppLanguage.hi: 'सहेजें'},
    'resetDefault': {AppLanguage.en: 'Reset to Default', AppLanguage.hi: 'डिफ़ॉल्ट पर रीसेट करें'},
    'online': {AppLanguage.en: 'Server Connected', AppLanguage.hi: 'सर्वर कनेक्टेड'},
    'offline': {AppLanguage.en: 'Server Unreachable', AppLanguage.hi: 'सर्वर से संपर्क नहीं'},
  };

  static String text(String key, AppLanguage lang) {
    final entry = _strings[key];
    if (entry == null) return key;
    return entry[lang] ?? entry[AppLanguage.en] ?? key;
  }
}
