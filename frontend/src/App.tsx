import { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Search,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Volume2,
  VolumeX,
  Mic,
  Pause,
  Briefcase,
  Users,
  Award,
  CheckCircle2,
  Landmark,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Check,
  CheckSquare,
  Square,
  AlertTriangle,
  Info,
  Sparkles,
  Clock,
  Building2,
  Wheat,
  Wind,
  RotateCcw,
  Copy,
  Paperclip,
  Upload,
  X,
  GraduationCap,
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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<StatusBannerState | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChosen(e.dataTransfer.files[0]);
    }
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

  // Action steps completion calculation
  const totalSteps = understandResult?.action_steps?.length || 0;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;

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
            {/* Editorial Heading Section */}
            <div className="space-y-2 border-b border-border pb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aubergine-soft text-aubergine border border-aubergine/20 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plain Language Assistance &bull; AI Powered</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                {t.understandHeading}
              </h1>
              <p className="text-text-secondary text-base font-normal max-w-3xl leading-relaxed">
                {t.understandSubtitle}
              </p>
            </div>

            {/* COMPACT SAMPLE REAL-WORLD NOTICES SELECTOR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-raised border border-border shadow-2xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-aubergine shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  {t.sampleNoticesLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleBankDemo}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                    activeDemoId === 'bank'
                      ? 'bg-aubergine text-white border-aubergine shadow-2xs'
                      : 'bg-surface hover:bg-surface-muted text-text-primary border-border'
                  }`}
                  title={t.demoBankDesc}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>{t.demoBankTitle}</span>
                </button>

                <button
                  type="button"
                  onClick={handleMedicalDemo}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                    activeDemoId === 'medical'
                      ? 'bg-aubergine text-white border-aubergine shadow-2xs'
                      : 'bg-surface hover:bg-surface-muted text-text-primary border-border'
                  }`}
                  title={t.demoMedicalDesc}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{t.demoMedicalTitle}</span>
                </button>

                <button
                  type="button"
                  onClick={handleInsuranceDemo}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                    activeDemoId === 'insurance'
                      ? 'bg-aubergine text-white border-aubergine shadow-2xs'
                      : 'bg-surface hover:bg-surface-muted text-text-primary border-border'
                  }`}
                  title={t.demoInsuranceDesc}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{t.demoInsuranceTitle}</span>
                </button>
              </div>
            </div>

            {/* DOCUMENT INTAKE WORKBENCH */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative bg-surface rounded-2xl border transition-all shadow-card p-5 sm:p-6 space-y-4 ${
                isDragging ? 'border-aubergine ring-4 ring-aubergine-soft bg-aubergine-soft/10' : 'border-border'
              }`}
            >
              {/* Drag & Drop Visual Overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-aubergine/10 backdrop-blur-[1px] border-2 border-dashed border-aubergine rounded-2xl flex flex-col items-center justify-center z-20 pointer-events-none p-4 animate-fadeIn">
                  <Upload className="w-10 h-10 text-aubergine animate-bounce mb-2" />
                  <p className="text-base font-bold text-text-primary">{t.dragDropNotice}</p>
                  <span className="text-xs text-text-secondary font-medium">{t.attachFileHint}</span>
                </div>
              )}

              {/* CONTROLLED VOICE DICTATION CONSOLE */}
              {voiceState !== 'idle' && (
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-aubergine/30 bg-aubergine-soft/30 shadow-md space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-aubergine/20">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                        voiceState === 'listening' ? 'bg-semantic-error text-white animate-pulse' : 'bg-aubergine-soft text-aubergine'
                      }`}>
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-text-primary">
                          {t.voiceConsoleTitle}
                        </h4>
                        <p className="text-xs font-semibold text-text-secondary">
                          {voiceState === 'requesting_permission'
                            ? t.voicePermissionPrompt
                            : voiceState === 'listening'
                            ? t.voiceListeningPrompt
                            : voiceState === 'paused'
                            ? t.voicePausedPrompt
                            : voiceError || t.voicePausedPrompt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {voiceState === 'listening' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-semantic-error text-white animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          Listening Live
                        </span>
                      )}
                      {voiceState === 'paused' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-semantic-warning-soft text-semantic-warning border border-semantic-warning/30">
                          <Pause className="w-3 h-3" />
                          Paused (Words Safe)
                        </span>
                      )}
                      {voiceState === 'error' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-semantic-error-soft text-semantic-error border border-semantic-error/30">
                          <AlertTriangle className="w-3 h-3" />
                          Error
                        </span>
                      )}
                    </div>
                  </div>

                  {voiceError && (
                    <div className="p-3 rounded-xl bg-semantic-error-soft text-semantic-error text-xs font-bold border border-semantic-error/30 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{voiceError}</span>
                    </div>
                  )}

                  {/* Live Editable Transcript Area */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-text-muted">
                      <span>{t.voiceEditTranscriptHint}</span>
                      <span>{voiceTranscript.length} characters</span>
                    </div>
                    <textarea
                      value={voiceTranscript}
                      onChange={(e) => setVoiceTranscript(e.target.value)}
                      placeholder={lang === 'hi' ? 'आपके द्वारा बोले गए शब्द यहां दिखाई देंगे...' : 'Your spoken words will appear here...'}
                      rows={3}
                      className="w-full p-3 rounded-xl border-2 border-border-strong bg-surface text-text-primary font-medium text-sm sm:text-base outline-none focus:border-aubergine focus:ring-2 focus:ring-aubergine-soft transition-all resize-y"
                    />
                    {voiceInterim && (
                      <p className="text-xs text-aubergine italic font-medium px-1">
                        &ldquo;{voiceInterim}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-aubergine/20">
                    <div className="flex items-center gap-2">
                      {voiceState === 'listening' ? (
                        <button
                          type="button"
                          onClick={() => pauseVoiceSession()}
                          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-semantic-warning-soft hover:bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30 flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>{t.voicePauseListening}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => resumeVoiceSession(lang)}
                          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-semantic-success hover:bg-semantic-success/90 text-white border-b-2 border-semantic-success/80 flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>{t.voiceResumeListening}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => cancelVoiceSession()}
                        className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-surface-muted hover:bg-border text-text-secondary border border-border flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{t.voiceTapToCancel}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={!voiceTranscript.trim()}
                      onClick={() => {
                        const finalWords = finalizeVoiceSession();
                        const fullText = (inputText ? `${inputText} ${finalWords}` : finalWords).trim();
                        setInputText(fullText);
                        if (fullText) {
                          triggerUnderstand(fullText);
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white border-b-4 border-[#A83D1B] active:border-b-0 active:translate-y-0.5 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Sparkles className="w-4 h-4 text-brass" />
                      <span>{t.voiceTapToAnalyse}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label
                  htmlFor="clause-input"
                  className="block text-sm font-bold text-text-primary uppercase tracking-wider"
                >
                  {t.inputLabel}
                </label>
                <div className="flex items-center gap-3 text-xs text-text-secondary font-medium">
                  <span className="hidden sm:inline">{t.ctrlEnterHint}</span>
                  <span>
                    {inputText.length} {t.charactersCount}
                  </span>
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="clause-input"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (activeDemoId) setActiveDemoId(null);
                  }}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      triggerUnderstand();
                    }
                  }}
                  placeholder={
                    attachedFile
                      ? (lang === 'hi'
                          ? 'वैकल्पिक: संलग्न दस्तावेज़ के बारे में कोई विशेष प्रश्न या निर्देश यहां लिखें...'
                          : 'Optional: Add any specific questions or notes about your attached document here...')
                      : t.inputPlaceholder
                  }
                  rows={3}
                  className="w-full p-4 rounded-xl border border-border focus:border-aubergine focus:ring-2 focus:ring-aubergine-soft bg-surface font-normal text-text-primary resize-y min-h-[110px] outline-none text-base transition-all"
                />
              </div>

              {/* ATTACHED FILE PREVIEW CHIP */}
              {attachedFile && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-aubergine-soft/50 border border-aubergine/20 animate-fadeIn">
                  <div className="flex items-center gap-3 min-w-0">
                    {attachedFile.previewUrl ? (
                      <img
                        src={attachedFile.previewUrl}
                        alt="Scan preview"
                        className="w-12 h-12 rounded-lg object-cover border border-aubergine/20 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-surface text-aubergine border border-aubergine/20 flex items-center justify-center font-bold shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-text-primary truncate max-w-[260px] sm:max-w-md">
                          {attachedFile.name}
                        </span>
                        <span className="text-[11px] font-bold text-aubergine bg-surface px-2 py-0.5 rounded-full border border-aubergine/20 shrink-0">
                          {(attachedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary font-medium mt-0.5">
                        {t.fileAttachedLabel} &bull; Multimodal Gemini 2.5 Flash ready
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="min-h-[38px] px-3.5 rounded-xl bg-semantic-error-soft hover:bg-semantic-error/20 text-semantic-error border border-semantic-error/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{t.removeFileBtn}</span>
                  </button>
                </div>
              )}

              {/* ACTION TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChosen(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="file-attachment-input"
                  />

                  {/* Attach Document / Scan Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`min-h-[46px] px-4 rounded-xl text-sm flex items-center gap-2 border transition-all cursor-pointer shadow-xs ${
                      attachedFile
                        ? 'bg-aubergine hover:bg-aubergine-hover text-white border-aubergine-hover font-black shadow-sm'
                        : 'bg-surface-raised hover:bg-surface-muted text-text-primary border-border font-bold'
                    }`}
                    title={t.attachFileHint}
                  >
                    <Paperclip className={`w-4 h-4 ${attachedFile ? 'text-white' : 'text-aubergine'}`} />
                    <span>{attachedFile ? t.fileAttachedLabel : t.attachFileBtn}</span>
                  </button>

                  {/* Voice Dictation Button */}
                  <button
                    type="button"
                    disabled={!speechRecognitionSupported}
                    title={!speechRecognitionSupported ? t.speechNotSupported : t.speakBtn}
                    onClick={() => {
                      if (voiceState === 'idle') {
                        startVoiceSession(lang);
                      } else if (voiceState === 'listening') {
                        pauseVoiceSession();
                      } else if (voiceState === 'paused') {
                        resumeVoiceSession(lang);
                      }
                    }}
                    className={`min-h-[46px] px-4 rounded-xl text-sm flex items-center gap-2 border transition-all cursor-pointer shadow-xs ${
                      !speechRecognitionSupported
                        ? 'opacity-40 cursor-not-allowed bg-surface-muted border-border text-text-muted font-bold'
                        : voiceState === 'listening'
                        ? 'bg-semantic-error text-white border-semantic-error ring-4 ring-semantic-error-soft animate-pulse font-black'
                        : voiceState === 'paused'
                        ? 'bg-semantic-warning-soft text-semantic-warning border-semantic-warning font-black'
                        : 'bg-surface-raised hover:bg-surface-muted text-text-primary border-border font-bold'
                    }`}
                  >
                    {voiceState === 'listening' ? (
                      <>
                        <Pause className="w-4 h-4 text-white" />
                        <span>{t.listeningNow}</span>
                      </>
                    ) : voiceState === 'paused' ? (
                      <>
                        <Mic className="w-4 h-4 text-semantic-warning" />
                        <span>{t.voiceResumeListening}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-aubergine" />
                        <span>{t.speakBtn}</span>
                      </>
                    )}
                  </button>

                  {/* Clear Button */}
                  {(inputText || attachedFile) && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('');
                        handleRemoveFile();
                        setActiveDemoId(null);
                        setUnderstandResult(null);
                        stopSpeaking();
                      }}
                      className="min-h-[46px] px-4 rounded-xl font-bold text-sm bg-surface-muted hover:bg-border text-text-secondary border border-border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-text-secondary" />
                      <span>{t.clearBtn}</span>
                    </button>
                  )}
                </div>

                {/* Primary Analyze Button (Persimmon High-Emphasis Action with Tactile Feedback) */}
                <button
                  type="button"
                  disabled={isAnalyzing || (!inputText.trim() && !attachedFile)}
                  onClick={() => triggerUnderstand()}
                  className="min-h-[50px] px-8 rounded-xl bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md border-b-4 border-[#A83D1B] active:border-b-0 active:translate-y-1 transition-all cursor-pointer w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Sparkles className="w-4 h-4 text-brass" />
                  <span>
                    {isAnalyzing
                      ? t.analyzingText
                      : attachedFile && !inputText.trim()
                      ? t.explainFileBtn
                      : t.explainBtn}
                  </span>
                </button>
              </div>
            </div>

            {/* 5-PART STRUCTURED EVIDENCE-GROUNDED CASE DOSSIER */}
            {understandResult && (
              <div className="bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-8 animate-fadeIn">
                {/* Dossier Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-semantic-success-soft text-semantic-success border border-semantic-success/30 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5 text-semantic-success" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                        {t.caseDossierHeader}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-text-secondary">
                          {lang === 'hi' ? 'सत्यापित साक्ष्य-आधारित व्याख्या' : 'Verified Evidence-Grounded Case Record'} &bull; Grade-5 Reading Level
                        </span>
                        {understandResult.disclaimer_type && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            understandResult.disclaimer_type === 'legal'
                              ? 'bg-semantic-info-soft text-semantic-info border border-semantic-info/30'
                              : understandResult.disclaimer_type === 'medical'
                              ? 'bg-semantic-success-soft text-semantic-success border border-semantic-success/30'
                              : 'bg-semantic-warning-soft text-semantic-warning border border-semantic-warning/30'
                          }`}>
                            {understandResult.disclaimer_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Read Entire Report Aloud */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isSpeaking) {
                          stopSpeaking();
                        } else {
                          const fullScript = `${understandResult.summary}. ${understandResult.action_steps
                            .map((s) => s.action)
                            .join('. ')}`;
                          speak(fullScript, lang);
                        }
                      }}
                      className={`min-h-[40px] px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer shadow-2xs ${
                        isSpeaking
                          ? 'bg-semantic-error text-white border-semantic-error'
                          : 'bg-surface-raised hover:bg-surface-muted text-text-primary border-border'
                      }`}
                      aria-label="Listen aloud"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4 text-white" />
                          <span>{t.stopListeningBtn}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-aubergine" />
                          <span>{t.listenAloudBtn}</span>
                        </>
                      )}
                    </button>

                    {/* Copy Case File */}
                    <button
                      type="button"
                      onClick={handleCopyCaseFile}
                      className="min-h-[40px] px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 border border-border bg-surface-raised hover:bg-surface-muted text-text-primary transition-all cursor-pointer shadow-2xs"
                    >
                      {copiedCaseSummary ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-semantic-success" />
                          <span>{t.copiedBtn}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-text-secondary" />
                          <span>{t.copyCaseSummaryBtn}</span>
                        </>
                      )}
                    </button>

                    {/* Save to Records (Persimmon High-Emphasis Action) */}
                    <button
                      type="button"
                      onClick={handleSaveUnderstand}
                      disabled={isSavedCurrentUnderstand}
                      className={`min-h-[40px] px-4 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer shadow-2xs ${
                        isSavedCurrentUnderstand
                          ? 'bg-semantic-success-soft text-semantic-success border-semantic-success/30 cursor-default'
                          : 'bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white border-b-2 border-[#A83D1B]'
                      }`}
                    >
                      {isSavedCurrentUnderstand ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-semantic-success" />
                          <span>{t.savedSuccessBtn}</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4 text-white" />
                          <span>{t.saveForLaterBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 1. CORE PLAIN-LANGUAGE SUMMARY & RESPONSIBLE ADVISORY */}
                <div className="space-y-4">
                  <div className="p-5 sm:p-6 rounded-xl bg-surface-raised border-l-4 border-aubergine border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-extrabold tracking-wider text-aubergine flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.sectionMeaningTitle}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => speak(understandResult.summary, lang)}
                        className="p-1.5 rounded-lg bg-surface hover:bg-surface-muted text-text-secondary border border-border transition-all cursor-pointer shadow-2xs"
                        title={t.listenSection}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-aubergine" />
                      </button>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-text-primary leading-relaxed">
                      {understandResult.summary}
                    </p>
                  </div>

                  {understandResult.disclaimer_text && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xs ${
                      understandResult.disclaimer_type === 'medical'
                        ? 'bg-semantic-success-soft border-semantic-success/30 text-semantic-success'
                        : understandResult.disclaimer_type === 'financial'
                        ? 'bg-semantic-warning-soft border-semantic-warning/30 text-semantic-warning'
                        : understandResult.disclaimer_type === 'legal'
                        ? 'bg-semantic-info-soft border-semantic-info/30 text-semantic-info'
                        : 'bg-surface-muted border-border text-text-primary'
                    }`}>
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs sm:text-sm">
                        <span className="font-extrabold uppercase tracking-wider block">
                          {understandResult.disclaimer_type === 'medical'
                            ? t.disclaimerMedical
                            : understandResult.disclaimer_type === 'financial'
                            ? t.disclaimerFinancial
                            : understandResult.disclaimer_type === 'legal'
                            ? t.disclaimerLegal
                            : t.disclaimerCivic}
                        </span>
                        <p className="font-medium leading-relaxed">
                          {understandResult.disclaimer_text}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. EVIDENCE-GROUNDED INTERPRETATION (Direct Quote + Plain Interpretation) */}
                <div className="space-y-4 pt-2">
                  <div className="border-b border-border pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm uppercase font-extrabold tracking-wider text-text-primary flex items-center gap-2">
                        <FileText className="w-4 h-4 text-aubergine" />
                        <span>{t.groundedEvidenceTitle}</span>
                      </h3>
                      <span className="text-[11px] font-bold text-semantic-success bg-semantic-success-soft px-2.5 py-0.5 rounded-full border border-semantic-success/30">
                        {t.verifiedEvidenceBadge}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 font-medium">
                      {t.groundedEvidenceSubtitle}
                    </p>
                  </div>

                  {/* Supporting Evidence Pairs */}
                  {understandResult.supporting_evidence && understandResult.supporting_evidence.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {understandResult.supporting_evidence.map((ev, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-surface-raised border border-border space-y-2.5 shadow-2xs">
                          <div className="flex items-center justify-between text-xs border-b border-border pb-1.5">
                            <span className="font-extrabold text-aubergine">
                              {ev.source_ref || 'Document Extract'}
                            </span>
                            <span className="text-[10px] font-bold text-text-secondary uppercase px-1.5 py-0.5 bg-surface rounded border border-border">
                              {t.verbatimQuoteLabel}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-text-primary italic border-l-2 border-aubergine pl-2.5 py-1 bg-surface rounded-r">
                            &ldquo;{ev.quote}&rdquo;
                          </p>
                          {ev.context && (
                            <div className="text-xs text-text-secondary font-medium pt-1">
                              <span className="font-bold text-text-primary block text-[11px]">
                                {t.plainMeaningLabel}
                              </span>
                              <p className="mt-0.5 leading-relaxed">{ev.context}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* In-Context Terminology Defined */}
                  {understandResult.terms_explained && understandResult.terms_explained.length > 0 && (
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-text-primary">
                          {t.sectionTermsTitle}
                        </span>
                        <span className="text-xs text-text-muted font-medium">
                          {understandResult.terms_explained.length} terms simplified
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {understandResult.terms_explained.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-border bg-surface space-y-2 shadow-2xs"
                          >
                            <div className="flex items-baseline justify-between gap-2 border-b border-border pb-2">
                              <span className="font-extrabold text-text-primary text-sm sm:text-base">
                                {item.term}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-aubergine-soft text-aubergine border border-aubergine/20">
                                  {item.phonetic}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => speak(item.term, lang)}
                                  className="p-1 rounded bg-surface-raised hover:bg-surface-muted text-text-secondary cursor-pointer shadow-2xs border border-border"
                                  title={t.pronounceTerm}
                                >
                                  <Volume2 className="w-3.5 h-3.5 text-aubergine" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm text-text-secondary font-medium leading-relaxed">
                              {item.simple_meaning}
                            </p>

                            <div className="pt-2 border-t border-border text-xs flex items-start gap-1.5 bg-aubergine-soft/40 p-2 rounded-lg">
                              <Info className="w-3.5 h-3.5 text-aubergine shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-aubergine uppercase tracking-wider text-[10px]">
                                  {t.whyItMattersLabel}
                                </span>
                                <span className="text-text-primary font-medium">{item.why_it_matters}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. UNCERTAINTIES & MISSING FACTS ("Things This Document Does Not Make Clear") */}
                {understandResult.uncertainties && understandResult.uncertainties.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-xl border-2 border-semantic-warning/40 bg-semantic-warning-soft space-y-2.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-semantic-warning">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <h3 className="text-sm uppercase font-extrabold tracking-wider">
                        {t.uncertaintiesTitle}
                      </h3>
                    </div>
                    <p className="text-xs text-semantic-warning/90 font-medium">
                      {t.uncertaintiesDesc}
                    </p>
                    <ul className="space-y-1.5 pt-1">
                      {understandResult.uncertainties.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-semantic-warning font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-semantic-warning mt-2 shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 4. PRACTICAL ACTION CHECKLIST & OFFICIAL QUESTIONS */}
                <div className="space-y-6 pt-2">
                  {/* Checklist */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                      <div>
                        <h3 className="text-sm uppercase font-extrabold tracking-wider text-text-primary">
                          {t.actionPlanTitle}
                        </h3>
                        <span className="text-xs text-text-secondary font-medium">
                          {t.actionPlanSubtitle}
                        </span>
                      </div>

                      {totalSteps > 0 && (
                        <div className="flex items-center gap-2 text-xs font-bold text-semantic-success bg-semantic-success-soft px-3 py-1 rounded-full border border-semantic-success/30">
                          <Check className="w-3.5 h-3.5 text-semantic-success" />
                          <span>
                            {completedCount} of {totalSteps} {t.actionProgress}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {understandResult.action_steps?.map((step) => {
                        const isDone = Boolean(completedSteps[step.step_number]);
                        return (
                          <div
                            key={step.step_number}
                            onClick={() => toggleCheckStep(step.step_number)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                              isDone
                                ? 'bg-semantic-success-soft/30 border-semantic-success/30 text-text-muted'
                                : 'bg-surface border-border hover:border-border-strong'
                            }`}
                          >
                            <div className="pt-0.5 shrink-0">
                              {isDone ? (
                                <CheckSquare className="w-5 h-5 text-semantic-success" />
                              ) : (
                                <Square className="w-5 h-5 text-border-strong hover:text-aubergine" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <span
                                className={`text-sm sm:text-base font-bold text-text-primary ${
                                  isDone ? 'line-through text-text-muted' : ''
                                }`}
                              >
                                {step.action}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-semantic-warning-soft text-semantic-warning border border-semantic-warning/30">
                                  <Clock className="w-3 h-3 text-semantic-warning" />
                                  <span>{step.deadline_or_urgency}</span>
                                </span>
                                {isDone && (
                                  <span className="text-[11px] font-bold text-semantic-success">
                                    {t.actionDoneLabel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Questions to Ask */}
                  {understandResult.questions_to_ask && understandResult.questions_to_ask.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="border-b border-border pb-2">
                        <h4 className="text-sm uppercase font-extrabold tracking-wider text-text-primary">
                          {t.sectionQuestionsTitle}
                        </h4>
                        <span className="text-xs text-text-secondary font-medium">
                          {t.officialQuestionsSubtitle}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {understandResult.questions_to_ask.map((q, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-surface-raised border border-border flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 hover:border-border-strong transition-all"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="font-extrabold text-aubergine text-sm shrink-0 mt-0.5">
                                Q{idx + 1}.
                              </span>
                              <p className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
                                &ldquo;{q}&rdquo;
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                              <button
                                type="button"
                                onClick={() => speak(q, lang)}
                                className="p-1.5 rounded-lg bg-surface hover:bg-surface-muted text-text-secondary border border-border cursor-pointer transition-all shadow-2xs"
                                title={t.listenAloudBtn}
                              >
                                <Volume2 className="w-3.5 h-3.5 text-aubergine" />
                              </button>
                              <button
                                type="button"
                                onClick={() => copyQuestion(q, idx)}
                                className="min-h-[32px] px-3 rounded-lg bg-surface hover:bg-surface-muted border border-border text-xs font-bold text-text-primary flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                              >
                                {copiedQuestionIndex === idx ? (
                                  <>
                                    <Check className="w-3 h-3 text-semantic-success" />
                                    <span>{t.copiedBtn}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-text-secondary" />
                                    <span>{t.copyBtn}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Warnings & Critical Deadlines */}
                  {understandResult.watch_out_for && understandResult.watch_out_for.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <h4 className="text-sm uppercase font-extrabold tracking-wider text-semantic-warning flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-semantic-warning" />
                          <span>{t.statutoryCautionTitle}</span>
                        </h4>
                      </div>

                      <div className="space-y-2.5">
                        {understandResult.watch_out_for.map((warn, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-semantic-warning-soft border border-semantic-warning/30 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-semantic-warning text-xs sm:text-sm">
                                {warn.warning}
                              </span>
                              {warn.verified && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-semantic-success bg-surface px-2 py-0.5 rounded-full border border-semantic-success/30">
                                  <Check className="w-3 h-3 text-semantic-success" />
                                  <span>{t.verifiedEvidenceBadge}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-semantic-warning font-medium bg-surface/80 p-2 rounded-lg border border-semantic-warning/20">
                              <span className="font-bold text-semantic-warning block text-[10px] mb-0.5">
                                {t.originalTextQuoteLabel}
                              </span>
                              <span className="italic font-mono text-[11px]">&ldquo;{warn.exact_quote}&rdquo;</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. CONNECTED OFFICIAL CIVIC & LEGAL RESOURCES (THE BRIDGE) */}
                {understandResult.matched_resources && understandResult.matched_resources.length > 0 && (
                  <div className="space-y-4 pt-6 border-t-2 border-border">
                    <div className="border-b border-border pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-aubergine-soft text-aubergine flex items-center justify-center font-bold">
                            <Landmark className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-text-primary tracking-tight">
                              {t.matchedResourcesTitle}
                            </h3>
                            <p className="text-xs text-text-secondary font-medium mt-0.5">
                              {t.matchedResourcesSubtitle}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-semantic-success bg-semantic-success-soft px-2.5 py-0.5 rounded-full border border-semantic-success/30">
                          <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
                          <span>{understandResult.matched_resources.length} Official Portals Matched</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {understandResult.matched_resources.map((res) => (
                        <div
                          key={res.id}
                          className="p-5 rounded-2xl border border-border bg-surface hover:border-aubergine/40 transition-all shadow-card space-y-3.5 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            {/* Provider & Verified Badge */}
                            <div className="flex items-start justify-between gap-2 border-b border-border pb-2">
                              <div className="min-w-0">
                                <span className="text-[10px] uppercase font-extrabold tracking-wider text-text-muted block truncate">
                                  {lang === 'hi' ? res.provider_hi : res.provider_en}
                                </span>
                                <h4 className="font-extrabold text-text-primary text-sm sm:text-base leading-snug mt-0.5">
                                  {lang === 'hi' ? res.title_hi : res.title_en}
                                </h4>
                              </div>
                              <span className="text-[10px] font-bold text-aubergine bg-aubergine-soft px-2 py-0.5 rounded border border-aubergine/20 shrink-0">
                                {res.verified_source}
                              </span>
                            </div>

                            {/* Why this matches the document */}
                            <div className="p-3 rounded-xl bg-aubergine-soft/50 border border-aubergine/20 space-y-1">
                              <span className="text-[10px] uppercase font-extrabold tracking-wider text-aubergine block">
                                {t.resourceWhyMatched}
                              </span>
                              <p className="text-xs text-text-primary font-medium leading-relaxed">
                                {lang === 'hi' ? res.relevance_reason_hi : res.relevance_reason_en}
                              </p>
                            </div>

                            {/* Action Connection */}
                            <div className="p-3 rounded-xl bg-semantic-success-soft border border-semantic-success/20 space-y-1">
                              <span className="text-[10px] uppercase font-extrabold tracking-wider text-semantic-success block">
                                {t.resourceActionConnection}
                              </span>
                              <p className="text-xs text-text-primary font-medium leading-relaxed">
                                {lang === 'hi' ? res.action_connection_hi : res.action_connection_en}
                              </p>
                            </div>

                            {/* Required Documents / Prerequisites */}
                            {res.eligibility_requirements_en && res.eligibility_requirements_en.length > 0 && (
                              <div className="text-xs space-y-1 pt-1">
                                <span className="font-bold text-text-primary block text-[10px] uppercase tracking-wider">
                                  {t.resourcePrerequisites}
                                </span>
                                <ul className="space-y-1">
                                  {(lang === 'hi' ? res.eligibility_requirements_hi : res.eligibility_requirements_en).map((req, rIdx) => (
                                    <li key={rIdx} className="flex items-start gap-1.5 text-xs text-text-secondary font-medium">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success shrink-0 mt-0.5" />
                                      <span>{req}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Statutory Caution */}
                            {(res.eligibility_caution_en || res.eligibility_caution_hi) && (
                              <div className="p-2.5 rounded-lg bg-semantic-warning-soft border border-semantic-warning/30 text-xs text-semantic-warning font-medium space-y-0.5">
                                <span className="font-bold text-[10px] text-semantic-warning uppercase tracking-wider block">
                                  {t.resourceCaution}
                                </span>
                                <p className="leading-relaxed">
                                  {lang === 'hi' ? res.eligibility_caution_hi : res.eligibility_caution_en}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Portal Action Link */}
                          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                            <span className="text-[11px] font-medium text-text-muted">
                              {res.deadline_or_schedule}
                            </span>
                            <a
                              href={res.official_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white text-xs font-bold transition-all shadow-xs"
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
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: FIND PUBLIC INFORMATION (DATA.GOV.IN + CIVIC AI SUMMARY)     */}
        {/* ==================================================================== */}
        {activeTab === 'find' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="space-y-2 border-b border-border pb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aubergine-soft text-aubergine border border-aubergine/20 text-xs font-bold">
                <Search className="w-3.5 h-3.5" />
                <span>Open Government Data Platform &bull; data.gov.in</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                {t.findHeading}
              </h1>
              <p className="text-text-secondary text-base font-normal max-w-3xl leading-relaxed">
                {t.findSubtitle}
              </p>
            </div>

            {/* Catalog Selector - Cohesive Architectural Cards */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-text-muted block">
                {t.selectCatalogTitle}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Mandi Prices */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlug('mandi-prices');
                    setSelectedFilterVal('Uttar Pradesh');
                    setPublicDataResult(null);
                  }}
                  className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                    selectedSlug === 'mandi-prices'
                      ? 'bg-aubergine-soft border-aubergine ring-4 ring-aubergine-soft/60 shadow-md'
                      : 'bg-surface border-border hover:border-border-strong hover:bg-surface-raised'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-2 border ${
                    selectedSlug === 'mandi-prices'
                      ? 'bg-aubergine text-white border-aubergine'
                      : 'bg-surface-raised text-aubergine border-border'
                  }`}>
                    <Wheat className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-text-primary text-base">{t.mandiTitle}</h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2 font-medium">{t.mandiDesc}</p>
                </button>

                {/* Hospitals */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlug('hospital-directory');
                    setSelectedFilterVal('Delhi');
                    setPublicDataResult(null);
                  }}
                  className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                    selectedSlug === 'hospital-directory'
                      ? 'bg-aubergine-soft border-aubergine ring-4 ring-aubergine-soft/60 shadow-md'
                      : 'bg-surface border-border hover:border-border-strong hover:bg-surface-raised'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-2 border ${
                    selectedSlug === 'hospital-directory'
                      ? 'bg-aubergine text-white border-aubergine'
                      : 'bg-surface-raised text-aubergine border-border'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-text-primary text-base">{t.hospitalTitle}</h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2 font-medium">{t.hospitalDesc}</p>
                </button>

                {/* AQI */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlug('air-quality');
                    setSelectedFilterVal('Delhi');
                    setPublicDataResult(null);
                  }}
                  className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                    selectedSlug === 'air-quality' || selectedSlug === 'air-quality-index'
                      ? 'bg-aubergine-soft border-aubergine ring-4 ring-aubergine-soft/60 shadow-md'
                      : 'bg-surface border-border hover:border-border-strong hover:bg-surface-raised'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-2 border ${
                    selectedSlug === 'air-quality' || selectedSlug === 'air-quality-index'
                      ? 'bg-aubergine text-white border-aubergine'
                      : 'bg-surface-raised text-aubergine border-border'
                  }`}>
                    <Wind className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-text-primary text-base">{t.aqiTitle}</h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2 font-medium">{t.aqiDesc}</p>
                </button>

                {/* Education & Competitive Exams */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlug('competitive-exams');
                    setSelectedFilterVal('All');
                    setPublicDataResult(null);
                  }}
                  className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                    selectedSlug === 'competitive-exams'
                      ? 'bg-aubergine-soft border-aubergine ring-4 ring-aubergine-soft/60 shadow-md'
                      : 'bg-surface border-border hover:border-border-strong hover:bg-surface-raised'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-2 border ${
                    selectedSlug === 'competitive-exams'
                      ? 'bg-aubergine text-white border-aubergine'
                      : 'bg-surface-raised text-aubergine border-border'
                  }`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-text-primary text-base">{t.educationTitle}</h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2 font-medium">{t.educationDesc}</p>
                </button>
              </div>
            </div>

            {/* Filter Control & Query Action */}
            <div className="bg-surface rounded-2xl border border-border shadow-card p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="space-y-1.5 md:col-span-5">
                  <label htmlFor="filter-select" className="block text-xs uppercase font-extrabold tracking-wider text-text-muted">
                    {t.filterLabel}
                  </label>
                  <select
                    id="filter-select"
                    value={selectedFilterVal}
                    onChange={(e) => setSelectedFilterVal(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-border bg-surface font-semibold text-text-primary outline-none focus:border-aubergine focus:ring-2 focus:ring-aubergine-soft cursor-pointer"
                  >
                    {currentCatalog?.filter_options?.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {lang === 'hi' ? opt.label_hi : opt.label_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-4">
                  <label htmlFor="public-search-input" className="block text-xs uppercase font-extrabold tracking-wider text-text-muted">
                    {lang === 'hi' ? 'खोजें (विषय, पद या कीवर्ड)' : 'Search Records (Keyword, Post, City)'}
                  </label>
                  <div className="relative">
                    <input
                      id="public-search-input"
                      type="text"
                      value={publicSearchQuery}
                      onChange={(e) => setPublicSearchQuery(e.target.value)}
                      placeholder={t.searchPublicInfoPlaceholder}
                      className="w-full p-3.5 pl-10 pr-9 rounded-xl border border-border bg-surface font-semibold text-text-primary outline-none focus:border-aubergine focus:ring-2 focus:ring-aubergine-soft text-sm"
                    />
                    <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-4" />
                    {publicSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPublicSearchQuery('')}
                        className="absolute right-3 top-3.5 p-1 rounded-full text-text-muted hover:text-text-primary cursor-pointer"
                        aria-label="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="button"
                    disabled={isFetchingData}
                    onClick={triggerQueryPublicData}
                    className="w-full min-h-[50px] px-6 rounded-xl bg-aubergine hover:bg-aubergine-hover active:bg-[#4E2E5B] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md border-b-4 border-[#3D2248] active:border-b-0 active:translate-y-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Search className="w-4 h-4 text-brass" />
                    <span>{isFetchingData ? t.fetchingData : t.showInfoBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DATA RESULTS */}
            {publicDataResult && (() => {
              const displayRows = publicDataResult.rows.filter((row: any) => {
                if (!publicSearchQuery.trim()) return true;
                const q = publicSearchQuery.toLowerCase();
                return Object.values(row).some((val) => String(val).toLowerCase().includes(q));
              });

              return (
                <div className="bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-6 animate-fadeIn">
                  {/* Result Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-aubergine bg-aubergine-soft px-2.5 py-0.5 rounded border border-aubergine/20">
                          {lang === 'hi' ? publicDataResult.catalog.title_hi : publicDataResult.catalog.title_en}
                        </span>
                        <span className="text-xs font-semibold text-text-secondary">
                          {publicDataResult.filter_value}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-semantic-success bg-semantic-success-soft px-2 py-0.5 rounded-full border border-semantic-success/30">
                          <ShieldCheck className="w-3 h-3 text-semantic-success" />
                          {t.verifiedSourceBadge}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-semantic-info bg-semantic-info-soft px-2 py-0.5 rounded-full border border-semantic-info/30">
                          <Sparkles className="w-3 h-3 text-semantic-info" />
                          {t.aiGroundedBadge}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted font-medium mt-1 block">
                        {publicDataResult.source_badge.source} &bull; Resource ID: {publicDataResult.source_badge.resource_id} &bull; Verified: {new Date(publicDataResult.source_badge.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speak(publicDataResult.summary.summary, lang)}
                        className="min-h-[40px] px-4 rounded-xl bg-surface-raised hover:bg-surface-muted text-text-primary font-bold text-xs border border-border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-aubergine" />
                        <span>{t.listenAloudBtn}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePublicData}
                        disabled={isSavedCurrentData}
                        className={`min-h-[40px] px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs ${
                          isSavedCurrentData
                            ? 'bg-semantic-success-soft text-semantic-success border-semantic-success/30'
                            : 'bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white border-b-2 border-[#A83D1B]'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{isSavedCurrentData ? t.savedSuccessBtn : t.saveForLaterBtn}</span>
                      </button>
                    </div>
                  </div>

                  {/* Gemini AI Civic Summary Callout */}
                  <div className="p-5 rounded-xl bg-surface-raised border-l-4 border-aubergine border border-border space-y-2">
                    <span className="text-xs uppercase font-extrabold text-aubergine block">
                      {t.officialSummaryTitle}
                    </span>
                    <p className="font-semibold text-text-primary leading-relaxed text-base">
                      {publicDataResult.summary.summary}
                    </p>
                    {publicDataResult.summary.advice && (
                      <div className="pt-2 border-t border-border flex items-start gap-2 text-xs">
                        <Info className="w-4 h-4 text-aubergine shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-text-primary uppercase tracking-wider block text-[10px]">
                            {t.practicalAdviceTitle}
                          </span>
                          <p className="text-text-secondary mt-0.5 font-medium">
                            {publicDataResult.summary.advice}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clean Official Data Table OR Competitive Exam Cards */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-extrabold text-text-muted tracking-wider block">
                        {t.recordsTableTitle}
                      </span>
                      <span className="text-xs font-semibold text-text-secondary">
                        {displayRows.length} {lang === 'hi' ? 'प्रविष्टियां उपलब्ध' : 'matching records'}
                      </span>
                    </div>

                    {displayRows.length === 0 ? (
                      <div className="p-8 text-center bg-surface-raised rounded-xl border border-border text-text-muted text-sm font-medium">
                        {lang === 'hi'
                          ? 'आपकी खोज के अनुसार कोई रिकॉर्ड नहीं मिला। कृपया कीवर्ड बदलकर देखें।'
                          : 'No records matched your search term. Try a different keyword or clear the search field.'}
                      </div>
                    ) : publicDataResult.catalog.slug === 'competitive-exams' || Boolean(publicDataResult.rows[0]?.exam_name) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayRows.map((exam: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-5 rounded-2xl border border-border bg-surface hover:border-border-strong hover:shadow-card transition-all space-y-3.5 flex flex-col justify-between"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
                                <div>
                                  <h4 className="font-extrabold text-text-primary text-base leading-snug">
                                    {exam.exam_name}
                                  </h4>
                                  <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded bg-aubergine-soft text-aubergine border border-aubergine/20">
                                    {exam.conducting_body}
                                  </span>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-aubergine-soft text-aubergine flex items-center justify-center shrink-0">
                                  <GraduationCap className="w-4 h-4" />
                                </div>
                              </div>

                              {exam.target_posts && (
                                <div className="text-xs">
                                  <span className="font-bold text-text-muted block uppercase tracking-wider text-[10px]">
                                    {t.targetPostsLabel}
                                  </span>
                                  <span className="font-semibold text-text-primary mt-0.5 block">
                                    {exam.target_posts}
                                  </span>
                                </div>
                              )}

                              {exam.eligibility && (
                                <div className="text-xs">
                                  <span className="font-bold text-text-muted block uppercase tracking-wider text-[10px]">
                                    {t.eligibilityLabel}
                                  </span>
                                  <span className="font-medium text-text-secondary mt-0.5 block">
                                    {exam.eligibility}
                                  </span>
                                </div>
                              )}

                              {exam.exam_stages && (
                                <div className="text-xs">
                                  <span className="font-bold text-text-muted block uppercase tracking-wider text-[10px]">
                                    {t.examStagesLabel}
                                  </span>
                                  <span className="font-medium text-text-secondary mt-0.5 block bg-surface-raised p-2 rounded-lg border border-border">
                                    {exam.exam_stages}
                                  </span>
                                </div>
                              )}

                              {exam.key_timelines_2026 && (
                                <div className="text-xs">
                                  <span className="font-bold text-text-muted block uppercase tracking-wider text-[10px]">
                                    {t.timelinesLabel}
                                  </span>
                                  <span className="font-bold text-semantic-warning mt-0.5 block">
                                    {exam.key_timelines_2026}
                                  </span>
                                </div>
                              )}

                              {exam.senior_family_tip && (
                                <div className="p-3 rounded-xl bg-semantic-warning-soft border border-semantic-warning/30 text-xs text-semantic-warning font-medium space-y-1">
                                  <span className="font-bold text-[10px] block uppercase tracking-wider">
                                    {t.familyGuidanceTip}
                                  </span>
                                  <p className="leading-relaxed">{exam.senior_family_tip}</p>
                                </div>
                              )}
                            </div>

                            {exam.official_portal && (
                              <div className="pt-2 border-t border-border flex items-center justify-between">
                                <span className="text-[11px] font-mono text-text-muted truncate max-w-[180px]">
                                  {exam.official_portal}
                                </span>
                                <a
                                  href={exam.official_portal.startsWith('http') ? exam.official_portal : `https://${exam.official_portal}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-aubergine hover:bg-aubergine-hover text-white text-xs font-bold transition-colors shadow-xs"
                                >
                                  <span>{t.officialPortalBtn}</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-hidden rounded-xl border border-border">
                          <table className="w-full text-left border-collapse bg-surface text-sm">
                            <thead>
                              <tr className="bg-surface-raised border-b border-border text-text-primary font-bold">
                                {Object.keys(displayRows[0] || {}).map((col) => (
                                  <th key={col} className="p-3 capitalize tracking-tight">
                                    {col.replace(/_/g, ' ')}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium text-text-primary">
                              {displayRows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-surface-raised transition-colors">
                                  {Object.values(row).map((val, cIdx) => (
                                    <td key={cIdx} className="p-3">
                                      {String(val)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Stacked Card View */}
                        <div className="md:hidden space-y-2.5">
                          {displayRows.map((row, rIdx) => (
                            <div
                              key={rIdx}
                              className="p-4 rounded-xl border border-border bg-surface space-y-1.5 shadow-subtle"
                            >
                              {Object.entries(row).map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-3 text-sm">
                                  <span className="font-semibold text-text-muted capitalize">
                                    {k.replace(/_/g, ' ')}:
                                  </span>
                                  <span className="font-bold text-text-primary text-right">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: RESOURCES BRIDGE (MENTORS, SCHOLARSHIPS, INTERNSHIPS, FUNDING) */}
        {/* ==================================================================== */}
        {activeTab === 'resources' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="space-y-2 border-b border-border pb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aubergine-soft text-aubergine border border-aubergine/20 text-xs font-bold">
                <Briefcase className="w-3.5 h-3.5 text-aubergine" />
                <span>Verified Public Opportunities & Mentorship &bull; National Portals</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                {t.resourcesHeading}
              </h1>
              <p className="text-text-secondary text-base font-normal max-w-3xl leading-relaxed">
                {t.resourcesSubtitle}
              </p>
            </div>

            {/* Category Navigation Pills */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-text-muted block">
                {lang === 'hi' ? 'संसाधन श्रेणी चुनें' : 'Filter by Opportunity Category'}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'all', label: t.catAll, icon: Sparkles },
                  { id: 'mentors-orgs', label: t.catMentors, icon: Users },
                  { id: 'scholarships-education', label: t.catScholarships, icon: GraduationCap },
                  { id: 'internships-competitions', label: t.catInternships, icon: Award },
                  { id: 'funding-grants', label: t.catFunding, icon: Landmark },
                  { id: 'tools-services', label: t.catTools, icon: Briefcase },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedResourceCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedResourceCategory(cat.id);
                        fetchResources(cat.id, selectedResourceTarget, resourceSearchQuery);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                        isSelected
                          ? 'bg-aubergine text-white shadow-xs border-b-2 border-aubergine-hover'
                          : 'bg-surface text-text-primary border border-border hover:bg-surface-raised hover:border-border-strong'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-brass' : 'text-aubergine'}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Beneficiary Filter & Keyword Search */}
            <div className="bg-surface rounded-2xl border border-border shadow-card p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="space-y-1.5 md:col-span-5">
                  <label htmlFor="resource-target-select" className="block text-xs uppercase font-extrabold tracking-wider text-text-muted">
                    {t.filterTargetLabel}
                  </label>
                  <select
                    id="resource-target-select"
                    value={selectedResourceTarget}
                    onChange={(e) => {
                      const tg = e.target.value;
                      setSelectedResourceTarget(tg);
                      fetchResources(selectedResourceCategory, tg, resourceSearchQuery);
                    }}
                    className="w-full p-3.5 rounded-xl border border-border bg-surface font-semibold text-text-primary outline-none focus:border-aubergine focus:ring-2 focus:ring-aubergine-soft cursor-pointer"
                  >
                    <option value="all">{lang === 'hi' ? 'सभी नागरिक व लाभार्थी (All)' : 'All Beneficiaries & Citizens'}</option>
                    <option value="senior">{lang === 'hi' ? 'वरिष्ठ नागरिक एवं बुजुर्ग (Senior Citizens & Elders)' : 'Senior Citizens & Elders'}</option>
                    <option value="students">{lang === 'hi' ? 'छात्र, प्रतियोगी व युवा (Students, Youth & Aspirants)' : 'Students, Youth & Aspirants'}</option>
                    <option value="women">{lang === 'hi' ? 'महिला उद्यमी व स्वयं सहायता समूह (Women Entrepreneurs)' : 'Women Entrepreneurs & SHGs'}</option>
                    <option value="farmers">{lang === 'hi' ? 'लघु उद्यमी, कारीगर व किसान (Micro Business & Farmers)' : 'Micro Business, Artisans & Farmers'}</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-4">
                  <label htmlFor="resource-search-input" className="block text-xs uppercase font-extrabold tracking-wider text-text-muted">
                    {lang === 'hi' ? 'कीवर्ड खोज (उदा. पेंशन, स्टार्टअप, छात्रवृत्ति)' : 'Search by Keyword (e.g. pension, startup, scholarship)'}
                  </label>
                  <div className="relative">
                    <input
                      id="resource-search-input"
                      type="text"
                      value={resourceSearchQuery}
                      onChange={(e) => setResourceSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          fetchResources(selectedResourceCategory, selectedResourceTarget, resourceSearchQuery);
                        }
                      }}
                      placeholder={t.searchResourcesPlaceholder}
                      className="w-full p-3.5 pl-10 pr-9 rounded-xl border border-border bg-surface font-semibold text-text-primary outline-none focus:border-aubergine focus:ring-2 focus:ring-aubergine-soft text-sm"
                    />
                    <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-4" />
                    {resourceSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setResourceSearchQuery('');
                          fetchResources(selectedResourceCategory, selectedResourceTarget, '');
                        }}
                        className="absolute right-3 top-3.5 p-1 rounded-full text-text-muted hover:text-text-primary cursor-pointer"
                        aria-label="Clear keyword search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="button"
                    disabled={isFetchingResources}
                    onClick={() => fetchResources(selectedResourceCategory, selectedResourceTarget, resourceSearchQuery)}
                    className="w-full min-h-[50px] px-6 rounded-xl bg-aubergine hover:bg-aubergine-hover active:bg-[#4E2E5B] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md border-b-4 border-[#3D2248] active:border-b-0 active:translate-y-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Search className="w-4 h-4 text-brass" />
                    <span>{isFetchingResources ? t.fetchingData : (lang === 'hi' ? 'अवसर खोजें' : 'Find Opportunities')}</span>
                  </button>
                </div>
              </div>
            </div>

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
                  {resourcesList.map((resource) => {
                    const isSaved = savedResourceIds.has(resource.id);
                    return (
                      <div
                        key={resource.id}
                        className="p-5 sm:p-6 rounded-2xl border border-border bg-surface hover:border-border-strong hover:shadow-card transition-all space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3.5">
                          {/* Badges Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize bg-aubergine-soft text-aubergine border-aubergine/20">
                                {resource.category.replace(/-/g, ' ')}
                              </span>
                              <span className="text-[11px] font-semibold text-text-muted bg-surface-raised px-2 py-0.5 rounded border border-border">
                                {resource.location_coverage}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-semantic-success bg-semantic-success-soft px-2.5 py-0.5 rounded-full border border-semantic-success/30">
                              <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
                              <span>{t.verifiedDateLabel}: {resource.verification_date}</span>
                            </span>
                          </div>

                          {/* Title & Provider */}
                          <div>
                            <h3 className="font-extrabold text-text-primary text-lg sm:text-xl leading-snug">
                              {lang === 'hi' ? resource.title_hi : resource.title_en}
                            </h3>
                            <p className="text-xs font-bold text-aubergine mt-1">
                              {lang === 'hi' ? resource.provider_hi : resource.provider_en}
                            </p>
                          </div>

                          {/* Description */}
                          <p className="text-sm font-medium text-text-secondary leading-relaxed">
                            {lang === 'hi' ? resource.description_hi : resource.description_en}
                          </p>

                          {/* Why this matches callout */}
                          <div className="p-3.5 rounded-xl bg-aubergine-soft/50 border border-aubergine/20 space-y-1">
                            <span className="text-[11px] font-extrabold uppercase text-aubergine flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-aubergine" />
                              <span>{t.whyItMatchesTitle}</span>
                            </span>
                            <p className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
                              {lang === 'hi' ? resource.why_it_matches_hi : resource.why_it_matches_en}
                            </p>
                          </div>

                          {/* Eligibility Requirements Checklist */}
                          <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-2">
                            <span className="text-[11px] font-extrabold uppercase text-text-muted block">
                              {t.eligibilityChecklistTitle}
                            </span>
                            <ul className="space-y-1.5">
                              {(lang === 'hi' ? resource.eligibility_requirements_hi : resource.eligibility_requirements_en).map((req, rIdx) => (
                                <li key={rIdx} className="flex items-start gap-2 text-xs font-semibold text-text-secondary">
                                  <Check className="w-3.5 h-3.5 text-semantic-success shrink-0 mt-0.5" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Missing Requirements Warning */}
                          <div className="p-3.5 rounded-xl bg-semantic-warning-soft border border-semantic-warning/30 space-y-1">
                            <span className="text-[11px] font-extrabold uppercase text-semantic-warning flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{t.missingRequirementsTitle}</span>
                            </span>
                            <p className="text-xs font-medium text-semantic-warning leading-relaxed">
                              {lang === 'hi' ? resource.missing_requirements_warning_hi : resource.missing_requirements_warning_en}
                            </p>
                          </div>

                          {/* Schedule / Deadline */}
                          <div className="text-xs flex items-center gap-1.5 text-text-muted">
                            <Clock className="w-3.5 h-3.5 text-text-muted" />
                            <span className="font-medium">Timeline / Schedule:</span>
                            <span className="font-bold text-text-primary">{resource.deadline_or_schedule}</span>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                          <a
                            href={resource.official_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white font-bold text-xs shadow-xs border-b-2 border-aubergine-hover transition-colors"
                          >
                            <span>{t.officialPortalLink}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const desc = lang === 'hi' ? resource.description_hi : resource.description_en;
                                const title = lang === 'hi' ? resource.title_hi : resource.title_en;
                                speak(`${title}. ${desc}`, lang);
                              }}
                              className="p-2 rounded-xl bg-surface-raised hover:bg-surface-muted text-text-secondary border border-border cursor-pointer shadow-2xs"
                              title={t.listenAloudBtn}
                            >
                              <Volume2 className="w-3.5 h-3.5 text-aubergine" />
                            </button>

                            {isSaved ? (
                              <button
                                type="button"
                                disabled
                                className="px-3.5 py-2 rounded-xl bg-semantic-success-soft text-semantic-success border border-semantic-success/30 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                              >
                                <BookmarkCheck className="w-3.5 h-3.5 text-semantic-success" />
                                <span>{t.savedSuccessBtn}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSaveResource(resource)}
                                className="px-3.5 py-2 rounded-xl bg-surface-raised hover:bg-surface-muted text-text-primary font-bold text-xs border border-border flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Bookmark className="w-3.5 h-3.5 text-text-secondary" />
                                <span>{t.saveForLaterBtn}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
