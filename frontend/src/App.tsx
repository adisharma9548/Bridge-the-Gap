import { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { translations, Language, TranslationDictionary } from './i18n/translations';
import { useSpeech } from './hooks/useSpeech';
import { useAuthSession } from './hooks/useAuthSession';
import { useFontSize } from './hooks/useFontSize';
import { AuthModal } from './components/AuthModal';
import { WelcomePage } from './components/WelcomePage';
import { LegalModal } from './components/LegalModal';
import { UserDashboard } from './components/UserDashboard';
import { IntroWalkthrough } from './components/IntroWalkthrough';
import { PasswordModal } from './components/PasswordModal';
import { Footer } from './components/Footer';
import { MobileNavBar } from './components/MobileNavBar';
import { NavigationHeader } from './components/NavigationHeader';
import { DocumentInputCard } from './components/understand/DocumentInputCard';
import { AnalysisResultCard } from './components/understand/AnalysisResultCard';
import { PublicDataFilter } from './components/public-data/PublicDataFilter';
import { PublicDataTable } from './components/public-data/PublicDataTable';
import { ResourceFilterBar } from './components/resources/ResourceFilterBar';
import { ResourceCard } from './components/resources/ResourceCard';
import { SavedRecordsView } from './components/saved/SavedRecordsView';
import { StatusBanner } from './components/common/StatusBanner';
import { getClientDemoData } from './utils/demoData';
import {
  Tab,
  DemoId,
  CivicResource,
  AttachedFile,
  PublicDataResult,
  SavedItem,
  UnderstandData,
  StatusBannerState,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export default function App() {
  const [lang] = useState<Language>('en');
  useFontSize('normal');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sessionId, setSessionId] = useState<string>('');

  // Flow 1: Understand
  const [inputText, setInputText] = useState<string>('');
  const [activeDemoId, setActiveDemoId] = useState<DemoId>(null);
  const [understandResult, setUnderstandResult] = useState<UnderstandData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isSavedCurrentUnderstand, setIsSavedCurrentUnderstand] = useState<boolean>(false);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);
  const [copiedCaseSummary, setCopiedCaseSummary] = useState<boolean>(false);

  // File Attachment & Banner State
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [statusBanner, setStatusBanner] = useState<StatusBannerState | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Flow 2: Find Public Info
  const [catalogList, setCatalogList] = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('mandi-prices');
  const [selectedFilterVal, setSelectedFilterVal] = useState<string>('Uttar Pradesh');
  const [publicDataResult, setPublicDataResult] = useState<PublicDataResult | null>(null);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
  const [isSavedCurrentData, setIsSavedCurrentData] = useState<boolean>(false);
  const [publicSearchQuery, setPublicSearchQuery] = useState<string>('');

  // Flow 3: Resources Bridge
  const [resourcesList, setResourcesList] = useState<CivicResource[]>([]);
  const [selectedResourceCategory, setSelectedResourceCategory] = useState<string>('all');
  const [selectedResourceTarget, setSelectedResourceTarget] = useState<string>('all');
  const [resourceSearchQuery, setResourceSearchQuery] = useState<string>('');
  const [isFetchingResources, setIsFetchingResources] = useState<boolean>(false);
  const [savedResourceIds, setSavedResourceIds] = useState<Set<string>>(new Set());

  // Flow 4: Saved Items
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [inspectingItem, setInspectingItem] = useState<SavedItem | null>(null);
  const [isLoadingSaved, setIsLoadingSaved] = useState<boolean>(false);

  // Citizen Authentication & AI Engine Provider
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [aiProvider] = useState<'auto' | 'gemini' | 'groq'>('auto');
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState<boolean>(false);

  // Welcome Onboarding Gate & Legal Modal State
  const [isWelcomeAccepted, setIsWelcomeAccepted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('setu_terms_accepted') === 'true';
    }
    return false;
  });
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');
  const [isIntroTourOpen, setIsIntroTourOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);

  // Centralized Auth Session Hook
  const {
    authUser,
    authToken,
    handleAuthSuccess,
    handleLogout,
    handleUpdateProfile,
  } = useAuthSession({
    apiBaseUrl: API_BASE_URL,
    onAuthChange: (token) => {
      loadSavedItems(token);
    },
    onStatusMessage: (banner) => {
      setStatusBanner(banner);
    },
    onLoggedOut: () => {
      setIsAvatarMenuOpen(false);
      setIsWelcomeAccepted(false);
    },
  });

  // Controlled Voice Input State Machine
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    voiceState,
    transcript: voiceTranscript,
    interimTranscript: voiceInterim,
    errorMessage: voiceError,
    startVoiceSession,
    pauseVoiceSession,
    resumeVoiceSession,
    cancelVoiceSession,
    finalizeVoiceSession,
    setTranscript: setVoiceTranscript,
    speechRecognitionSupported,
  } = useSpeech(lang);

  const t: TranslationDictionary = translations[lang];




  // 3. Session Initialization & Catalog Fetch
  useEffect(() => {
    let sid = localStorage.getItem('setu_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem('setu_session_id', sid);
    }
    setSessionId(sid);

    fetch(`${API_BASE_URL}/find/catalog`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.catalog && Array.isArray(data.catalog)) {
          setCatalogList(data.catalog);
        }
      })
      .catch((err) => console.warn('Could not load catalog list:', err));
  }, []);

  // 4. Saved Items Fetch (runs on initial load, session ready, and auth changes)
  useEffect(() => {
    if (sessionId) {
      loadSavedItems();
    }
  }, [sessionId, authToken]);

  const loadSavedItems = async (explicitToken?: string | null) => {
    if (!sessionId) return;
    const token = explicitToken !== undefined ? explicitToken : authToken;
    setIsLoadingSaved(true);
    try {
      const headers: Record<string, string> = { 'x-session-id': sessionId };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/saved`, { headers });
      const data = await res.json();
      if (data?.items) {
        setSavedItems(data.items);
        const resourceIds = new Set<string>();
        data.items.forEach((item: any) => {
          if (item.kind === 'resource' && item.payload?.id) {
            resourceIds.add(item.payload.id);
          }
        });
        setSavedResourceIds(resourceIds);
      }
    } catch (err) {
      console.warn('Failed to fetch saved items:', err);
    } finally {
      setIsLoadingSaved(false);
    }
  };


  // 4. Resources Bridge Fetch
  const fetchResources = async (cat?: string, target?: string, search?: string) => {
    setIsFetchingResources(true);
    try {
      const params = new URLSearchParams();
      const c = cat !== undefined ? cat : selectedResourceCategory;
      const tg = target !== undefined ? target : selectedResourceTarget;
      const s = search !== undefined ? search : resourceSearchQuery;

      if (c && c !== 'all') params.append('category', c);
      if (tg && tg !== 'all') params.append('target', tg);
      if (s && s.trim()) params.append('search', s.trim());

      const res = await fetch(`${API_BASE_URL}/resources?${params.toString()}`);
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setResourcesList(data.data);
      }
    } catch (err) {
      console.warn('Failed to load resources:', err);
    } finally {
      setIsFetchingResources(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'resources') {
      fetchResources();
    }
  }, [activeTab, selectedResourceCategory, selectedResourceTarget]);

  const handleSaveResource = async (resource: CivicResource) => {
    if (!sessionId) return;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const res = await fetch(`${API_BASE_URL}/saved`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          kind: 'resource',
          title: lang === 'hi' ? resource.title_hi : resource.title_en,
          payload: resource,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedResourceIds((prev) => new Set([...prev, resource.id]));
        setStatusBanner({
          type: 'success',
          message: lang === 'hi' ? 'संसाधन सुरक्षित रूप से सहेज लिया गया!' : 'Resource saved to your reference records!',
        });
        loadSavedItems();
      }
    } catch (err) {
      console.warn('Could not save resource:', err);
    }
  };

  // File Upload Handlers
  const handleFileChosen = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      setStatusBanner({ type: 'warning', message: t.fileTooLarge });
      return;
    }

    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    const hasValidMime =
      file.type.startsWith('image/') ||
      file.type === 'application/pdf' ||
      file.type === 'text/plain' ||
      file.type === '';

    if (!hasValidExt && !hasValidMime) {
      setStatusBanner({ type: 'warning', message: t.unsupportedFileType });
      return;
    }

    // If text file, optionally read string into textarea if empty
    if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      const textReader = new FileReader();
      textReader.onload = (e) => {
        const textContent = (e.target?.result as string) || '';
        if (!inputText.trim()) {
          setInputText(textContent);
        }
      };
      textReader.readAsText(file);
    }

    // Read as base64 data URL for API transmission
    const base64Reader = new FileReader();
    base64Reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || '';
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      setAttachedFile({
        name: file.name,
        type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
        size: file.size,
        base64: dataUrl,
        previewUrl,
      });
      setStatusBanner(null);
    };
    base64Reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    if (attachedFile?.previewUrl) {
      URL.revokeObjectURL(attachedFile.previewUrl);
    }
    setAttachedFile(null);
  };

  // One-Tap Demo Scenarios
  const handleBankDemo = () => {
    const text =
      'Notice under Section 13(2) of the SARFAESI Act: Your account is classified as a Non-Performing Asset (NPA) and a lien of Rs. 45,000 has been marked on your Fixed Deposit.';
    setInputText(text);
    setActiveDemoId('bank');
    handleRemoveFile();
    triggerUnderstand(text, 'bank');
  };

  const handleMedicalDemo = () => {
    const text =
      'HbA1c is 7.9% (Elevated). Fasting Lipid Profile shows LDL Cholesterol at 168 mg/dL. Advised strict glycemic control and daily statin therapy.';
    setInputText(text);
    setActiveDemoId('medical');
    handleRemoveFile();
    triggerUnderstand(text, 'medical');
  };

  const handleInsuranceDemo = () => {
    const text =
      'Claim repudiated under Pre-Existing Disease (PED) exclusion clause 4.1 with a mandatory waiting period of 36 months and 20% mandatory co-payment.';
    setInputText(text);
    setActiveDemoId('insurance');
    handleRemoveFile();
    triggerUnderstand(text, 'insurance');
  };

  const triggerUnderstand = async (textToProcess?: string, demoId?: DemoId) => {
    if (isAnalyzing) return;

    const query = (textToProcess !== undefined ? textToProcess : inputText).trim();
    if (!query && !attachedFile) {
      setStatusBanner({ type: 'warning', message: t.errorEmptyInput });
      return;
    }

    if (demoId) {
      setActiveDemoId(demoId);
    }

    setStatusBanner(null);
    setIsAnalyzing(true);
    setUnderstandResult(null);
    setCompletedSteps({});
    setIsSavedCurrentUnderstand(false);
    stopSpeaking();

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const res = await fetch(`${API_BASE_URL}/understand`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: query,
          lang,
          aiProvider,
          file: attachedFile
            ? {
                name: attachedFile.name,
                type: attachedFile.type,
                base64: attachedFile.base64,
              }
            : undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setUnderstandResult(json.data);
      } else {
        const clientFallback = getClientDemoData(query, lang);
        if (clientFallback) {
          setUnderstandResult(clientFallback);
        } else {
          setStatusBanner({ type: 'warning', message: json.error || t.errorFailedFetch });
        }
      }
    } catch (err: any) {
      console.warn('Network call to backend AI failed:', err);
      const clientFallback = getClientDemoData(query, lang);
      if (clientFallback) {
        setUnderstandResult(clientFallback);
      } else {
        setStatusBanner({
          type: 'error',
          message: lang === 'hi' ? 'एआई सेवा से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।' : 'Failed to connect to AI service. Please try again.',
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleCheckStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const handleSaveUnderstand = async () => {
    if (!understandResult || !sessionId) return;
    try {
      const title =
        inputText.slice(0, 52) + (inputText.length > 52 ? '...' : '') || (attachedFile ? attachedFile.name : 'Document Analysis');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      await fetch(`${API_BASE_URL}/saved`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          kind: 'understand',
          title,
          payload: { text: inputText, file_name: attachedFile?.name, result: understandResult },
        }),
      });
      setIsSavedCurrentUnderstand(true);
      loadSavedItems();
    } catch (err) {
      console.warn('Save failed:', err);
    }
  };

  const copyQuestion = (text: string, idx: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedQuestionIndex(idx);
      setTimeout(() => setCopiedQuestionIndex(null), 2000);
    }
  };

  const handleCopyCaseFile = () => {
    if (!understandResult) return;
    const textToCopy = `=== ${t.caseDossierHeader.toUpperCase()} ===\n\n` +
      `Summary:\n${understandResult.summary}\n\n` +
      `Action Steps:\n${understandResult.action_steps.map((s) => `${s.step_number}. ${s.action} (${s.deadline_or_urgency})`).join('\n')}\n\n` +
      (understandResult.matched_resources && understandResult.matched_resources.length > 0
        ? `Connected Official Resources:\n${understandResult.matched_resources.map((r) => `- ${lang === 'hi' ? r.title_hi : r.title_en}: ${r.official_link}`).join('\n')}\n\n`
        : '') +
      `Setu Public Knowledge Platform`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedCaseSummary(true);
      setTimeout(() => setCopiedCaseSummary(false), 2000);
    }
  };

  const triggerQueryPublicData = async () => {
    setIsFetchingData(true);
    setPublicDataResult(null);
    setIsSavedCurrentData(false);
    stopSpeaking();

    try {
      const res = await fetch(`${API_BASE_URL}/find/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedSlug,
          filterValue: selectedFilterVal,
          lang,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setPublicDataResult(json.data);
      } else {
        setStatusBanner({ type: 'warning', message: json.error || t.errorFailedFetch });
      }
    } catch (err) {
      console.error('DataGov query error:', err);
      setStatusBanner({ type: 'warning', message: t.errorFailedFetch });
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleSavePublicData = async () => {
    if (!publicDataResult || !sessionId) return;
    try {
      const title = `${
        lang === 'hi' ? publicDataResult.catalog.title_hi : publicDataResult.catalog.title_en
      } (${publicDataResult.filter_value})`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      await fetch(`${API_BASE_URL}/saved`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          kind: 'public_data',
          title,
          payload: publicDataResult,
        }),
      });
      setIsSavedCurrentData(true);
      loadSavedItems();
    } catch (err) {
      console.warn('Save public data failed:', err);
    }
  };

  const handleDeleteSavedItem = async (id: string) => {
    try {
      const headers: Record<string, string> = { 'x-session-id': sessionId };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      await fetch(`${API_BASE_URL}/saved/${id}`, {
        method: 'DELETE',
        headers,
      });
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
      if (inspectingItem?.id === id) {
        setInspectingItem(null);
      }
      setConfirmDeleteId(null);
    } catch (err) {
      console.warn('Delete item failed:', err);
    }
  };

  const currentCatalog =
    catalogList.find((c) => c.slug === selectedSlug) ||
    (selectedSlug === 'competitive-exams'
      ? {
          filter_options: [
            { label_en: 'All Top Competitive Exams', label_hi: 'सभी प्रमुख प्रतियोगी परीक्षाएं', value: 'All' },
            { label_en: 'Civil Services & Govt (UPSC, SSC, State PSC)', label_hi: 'सिविल सेवा व सरकारी (UPSC, SSC)', value: 'Civil Services & Govt' },
            { label_en: 'Engineering & Technology (JEE, GATE)', label_hi: 'इंजीनियरिंग व तकनीकी (JEE, GATE)', value: 'Engineering & Technology' },
            { label_en: 'Medical & Healthcare (NEET UG/PG)', label_hi: 'मेडिकल व स्वास्थ्य (NEET UG/PG)', value: 'Medical & Healthcare' },
            { label_en: 'Banking & Insurance (IBPS, SBI PO)', label_hi: 'बैंकिंग व बीमा (IBPS, SBI PO)', value: 'Banking & Insurance' },
            { label_en: 'Defence & Armed Forces (NDA, CDS)', label_hi: 'रक्षा व सैन्य सेवाएं (NDA, CDS)', value: 'Defence & Armed Forces' },
            { label_en: 'University & Teaching (CUET, NET)', label_hi: 'विश्वविद्यालय प्रवेश व शिक्षण (CUET, NET)', value: 'University & Teaching' },
          ],
        }
      : selectedSlug === 'hospital-directory'
      ? {
          filter_options: [
            { label_en: 'Delhi', label_hi: 'दिल्ली', value: 'Delhi' },
            { label_en: 'Uttar Pradesh', label_hi: 'उत्तर प्रदेश', value: 'Uttar Pradesh' },
            { label_en: 'Maharashtra', label_hi: 'महाराष्ट्र', value: 'Maharashtra' },
            { label_en: 'Karnataka', label_hi: 'कर्नाटक', value: 'Karnataka' },
          ],
        }
      : selectedSlug === 'air-quality-index' || selectedSlug === 'air-quality'
      ? {
          filter_options: [
            { label_en: 'Delhi', label_hi: 'दिल्ली', value: 'Delhi' },
            { label_en: 'Ghaziabad', label_hi: 'गाज़ियाबाद', value: 'Ghaziabad' },
            { label_en: 'Lucknow', label_hi: 'लखनऊ', value: 'Lucknow' },
            { label_en: 'Mumbai', label_hi: 'मुंबई', value: 'Mumbai' },
            { label_en: 'Bengaluru', label_hi: 'बेंगलुरु', value: 'Bengaluru' },
          ],
        }
      : {
          filter_options: [
            { label_en: 'Uttar Pradesh', label_hi: 'उत्तर प्रदेश', value: 'Uttar Pradesh' },
            { label_en: 'Punjab', label_hi: 'पंजाब', value: 'Punjab' },
            { label_en: 'Maharashtra', label_hi: 'महाराष्ट्र', value: 'Maharashtra' },
            { label_en: 'Madhya Pradesh', label_hi: 'मध्य प्रदेश', value: 'Madhya Pradesh' },
          ],
        });


  // Onboarding & Terms Acceptance Gate
  if (!isWelcomeAccepted) {
    return (
      <WelcomePage
        apiBaseUrl={API_BASE_URL}
        onAuthSuccess={(user, token) => {
          handleAuthSuccess(user, token);
          localStorage.setItem('setu_terms_accepted', 'true');
          setIsWelcomeAccepted(true);
          if (!localStorage.getItem('setu_intro_completed')) {
            setIsIntroTourOpen(true);
          }
        }}
        onContinueGuest={() => {
          localStorage.setItem('setu_terms_accepted', 'true');
          setIsWelcomeAccepted(true);
          if (!localStorage.getItem('setu_intro_completed')) {
            setIsIntroTourOpen(true);
          }
        }}
        onOpenIntroTour={() => setIsIntroTourOpen(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans selection:bg-aubergine-soft selection:text-aubergine">
      {/* 1. ARCHITECTURAL MASTHEAD & TOP NAVIGATION */}
      <NavigationHeader
        activeTab={activeTab}
        inspectingItem={inspectingItem}
        savedCount={savedItems.length}
        onTabChange={(tab) => {
          setActiveTab(tab);
          stopSpeaking();
        }}
        onResetInspecting={() => setInspectingItem(null)}
        onOpenTour={() => setIsIntroTourOpen(true)}
        authUser={authUser}
        isAvatarMenuOpen={isAvatarMenuOpen}
        onToggleAvatarMenu={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
        onCloseAvatarMenu={() => setIsAvatarMenuOpen(false)}
        onOpenChangePassword={() => setIsPasswordModalOpen(true)}
        onSignOut={handleLogout}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12 space-y-8">
        {/* NON-BLOCKING INLINE STATUS BANNER */}
        <StatusBanner
          banner={statusBanner}
          onDismiss={() => setStatusBanner(null)}
          dismissAriaLabel={t.dismissBanner}
        />

        {/* ==================================================================== */}
        {/* TAB 0: CITIZEN DASHBOARD & ACTIVITY HUB                               */}
        {/* ==================================================================== */}
        {activeTab === 'dashboard' && (
          <UserDashboard
            authUser={authUser}
            savedItems={savedItems}
            onNavigateToExplain={() => {
              setActiveTab('understand');
              setInspectingItem(null);
            }}
            onNavigateToResources={() => {
              setActiveTab('resources');
              setInspectingItem(null);
            }}
            onNavigateToPublicData={() => {
              setActiveTab('find');
              setInspectingItem(null);
            }}
            onNavigateToSaved={() => {
              setActiveTab('saved');
              setInspectingItem(null);
            }}
            onInspectItem={(item) => {
              setInspectingItem(item);
              setActiveTab('saved');
            }}
            onDeleteItem={(id) => {
              handleDeleteSavedItem(id);
            }}
            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
            onOpenTour={() => setIsIntroTourOpen(true)}
            onSignOut={handleLogout}
            onUpdateName={handleUpdateProfile}
          />
        )}

        {/* ==================================================================== */}
        {/* TAB 1: UNDERSTAND A DOCUMENT OR WORD                                 */}
        {/* ==================================================================== */}
        {activeTab === 'understand' && !inspectingItem && (
          <div className="space-y-8 animate-fadeIn">
            {/* DOCUMENT INTAKE WORKBENCH */}
            <DocumentInputCard
              inputText={inputText}
              setInputText={setInputText}
              attachedFile={attachedFile}
              activeDemoId={activeDemoId}
              isAnalyzing={isAnalyzing}
              onFileChosen={handleFileChosen}
              onRemoveFile={handleRemoveFile}
              onClear={() => {
                setInputText('');
                handleRemoveFile();
                setActiveDemoId(null);
                setUnderstandResult(null);
                stopSpeaking();
              }}
              onTriggerUnderstand={triggerUnderstand}
              onBankDemo={handleBankDemo}
              onMedicalDemo={handleMedicalDemo}
              onInsuranceDemo={handleInsuranceDemo}
              t={t}
              lang={lang}
              voiceState={voiceState}
              voiceTranscript={voiceTranscript}
              voiceInterim={voiceInterim}
              voiceError={voiceError}
              speechRecognitionSupported={speechRecognitionSupported}
              setVoiceTranscript={setVoiceTranscript}
              startVoiceSession={startVoiceSession}
              pauseVoiceSession={pauseVoiceSession}
              resumeVoiceSession={resumeVoiceSession}
              cancelVoiceSession={cancelVoiceSession}
              finalizeVoiceSession={finalizeVoiceSession}
            />

            {/* 5-PART STRUCTURED EVIDENCE-GROUNDED CASE DOSSIER */}
            {understandResult && (
              <AnalysisResultCard
                understandResult={understandResult}
                lang={lang}
                t={t}
                isSpeaking={isSpeaking}
                onSpeakAloud={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    const fullScript = `${understandResult.summary}. ${
                      understandResult.action_steps?.map((s) => s.action).join('. ') || ''
                    }`;
                    speak(fullScript, lang);
                  }
                }}
                onSpeakSection={(text, customLang) => speak(text, customLang || lang)}
                copiedCaseSummary={copiedCaseSummary}
                onCopyCaseFile={handleCopyCaseFile}
                isSavedCurrentUnderstand={isSavedCurrentUnderstand}
                onSaveUnderstand={handleSaveUnderstand}
                completedSteps={completedSteps}
                onToggleStep={toggleCheckStep}
                copiedQuestionIndex={copiedQuestionIndex}
                onCopyQuestion={copyQuestion}
              />
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: FIND PUBLIC INFORMATION (DATA.GOV.IN + CIVIC AI SUMMARY)     */}
        {/* ==================================================================== */}
        {activeTab === 'find' && (
          <div className="space-y-8 animate-fadeIn">
            <PublicDataFilter
              selectedSlug={selectedSlug}
              onSelectCatalog={(slug, defaultFilter) => {
                setSelectedSlug(slug);
                setSelectedFilterVal(defaultFilter);
                setPublicDataResult(null);
              }}
              selectedFilterVal={selectedFilterVal}
              onFilterChange={setSelectedFilterVal}
              currentCatalog={currentCatalog}
              publicSearchQuery={publicSearchQuery}
              onSearchChange={setPublicSearchQuery}
              onSearchClear={() => setPublicSearchQuery('')}
              onQueryData={triggerQueryPublicData}
              isFetchingData={isFetchingData}
              t={t}
              lang={lang}
            />

            {/* DATA RESULTS */}
            {publicDataResult && (
              <PublicDataTable
                publicDataResult={publicDataResult}
                publicSearchQuery={publicSearchQuery}
                lang={lang}
                t={t}
                isSavedCurrentData={isSavedCurrentData}
                onSavePublicData={handleSavePublicData}
                onSpeak={(text, customLang) => speak(text, customLang || lang)}
              />
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: RESOURCES BRIDGE (MENTORS, SCHOLARSHIPS, INTERNSHIPS, FUNDING) */}
        {/* ==================================================================== */}
        {activeTab === 'resources' && (
          <div className="space-y-8 animate-fadeIn">
            <ResourceFilterBar
              t={t}
              lang={lang}
              selectedResourceCategory={selectedResourceCategory}
              onSelectCategory={(catId) => {
                setSelectedResourceCategory(catId);
                fetchResources(catId, selectedResourceTarget, resourceSearchQuery);
              }}
              selectedResourceTarget={selectedResourceTarget}
              onChangeTarget={(tg) => {
                setSelectedResourceTarget(tg);
                fetchResources(selectedResourceCategory, tg, resourceSearchQuery);
              }}
              resourceSearchQuery={resourceSearchQuery}
              onChangeSearchQuery={(q) => setResourceSearchQuery(q)}
              onSearchClear={() => {
                setResourceSearchQuery('');
                fetchResources(selectedResourceCategory, selectedResourceTarget, '');
              }}
              onSearch={() => fetchResources(selectedResourceCategory, selectedResourceTarget, resourceSearchQuery)}
              isFetchingResources={isFetchingResources}
            />

            {/* Opportunities List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-text-muted block">
                  {lang === 'hi' ? 'सत्यापित अवसर एवं सेवाएं' : 'Verified Opportunities & Public Services'}
                </span>
                <span className="text-xs font-bold text-text-primary">
                  {resourcesList.length} {lang === 'hi' ? 'अवसर उपलब्ध' : 'opportunities available'}
                </span>
              </div>

              {isFetchingResources ? (
                <div className="p-12 text-center bg-surface rounded-2xl border border-border space-y-3">
                  <div className="w-8 h-8 border-3 border-aubergine border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-semibold text-text-secondary">{t.fetchingData}</p>
                </div>
              ) : resourcesList.length === 0 ? (
                <div className="p-12 text-center bg-surface rounded-2xl border border-border space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-raised text-text-muted flex items-center justify-center mx-auto border border-border">
                    <Briefcase className="w-6 h-6 text-aubergine" />
                  </div>
                  <h3 className="text-lg font-extrabold text-text-primary">{t.noResourcesFound}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedResourceCategory('all');
                      setSelectedResourceTarget('all');
                      setResourceSearchQuery('');
                      fetchResources('all', 'all', '');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white font-bold text-xs border-b-2 border-aubergine-hover shadow-xs"
                  >
                    {lang === 'hi' ? 'सभी फिल्टर रीसेट करें' : 'Reset All Filters'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {resourcesList.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      isSaved={savedResourceIds.has(resource.id)}
                      lang={lang}
                      t={t}
                      onSpeak={(text) => speak(text, lang)}
                      onSave={handleSaveResource}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: SAVED RECORDS DOSSIER DIRECTORY                                */}
        {/* ==================================================================== */}
        {activeTab === 'saved' && (
          <SavedRecordsView
            t={t}
            lang={lang}
            inspectingItem={inspectingItem}
            isLoadingSaved={isLoadingSaved}
            savedItems={savedItems}
            confirmDeleteId={confirmDeleteId}
            copiedQuestionIndex={copiedQuestionIndex}
            onSpeak={(text) => speak(text, lang)}
            onSetInspectingItem={setInspectingItem}
            onSetConfirmDeleteId={setConfirmDeleteId}
            onDeleteSavedItem={handleDeleteSavedItem}
            onCopyQuestion={copyQuestion}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setInspectingItem(null);
            }}
          />
        )}
      </main>

      {/* 3. MOBILE FLOATING NAVIGATION BAR (Dignified Architectural Tab Bar) */}
      <MobileNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setInspectingItem(null);
          stopSpeaking();
        }}
        savedCount={savedItems.length}
      />

      {/* 4. STATIC DIGNIFIED CIVIC FOOTER */}
      <Footer
        onOpenTerms={() => {
          setLegalModalTab('terms');
          setIsLegalModalOpen(true);
        }}
        onOpenPrivacy={() => {
          setLegalModalTab('privacy');
          setIsLegalModalOpen(true);
        }}
        onReturnWelcome={() => {
          localStorage.removeItem('setu_terms_accepted');
          setIsWelcomeAccepted(false);
        }}
      />

      {/* 5. CITIZEN AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        apiBaseUrl={API_BASE_URL}
        onOpenForgotPassword={() => {
          setIsAuthModalOpen(false);
          setIsPasswordModalOpen(true);
        }}
      />

      {/* 6. LEGAL TERMS & PRIVACY POLICY MODAL */}
      <LegalModal
        isOpen={isLegalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
        lang={lang}
      />

      {/* 7. INTERACTIVE ONBOARDING TOUR MODAL */}
      <IntroWalkthrough
        isOpen={isIntroTourOpen}
        onClose={() => setIsIntroTourOpen(false)}
        onComplete={() => setIsIntroTourOpen(false)}
        onNavigateTab={(tab: string) => {
          setActiveTab(tab as Tab);
          setIsIntroTourOpen(false);
        }}
      />

      {/* 8. PASSWORD MANAGEMENT MODAL (GMAIL OTP RESET) */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        apiBaseUrl={API_BASE_URL}
        defaultEmail={authUser?.email || ''}
      />
    </div>
  );
}
