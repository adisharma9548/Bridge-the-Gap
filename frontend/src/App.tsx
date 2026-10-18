import { useState, useEffect } from 'react';
import {
  FileText,
  Bookmark,
  Trash2,
  Volume2,
  Briefcase,
  CheckCircle2,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
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
import { StatusBanner } from './components/common/StatusBanner';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { EmptyState } from './components/common/EmptyState';
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
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="space-y-2 border-b border-border pb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aubergine-soft text-aubergine border border-aubergine/20 text-xs font-bold">
                <Bookmark className="w-3.5 h-3.5 text-aubergine" />
                <span>Anonymous Offline Persistence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                {t.savedHeading}
              </h1>
              <p className="text-text-secondary text-base font-normal max-w-3xl leading-relaxed">
                {t.savedSubtitle}
              </p>
            </div>

            {inspectingItem ? (
              /* Full Detailed Dossier Inspector View */
              <div className="bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-6 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <span className="text-xs font-bold text-aubergine bg-aubergine-soft px-2.5 py-0.5 rounded border border-aubergine/20">
                      {inspectingItem.kind === 'understand'
                        ? 'Document Breakdown'
                        : inspectingItem.kind === 'resource'
                        ? 'Civic Resource'
                        : 'Public Data Query'}
                    </span>
                    <h2 className="text-xl font-extrabold text-text-primary mt-1">
                      {inspectingItem.title}
                    </h2>
                    <span className="text-xs text-text-muted font-medium mt-0.5 block">
                      Saved on {new Date(inspectingItem.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const content =
                          inspectingItem.kind === 'understand'
                            ? inspectingItem.payload?.result?.summary
                            : inspectingItem.kind === 'resource'
                            ? `${inspectingItem.title}. ${lang === 'hi' ? inspectingItem.payload?.description_hi : inspectingItem.payload?.description_en}. ${lang === 'hi' ? inspectingItem.payload?.why_it_matches_hi : inspectingItem.payload?.why_it_matches_en}`
                            : inspectingItem.payload?.summary?.summary;
                        if (content) speak(content, lang);
                      }}
                      className="px-4 py-2 rounded-xl bg-surface-raised hover:bg-surface-muted text-text-primary font-bold text-xs border border-border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-aubergine" />
                      <span>{t.listenAloudBtn}</span>
                    </button>
                    {confirmDeleteId === inspectingItem.id ? (
                      <div className="flex items-center gap-1.5 animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedItem(inspectingItem.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-semantic-error hover:bg-semantic-error/90 text-white font-bold text-xs cursor-pointer shadow-xs border-b-2 border-semantic-error/80"
                        >
                          {t.deleteBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3.5 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-muted text-text-secondary font-bold text-xs cursor-pointer border border-border"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(inspectingItem.id)}
                        className="px-3.5 py-2 rounded-xl bg-semantic-error-soft hover:bg-semantic-error/20 text-semantic-error border border-semantic-error/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.deleteBtn}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Flow 1 Full Dossier when inspected */}
                {inspectingItem.kind === 'understand' && (
                  <div className="space-y-6">
                    {/* Original Source */}
                    <div className="p-4 rounded-xl bg-surface-raised border border-border">
                      <span className="text-xs uppercase font-extrabold text-text-muted block mb-1">
                        Original Document Text / File:
                      </span>
                      <p className="text-sm font-medium text-text-primary leading-relaxed">
                        {inspectingItem.payload?.text || inspectingItem.payload?.file_name}
                      </p>
                    </div>

                    {/* Summary & Advisory */}
                    <div className="space-y-3">
                      <div className="p-5 rounded-xl bg-surface-raised border-l-4 border-aubergine border border-border space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs uppercase font-extrabold text-aubergine">
                            {t.sectionMeaningTitle}
                          </span>
                          {inspectingItem.payload?.result?.reading_level && (
                            <span className="text-[10px] font-bold text-aubergine bg-aubergine-soft px-2 py-0.5 rounded border border-aubergine/20">
                              {inspectingItem.payload.result.reading_level}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-text-primary text-base leading-relaxed">
                          {inspectingItem.payload?.result?.summary}
                        </p>
                      </div>

                      {inspectingItem.payload?.result?.disclaimer && (
                        <div className="p-3.5 rounded-xl bg-surface-muted border border-border text-xs flex items-start gap-2 text-text-secondary">
                          <Info className="w-4 h-4 text-aubergine shrink-0 mt-0.5" />
                          <p className="font-medium leading-relaxed">
                            {inspectingItem.payload.result.disclaimer}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Grounded Verbatim Evidence */}
                    {inspectingItem.payload?.result?.grounded_evidence?.length > 0 && (
                      <div className="space-y-3">
                        <div className="border-b border-border pb-2">
                          <h3 className="text-sm uppercase font-extrabold tracking-wider text-text-primary">
                            {t.groundedEvidenceTitle}
                          </h3>
                          <span className="text-xs text-text-secondary font-medium">
                            {t.groundedEvidenceSubtitle}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {inspectingItem.payload.result.grounded_evidence.map((item: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-xl bg-surface border border-border space-y-2.5 shadow-2xs">
                              <div className="p-3 rounded-lg bg-surface-raised border-l-4 border-aubergine border border-border">
                                <span className="font-bold text-aubergine block text-[10px] uppercase tracking-wider mb-1">
                                  {t.verbatimQuoteLabel}
                                </span>
                                <p className="italic font-mono text-xs sm:text-sm text-text-primary leading-relaxed">
                                  &ldquo;{item.quote}&rdquo;
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="font-bold text-text-primary block text-[10px] uppercase tracking-wider">
                                  {t.plainMeaningLabel}
                                </span>
                                <p className="text-xs sm:text-sm text-text-secondary font-medium leading-relaxed">
                                  {item.plain_meaning}
                                </p>
                              </div>
                              {item.why_it_matters && (
                                <div className="text-xs text-aubergine bg-aubergine-soft/50 p-2 rounded-lg flex items-start gap-1.5 border border-aubergine/20">
                                  <Info className="w-3.5 h-3.5 text-aubergine shrink-0 mt-0.5" />
                                  <span>{item.why_it_matters}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Terms */}
                    {inspectingItem.payload?.result?.terms_explained?.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-xs uppercase font-extrabold text-text-muted tracking-wider block">
                          {t.sectionTermsTitle}
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {inspectingItem.payload.result.terms_explained.map((termItem: any, idx: number) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-surface border border-border space-y-1.5 shadow-2xs">
                              <div className="flex justify-between items-baseline border-b border-border pb-1.5">
                                <span className="font-extrabold text-text-primary text-sm">{termItem.term}</span>
                                <span className="text-xs font-semibold text-aubergine bg-aubergine-soft px-2 py-0.5 rounded border border-aubergine/20">
                                  {termItem.phonetic}
                                </span>
                              </div>
                              <p className="text-xs text-text-secondary font-medium">{termItem.simple_meaning}</p>
                              {termItem.why_it_matters && (
                                <p className="text-[11px] text-aubergine font-medium pt-1 border-t border-border">
                                  {termItem.why_it_matters}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uncertainties */}
                    {inspectingItem.payload?.result?.uncertainties?.length > 0 && (
                      <div className="p-4 rounded-xl border-2 border-semantic-warning/40 bg-semantic-warning-soft space-y-2 shadow-2xs">
                        <div className="flex items-center gap-2 text-semantic-warning">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <h4 className="text-xs uppercase font-extrabold tracking-wider">
                            {t.uncertaintiesTitle}
                          </h4>
                        </div>
                        <ul className="space-y-1.5 pt-1">
                          {inspectingItem.payload.result.uncertainties.map((unc: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-semantic-warning font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-semantic-warning mt-1.5 shrink-0"></span>
                              <span>{unc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    {inspectingItem.payload?.result?.action_steps?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs uppercase font-extrabold text-text-muted tracking-wider block">
                          {t.sectionActionsTitle}
                        </span>
                        {inspectingItem.payload.result.action_steps.map((actionItem: any) => (
                          <div key={actionItem.step_number} className="p-3 rounded-xl bg-surface border border-border text-sm flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-aubergine-soft text-aubergine font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {actionItem.step_number}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-text-primary">{actionItem.action}</span>
                              <span className="block text-xs text-text-muted mt-0.5">Deadline: {actionItem.deadline_or_urgency}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Questions to Ask */}
                    {inspectingItem.payload?.result?.questions_to_ask?.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="text-xs uppercase font-extrabold text-text-muted tracking-wider block">
                          {t.sectionQuestionsTitle}
                        </span>
                        {inspectingItem.payload.result.questions_to_ask.map((q: string, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-text-primary">
                            <p className="min-w-0">&ldquo;{q}&rdquo;</p>
                            <button
                              type="button"
                              onClick={() => copyQuestion(q, idx)}
                              className="px-2.5 py-1 rounded bg-surface hover:bg-surface-muted border border-border text-xs font-bold text-text-primary cursor-pointer shadow-2xs shrink-0"
                            >
                              {copiedQuestionIndex === idx ? t.copiedBtn : t.copyBtn}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Matched Resources (The Bridge in Saved Records) */}
                    {inspectingItem.payload?.result?.matched_resources?.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-aubergine" />
                            <h3 className="text-sm uppercase font-extrabold tracking-wider text-text-primary">
                              {t.matchedResourcesTitle}
                            </h3>
                          </div>
                          <span className="text-xs font-bold text-semantic-success bg-semantic-success-soft px-2 py-0.5 rounded border border-semantic-success/30">
                            {inspectingItem.payload.result.matched_resources.length} Official Portals
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {inspectingItem.payload.result.matched_resources.map((res: any) => (
                            <div key={res.id} className="p-4 rounded-xl border border-border bg-surface space-y-3 shadow-2xs flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2 border-b border-border pb-2">
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-text-muted block">
                                      {lang === 'hi' ? res.provider_hi : res.provider_en}
                                    </span>
                                    <h4 className="font-bold text-text-primary text-sm mt-0.5">
                                      {lang === 'hi' ? res.title_hi : res.title_en}
                                    </h4>
                                  </div>
                                  <span className="text-[10px] font-bold text-aubergine bg-aubergine-soft px-2 py-0.5 rounded border border-aubergine/20 shrink-0">
                                    {res.verified_source}
                                  </span>
                                </div>

                                <div className="p-2.5 rounded-lg bg-aubergine-soft/50 border border-aubergine/20 text-xs">
                                  <span className="font-bold text-aubergine block text-[10px] uppercase mb-0.5">
                                    {t.resourceWhyMatched}
                                  </span>
                                  <p className="text-text-primary font-medium">
                                    {lang === 'hi' ? res.relevance_reason_hi : res.relevance_reason_en}
                                  </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-semantic-success-soft border border-semantic-success/20 text-xs">
                                  <span className="font-bold text-semantic-success block text-[10px] uppercase mb-0.5">
                                    {t.resourceActionConnection}
                                  </span>
                                  <p className="text-text-primary font-medium">
                                    {lang === 'hi' ? res.action_connection_hi : res.action_connection_en}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-2">
                                <a
                                  href={res.official_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-2 px-3 rounded-lg bg-aubergine hover:bg-aubergine-hover text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                                >
                                  <span>{t.officialPortalBtn}</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Flow 2 Full Dossier when inspected */}
                {inspectingItem.kind === 'public_data' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl bg-surface-raised border-l-4 border-aubergine border border-border">
                      <span className="text-xs uppercase font-extrabold text-aubergine block mb-1">
                        {t.officialSummaryTitle}
                      </span>
                      <p className="font-semibold text-text-primary text-base leading-relaxed">
                        {inspectingItem.payload?.summary?.summary}
                      </p>
                    </div>

                    {inspectingItem.payload?.rows?.length > 0 && (
                      <div className="overflow-hidden rounded-xl border border-border">
                        <table className="w-full text-left border-collapse bg-surface text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-surface-raised border-b border-border text-text-primary font-bold">
                              {Object.keys(inspectingItem.payload.rows[0] || {}).map((col) => (
                                <th key={col} className="p-2.5 capitalize">{col.replace(/_/g, ' ')}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border font-medium text-text-primary">
                            {inspectingItem.payload.rows.map((row: any, rIdx: number) => (
                              <tr key={rIdx} className="hover:bg-surface-raised">
                                {Object.values(row).map((val: any, cIdx) => (
                                  <td key={cIdx} className="p-2.5">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Flow 3 Full Dossier when inspected */}
                {inspectingItem.kind === 'resource' && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-aubergine bg-aubergine-soft px-2.5 py-0.5 rounded border border-aubergine/20 capitalize">
                        {inspectingItem.payload?.category?.replace(/-/g, ' ')}
                      </span>
                      <span className="text-xs font-semibold text-text-muted bg-surface-raised px-2 py-0.5 rounded border border-border">
                        {inspectingItem.payload?.location_coverage}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-semantic-success bg-semantic-success-soft px-2.5 py-0.5 rounded-full border border-semantic-success/30">
                        <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
                        Verified: {inspectingItem.payload?.verification_date} &bull; {inspectingItem.payload?.verified_source}
                      </span>
                    </div>

                    <div className="p-5 rounded-xl bg-surface-raised border-l-4 border-aubergine border border-border space-y-2">
                      <span className="text-xs uppercase font-extrabold text-aubergine block">
                        {lang === 'hi' ? 'संसाधन विवरण' : 'Resource Overview'}
                      </span>
                      <p className="font-semibold text-text-primary text-base leading-relaxed">
                        {lang === 'hi' ? inspectingItem.payload?.description_hi : inspectingItem.payload?.description_en}
                      </p>
                      <span className="text-xs text-text-muted block font-medium">
                        Provider: {lang === 'hi' ? inspectingItem.payload?.provider_hi : inspectingItem.payload?.provider_en}
                      </span>
                    </div>

                    {/* Why this matches */}
                    <div className="p-4 rounded-xl bg-aubergine-soft/50 border border-aubergine/20 space-y-1.5">
                      <span className="text-xs font-extrabold uppercase text-aubergine flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-aubergine" />
                        {t.whyItMatchesTitle}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
                        {lang === 'hi' ? inspectingItem.payload?.why_it_matches_hi : inspectingItem.payload?.why_it_matches_en}
                      </p>
                    </div>

                    {/* Eligibility criteria */}
                    {inspectingItem.payload?.eligibility_requirements_en && (
                      <div className="space-y-2">
                        <span className="text-xs uppercase font-extrabold text-text-muted tracking-wider block">
                          {t.eligibilityChecklistTitle}
                        </span>
                        <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                          {(lang === 'hi'
                            ? inspectingItem.payload?.eligibility_requirements_hi
                            : inspectingItem.payload?.eligibility_requirements_en
                          )?.map((crit: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-text-secondary font-medium">
                              <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0 mt-0.5" />
                              <span>{crit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing requirements warning */}
                    <div className="p-4 rounded-xl bg-semantic-warning-soft border border-semantic-warning/30 space-y-1.5">
                      <span className="text-xs font-extrabold uppercase text-semantic-warning flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {t.missingRequirementsTitle}
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-semantic-warning leading-relaxed">
                        {lang === 'hi'
                          ? inspectingItem.payload?.missing_requirements_warning_hi
                          : inspectingItem.payload?.missing_requirements_warning_en}
                      </p>
                    </div>

                    {/* Portal link */}
                    {inspectingItem.payload?.official_link && (
                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <span className="text-xs text-text-muted font-mono truncate max-w-sm">
                          {inspectingItem.payload.official_link}
                        </span>
                        <a
                          href={inspectingItem.payload.official_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white font-bold text-xs shadow-xs border-b-2 border-aubergine-hover"
                        >
                          <span>{t.officialPortalLink}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Saved List */
              <div className="space-y-3">
                {isLoadingSaved ? (
                  <div className="bg-surface rounded-2xl border border-border p-8 text-center shadow-subtle">
                    <LoadingSpinner label="Loading your saved records..." size="lg" centered />
                  </div>
                ) : savedItems.length === 0 ? (
                  <EmptyState
                    icon={Bookmark}
                    title={t.savedEmptyTitle}
                    description={t.savedEmptyDesc}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('understand');
                        setInspectingItem(null);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer border-b-2 border-aubergine-hover"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Explain a Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('resources');
                        setInspectingItem(null);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-raised hover:bg-surface-muted text-text-primary border border-border text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-aubergine" />
                      <span>Browse Civic Resources</span>
                    </button>
                  </EmptyState>
                ) : (
                  savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-xl bg-surface border border-border shadow-subtle flex flex-wrap items-center justify-between gap-4 hover:border-border-strong transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-aubergine-soft text-aubergine border border-aubergine/20">
                            {item.kind === 'understand'
                              ? 'Document'
                              : item.kind === 'resource'
                              ? 'Civic Resource'
                              : 'Public Data'}
                          </span>
                          <span className="text-xs text-text-muted font-medium">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-text-primary">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectingItem(item)}
                          className="px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-hover active:bg-[#4E2E5B] text-white font-bold text-xs border-b-2 border-aubergine-hover transition-all cursor-pointer shadow-xs"
                        >
                          {t.viewDetailsBtn}
                        </button>
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1.5 animate-fadeIn">
                            <button
                              type="button"
                              onClick={() => handleDeleteSavedItem(item.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-semantic-error hover:bg-semantic-error/90 text-white font-bold text-xs cursor-pointer shadow-xs border-b-2 border-semantic-error/80"
                            >
                              {t.deleteBtn}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3.5 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-muted text-text-secondary font-bold text-xs cursor-pointer border border-border"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="p-2.5 rounded-xl bg-semantic-error-soft hover:bg-semantic-error/20 text-semantic-error border border-semantic-error/30 transition-all cursor-pointer shadow-2xs"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
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
