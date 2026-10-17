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
  ArrowRight,
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

type Tab = 'understand' | 'find' | 'resources' | 'saved';
type FontSize = 'normal' | 'large' | 'xlarge';
type DemoId = 'bank' | 'medical' | 'insurance' | null;

interface UnderstandData {
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

interface CivicResource {
  id: string;
  category: 'mentors-orgs' | 'scholarships-education' | 'internships-competitions' | 'funding-grants' | 'tools-services';
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

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  base64: string;
  previewUrl?: string;
}

interface PublicDataResult {
  catalog: {
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
  };
  filter_value: string;
  rows: Record<string, any>[];
  summary: {
    summary: string;
    advice: string;
    cached?: boolean;
  };
  source_badge: {
    source: string;
    is_live: boolean;
    timestamp: string;
    resource_id: string;
  };
}

interface SavedItem {
  id: string;
  session_id: string;
  kind: 'understand' | 'public_data' | 'resource';
  title: string;
  payload: any;
  created_at: string;
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [activeTab, setActiveTab] = useState<Tab>('understand');
  const [sessionId, setSessionId] = useState<string>('');

  // Flow 1: Understand
  const [inputText, setInputText] = useState<string>('');
  const [activeDemoId, setActiveDemoId] = useState<DemoId>(null);
  const [understandResult, setUnderstandResult] = useState<UnderstandData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isSavedCurrentUnderstand, setIsSavedCurrentUnderstand] = useState<boolean>(false);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);

  // File Attachment & Banner State
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
  } | null>(null);
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

  // 1. Proportional Root Font Scaling for Seniors
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const rootSize =
        fontSize === 'xlarge' ? '21px' : fontSize === 'large' ? '18.5px' : '16px';
      document.documentElement.style.fontSize = rootSize;
    }
  }, [fontSize]);

  // 2. Session Initialization & Catalog Fetch
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

  // 3. Saved Items Fetch
  useEffect(() => {
    if (activeTab === 'saved' && sessionId) {
      loadSavedItems();
    }
  }, [activeTab, sessionId]);

  const loadSavedItems = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/saved`, {
        headers: { 'x-session-id': sessionId },
      });
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
      const res = await fetch(`${API_BASE_URL}/saved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
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
      const res = await fetch(`${API_BASE_URL}/understand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: query,
          lang,
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
        setStatusBanner({ type: 'warning', message: json.error || t.errorFailedFetch });
      }
    } catch (err: any) {
      console.warn('Network call to backend AI failed:', err);
      setStatusBanner({
        type: 'error',
        message: lang === 'hi' ? 'एआई सेवा से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।' : 'Failed to connect to AI service. Please try again.',
      });
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
      await fetch(`${API_BASE_URL}/saved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
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

      await fetch(`${API_BASE_URL}/saved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
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
      await fetch(`${API_BASE_URL}/saved/${id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId },
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

  return (
    <div className="min-h-screen bg-ivory text-navy flex flex-col font-sans selection:bg-pale-blue selection:text-navy">
      {/* 1. ARCHITECTURAL MASTHEAD & TOP NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-grey shadow-subtle">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Brand Mark */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('understand');
              setInspectingItem(null);
              stopSpeaking();
            }}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
            aria-label="Setu Home"
          >
            {/* Bespoke Geometric Bridge Mark */}
            <div className="w-10 h-10 rounded-xl bg-cobalt text-white flex items-center justify-center shadow-sm group-hover:bg-cobalt-hover transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 17C4 12.0294 7.58172 8 12 8C16.4183 8 20 12.0294 20 17" stroke="#FAF8F5" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M3 17H21" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="12" cy="5" r="1.5" fill="#D97706" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-navy tracking-tight leading-none">
                  {lang === 'hi' ? 'सेतु' : 'Setu'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pale-blue text-cobalt border border-cobalt/20 uppercase tracking-wider">
                  Civic AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-subtle leading-tight mt-0.5 hidden sm:block">
                {t.brandTagline}
              </p>
            </div>
          </button>

          {/* Center: Segmented Navigation Pills (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 rounded-xl bg-slate-100 border border-border-grey p-1.5 shadow-2xs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'understand' && !inspectingItem}
              onClick={() => {
                setActiveTab('understand');
                setInspectingItem(null);
                stopSpeaking();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                activeTab === 'understand' && !inspectingItem
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md border-b-2 border-blue-800'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-950 border border-blue-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.understandTab}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'find'}
              onClick={() => {
                setActiveTab('find');
                setInspectingItem(null);
                stopSpeaking();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                activeTab === 'find'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border-b-2 border-emerald-800'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t.findTab}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'resources'}
              onClick={() => {
                setActiveTab('resources');
                setInspectingItem(null);
                stopSpeaking();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                activeTab === 'resources'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md border-b-2 border-amber-900'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t.resourcesTab}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'saved'}
              onClick={() => {
                setActiveTab('saved');
                stopSpeaking();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                activeTab === 'saved'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md border-b-2 border-purple-800'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{t.savedTab}</span>
              {savedItems.length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  activeTab === 'saved' ? 'bg-amber-300 text-purple-950' : 'bg-purple-300 text-purple-950'
                }`}>
                  {savedItems.length}
                </span>
              )}
            </button>
          </nav>

          {/* Right Utilities: Language Switcher & Senior Font Scaler */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <div
              className="flex items-center gap-1 rounded-xl bg-slate-100 border border-border-grey p-1 shadow-2xs"
              role="group"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => {
                  setLang('en');
                  stopSpeaking();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-b-2 border-emerald-800'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300'
                }`}
                aria-pressed={lang === 'en'}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang('hi');
                  stopSpeaking();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  lang === 'hi'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-b-2 border-emerald-800'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300'
                }`}
                aria-pressed={lang === 'hi'}
              >
                हिन्दी
              </button>
            </div>

            {/* Senior 3-Stage Font Scaler */}
            <div
              className="flex items-center gap-1 rounded-xl bg-slate-100 border border-border-grey p-1 shadow-2xs"
              role="group"
              aria-label={t.fontScalerLabel}
            >
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`w-8 h-8 rounded-lg text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                  fontSize === 'normal'
                    ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-sm ring-2 ring-amber-300'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                }`}
                title="Normal text size (16px base)"
                aria-label="Normal text size"
              >
                {t.normalFont}
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`w-8 h-8 rounded-lg text-sm font-black flex items-center justify-center transition-all cursor-pointer ${
                  fontSize === 'large'
                    ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-sm ring-2 ring-amber-300'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                }`}
                title="Large text size (18.5px base)"
                aria-label="Large text size"
              >
                {t.largeFont}
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`w-8 h-8 rounded-lg text-base font-black flex items-center justify-center transition-all cursor-pointer ${
                  fontSize === 'xlarge'
                    ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-sm ring-2 ring-amber-300'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                }`}
                title="Extra large text size (21px base)"
                aria-label="Extra large text size"
              >
                {t.xlargeFont}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12 space-y-8">
        {/* NON-BLOCKING INLINE STATUS BANNER */}
        {statusBanner && (
          <div
            role="alert"
            className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-sm font-semibold transition-all animate-fadeIn ${
              statusBanner.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : statusBanner.type === 'warning'
                ? 'bg-pale-amber border-amber-400 text-amber-950'
                : statusBanner.type === 'success'
                ? 'bg-pale-mint border-jade text-jade-dark'
                : 'bg-pale-blue border-royal text-navy'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {statusBanner.type === 'error' || statusBanner.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-700" />
              ) : statusBanner.type === 'success' ? (
                <Check className="w-5 h-5 flex-shrink-0 text-jade" />
              ) : (
                <Info className="w-5 h-5 flex-shrink-0 text-cobalt" />
              )}
              <span>{statusBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="p-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-black cursor-pointer border border-amber-400 transition-all"
              aria-label={t.dismissBanner}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 1: UNDERSTAND A DOCUMENT OR WORD                                 */}
        {/* ==================================================================== */}
        {activeTab === 'understand' && !inspectingItem && (
          <div className="space-y-8 animate-fadeIn">
            {/* Editorial Heading Section */}
            <div className="space-y-2 border-b border-border-grey pb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pale-blue text-cobalt border border-cobalt/20 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plain Language Assistance &bull; AI Powered</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
                {t.understandHeading}
              </h1>
              <p className="text-slate-subtle text-base font-normal max-w-3xl leading-relaxed">
                {t.understandSubtitle}
              </p>
            </div>

            {/* ART-DIRECTED CASE FILE SCENARIOS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-subtle">
                  {t.demoSectionTitle}
                </span>
                <span className="text-[11px] font-bold text-slate-subtle">
                  Click any case to test instant simplification
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Case 1: Banking & Debt */}
                <button
                  type="button"
                  onClick={handleBankDemo}
                  className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer group flex flex-col justify-between shadow-xs ${
                    activeDemoId === 'bank'
                      ? 'bg-blue-100 border-blue-600 ring-4 ring-blue-200 shadow-md'
                      : 'bg-blue-50/90 border-blue-300 hover:border-blue-500 hover:bg-blue-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-black bg-blue-200 text-blue-950 border border-blue-400">
                        <Landmark className="w-3.5 h-3.5" />
                        <span>Banking & Debt</span>
                      </span>
                      {activeDemoId === 'bank' ? (
                        <span className="text-[11px] font-black text-white bg-blue-600 px-2 py-0.5 rounded shadow-2xs">
                          {t.activeScenario}
                        </span>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                    <h3 className="font-extrabold text-navy text-base mb-1 group-hover:text-blue-700 transition-colors">
                      {t.demoBankTitle}
                    </h3>
                    <p className="text-xs text-blue-950/80 font-medium line-clamp-2 leading-relaxed">
                      {t.demoBankDesc}
                    </p>
                  </div>
                </button>

                {/* Case 2: Clinical Lab Panel */}
                <button
                  type="button"
                  onClick={handleMedicalDemo}
                  className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer group flex flex-col justify-between shadow-xs ${
                    activeDemoId === 'medical'
                      ? 'bg-teal-100 border-teal-600 ring-4 ring-teal-200 shadow-md'
                      : 'bg-teal-50/90 border-teal-300 hover:border-teal-500 hover:bg-teal-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-black bg-teal-200 text-teal-950 border border-teal-400">
                        <Activity className="w-3.5 h-3.5 text-teal-700" />
                        <span>Medical Diagnostic</span>
                      </span>
                      {activeDemoId === 'medical' ? (
                        <span className="text-[11px] font-black text-white bg-teal-700 px-2 py-0.5 rounded shadow-2xs">
                          {t.activeScenario}
                        </span>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-teal-700 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                    <h3 className="font-extrabold text-navy text-base mb-1 group-hover:text-teal-800 transition-colors">
                      {t.demoMedicalTitle}
                    </h3>
                    <p className="text-xs text-teal-950/80 font-medium line-clamp-2 leading-relaxed">
                      {t.demoMedicalDesc}
                    </p>
                  </div>
                </button>

                {/* Case 3: Insurance Repudiation */}
                <button
                  type="button"
                  onClick={handleInsuranceDemo}
                  className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer group flex flex-col justify-between shadow-xs ${
                    activeDemoId === 'insurance'
                      ? 'bg-amber-100 border-amber-600 ring-4 ring-amber-200 shadow-md'
                      : 'bg-amber-50/90 border-amber-300 hover:border-amber-500 hover:bg-amber-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-black bg-amber-200 text-amber-950 border border-amber-400">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                        <span>Insurance Policy</span>
                      </span>
                      {activeDemoId === 'insurance' ? (
                        <span className="text-[11px] font-black text-white bg-amber-700 px-2 py-0.5 rounded shadow-2xs">
                          {t.activeScenario}
                        </span>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                    <h3 className="font-extrabold text-navy text-base mb-1 group-hover:text-amber-900 transition-colors">
                      {t.demoInsuranceTitle}
                    </h3>
                    <p className="text-xs text-amber-950/80 font-medium line-clamp-2 leading-relaxed">
                      {t.demoInsuranceDesc}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* DOCUMENT INTAKE WORKBENCH */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative bg-white rounded-2xl border transition-all shadow-card p-5 sm:p-6 space-y-4 ${
                isDragging ? 'border-cobalt ring-4 ring-pale-blue bg-pale-blue/10' : 'border-border-grey'
              }`}
            >
              {/* Drag & Drop Visual Overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-cobalt/10 backdrop-blur-[1px] border-2 border-dashed border-cobalt rounded-2xl flex flex-col items-center justify-center z-20 pointer-events-none p-4 animate-fadeIn">
                  <Upload className="w-10 h-10 text-cobalt animate-bounce mb-2" />
                  <p className="text-base font-bold text-navy">{t.dragDropNotice}</p>
                  <span className="text-xs text-slate-subtle font-medium">{t.attachFileHint}</span>
                </div>
              )}

              {/* CONTROLLED VOICE DICTATION CONSOLE */}
              {voiceState !== 'idle' && (
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-purple-400 bg-purple-50/95 shadow-md space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-purple-200">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                        voiceState === 'listening' ? 'bg-purple-600 text-white animate-pulse' : 'bg-purple-200 text-purple-950'
                      }`}>
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-purple-950">
                          {t.voiceConsoleTitle}
                        </h4>
                        <p className="text-xs font-semibold text-purple-900/80">
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
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          Listening Live
                        </span>
                      )}
                      {voiceState === 'paused' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-amber-950">
                          <Pause className="w-3 h-3" />
                          Paused (Words Safe)
                        </span>
                      )}
                      {voiceState === 'error' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3 h-3" />
                          Error
                        </span>
                      )}
                    </div>
                  </div>

                  {voiceError && (
                    <div className="p-3 rounded-xl bg-rose-100 text-rose-900 text-xs font-bold border border-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                      <span>{voiceError}</span>
                    </div>
                  )}

                  {/* Live Editable Transcript Area */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-900/70">
                      <span>{t.voiceEditTranscriptHint}</span>
                      <span>{voiceTranscript.length} characters</span>
                    </div>
                    <textarea
                      value={voiceTranscript}
                      onChange={(e) => setVoiceTranscript(e.target.value)}
                      placeholder={lang === 'hi' ? 'आपके द्वारा बोले गए शब्द यहां दिखाई देंगे...' : 'Your spoken words will appear here...'}
                      rows={3}
                      className="w-full p-3 rounded-xl border-2 border-purple-300 bg-white text-navy font-medium text-sm sm:text-base outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all resize-y"
                    />
                    {voiceInterim && (
                      <p className="text-xs text-purple-700 italic font-medium px-1">
                        &ldquo;{voiceInterim}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-purple-200">
                    <div className="flex items-center gap-2">
                      {voiceState === 'listening' ? (
                        <button
                          type="button"
                          onClick={() => pauseVoiceSession()}
                          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400 flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>{t.voicePauseListening}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => resumeVoiceSession(lang)}
                          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white border-b-2 border-emerald-900 flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>{t.voiceResumeListening}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => cancelVoiceSession()}
                        className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 flex items-center gap-1 cursor-pointer"
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
                      className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-b-4 border-blue-900 active:border-b-0 active:translate-y-0.5 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{t.voiceTapToAnalyse}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label
                  htmlFor="clause-input"
                  className="block text-sm font-bold text-navy uppercase tracking-wider"
                >
                  {t.inputLabel}
                </label>
                <div className="flex items-center gap-3 text-xs text-slate-subtle font-medium">
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
                  className="w-full p-4 rounded-xl border border-border-grey focus:border-cobalt focus:ring-2 focus:ring-pale-blue bg-ivory-surface font-normal text-navy resize-y min-h-[110px] outline-none text-base transition-all"
                />
              </div>

              {/* ATTACHED FILE PREVIEW CHIP */}
              {attachedFile && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-pale-blue/60 border border-royal/30 animate-fadeIn">
                  <div className="flex items-center gap-3 min-w-0">
                    {attachedFile.previewUrl ? (
                      <img
                        src={attachedFile.previewUrl}
                        alt="Scan preview"
                        className="w-12 h-12 rounded-lg object-cover border border-royal/30 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-white text-cobalt border border-royal/30 flex items-center justify-center font-bold shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-navy truncate max-w-[260px] sm:max-w-md">
                          {attachedFile.name}
                        </span>
                        <span className="text-[11px] font-bold text-cobalt bg-white px-2 py-0.5 rounded-full border border-cobalt/20 shrink-0">
                          {(attachedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <p className="text-xs text-slate-subtle font-medium mt-0.5">
                        {t.fileAttachedLabel} &bull; Multimodal Gemini 2.5 Flash ready
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="min-h-[38px] px-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white border-b-2 border-rose-700 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                    <span>{t.removeFileBtn}</span>
                  </button>
                </div>
              )}

              {/* ACTION TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-grey">
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
                    className={`min-h-[46px] px-4 rounded-xl text-sm flex items-center gap-2 border-2 transition-all cursor-pointer shadow-xs ${
                      attachedFile
                        ? 'bg-sky-500 hover:bg-sky-600 text-white border-sky-700 border-b-4 font-black shadow-sm'
                        : 'bg-sky-100 hover:bg-sky-200 active:bg-sky-300 text-sky-950 border-sky-400 font-black'
                    }`}
                    title={t.attachFileHint}
                  >
                    <Paperclip className={`w-4 h-4 ${attachedFile ? 'text-white' : 'text-sky-800'}`} />
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
                    className={`min-h-[46px] px-4 rounded-xl text-sm flex items-center gap-2 border-2 transition-all cursor-pointer shadow-xs ${
                      !speechRecognitionSupported
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 border-border-grey text-slate-subtle font-bold'
                        : voiceState === 'listening'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-800 border-b-4 ring-4 ring-rose-200 animate-pulse font-black'
                        : voiceState === 'paused'
                        ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 border-amber-700 border-b-4 font-black'
                        : 'bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-950 border-purple-400 font-black'
                    }`}
                  >
                    {voiceState === 'listening' ? (
                      <>
                        <Pause className="w-4 h-4 text-white" />
                        <span>{t.listeningNow}</span>
                      </>
                    ) : voiceState === 'paused' ? (
                      <>
                        <Mic className="w-4 h-4 text-amber-950" />
                        <span>{t.voiceResumeListening}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-purple-800" />
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
                      className="min-h-[46px] px-4 rounded-xl font-black text-sm bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-950 border-2 border-amber-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-900" />
                      <span>{t.clearBtn}</span>
                    </button>
                  )}
                </div>

                {/* Primary Analyze Button (Bright High-Contrast Vibrant Blue with Tactile Feedback) */}
                <button
                  type="button"
                  disabled={isAnalyzing || (!inputText.trim() && !attachedFile)}
                  onClick={() => triggerUnderstand()}
                  className="min-h-[50px] px-8 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all cursor-pointer w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
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

            {/* 5-PART STRUCTURED OFFICIAL DOSSIER OUTPUT */}
            {understandResult && (
              <div className="bg-white rounded-2xl border border-border-grey shadow-card p-6 sm:p-8 space-y-8 animate-fadeIn">
                {/* Dossier Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border-grey">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pale-mint text-jade-dark border border-jade/30 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5 text-jade" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-navy tracking-tight">
                        {lang === 'hi' ? 'नागरिक विश्लेषण विवरण' : 'Civic Plain-Language Dossier'}
                      </h2>
                      <span className="text-xs font-semibold text-slate-subtle">
                        {lang === 'hi' ? 'सत्यापित कक्षा 5 भाषा स्तर' : 'Verified Grade-5 Reading Level'} &bull; Anti-Hallucination Verified
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
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
                      className={`min-h-[42px] px-4 rounded-xl font-black text-xs flex items-center gap-2 border transition-all cursor-pointer shadow-sm ${
                        isSpeaking
                          ? 'bg-rose-600 hover:bg-rose-700 text-white border-b-2 border-rose-800'
                          : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white border-b-2 border-indigo-900'
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
                          <Volume2 className="w-4 h-4 text-amber-300" />
                          <span>{t.listenAloudBtn}</span>
                        </>
                      )}
                    </button>

                    {/* Save to Local Records */}
                    <button
                      type="button"
                      onClick={handleSaveUnderstand}
                      disabled={isSavedCurrentUnderstand}
                      className={`min-h-[42px] px-4 rounded-xl font-black text-xs flex items-center gap-2 border-2 transition-all cursor-pointer shadow-xs ${
                        isSavedCurrentUnderstand
                          ? 'bg-emerald-500 text-white border-emerald-700 border-b-4 cursor-default shadow-sm'
                          : 'bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-950 border-emerald-400'
                      }`}
                    >
                      {isSavedCurrentUnderstand ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-white" />
                          <span>{t.savedSuccessBtn}</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4 text-emerald-800" />
                          <span>{t.saveForLaterBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* RESPONSIBLE ADVISORY DISCLAIMER */}
                {understandResult.disclaimer_text && (
                  <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xs ${
                    understandResult.disclaimer_type === 'medical'
                      ? 'bg-teal-50 border-teal-300 text-teal-950'
                      : understandResult.disclaimer_type === 'financial'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : understandResult.disclaimer_type === 'legal'
                      ? 'bg-blue-50 border-blue-300 text-blue-950'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
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

                {/* UNCERTAINTIES & MISSING FACTS */}
                {understandResult.uncertainties && understandResult.uncertainties.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-xl border-2 border-amber-300 bg-amber-50/70 space-y-2.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-amber-950">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <h3 className="text-sm uppercase font-extrabold tracking-wider">
                        {t.uncertaintiesTitle}
                      </h3>
                    </div>
                    <p className="text-xs text-amber-900 font-medium">
                      {t.uncertaintiesDesc}
                    </p>
                    <ul className="space-y-1.5 pt-1">
                      {understandResult.uncertainties.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-amber-950 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 1. CORE SUMMARY (Editorial Pull-Quote Style in Warm Ivory & Pale Blue) */}
                <div className="p-6 rounded-xl bg-ivory-surface border-l-4 border-cobalt border border-border-grey space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-cobalt flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.sectionMeaningTitle}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => speak(understandResult.summary, lang)}
                      className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-950 border border-blue-300 transition-all cursor-pointer shadow-2xs"
                      title={t.listenSection}
                    >
                      <Volume2 className="w-4 h-4 text-blue-700" />
                    </button>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-navy leading-relaxed">
                    {understandResult.summary}
                  </p>
                </div>

                {/* 2. KEY TERMINOLOGY DEFINED */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border-grey pb-2">
                    <h3 className="text-sm uppercase font-extrabold tracking-wider text-navy">
                      {t.sectionTermsTitle}
                    </h3>
                    <span className="text-xs text-slate-subtle font-medium">
                      {understandResult.terms_explained?.length || 0} terms simplified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {understandResult.terms_explained?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-border-grey bg-white hover:border-slate-subtle transition-all space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-baseline justify-between gap-2 border-b border-border-grey pb-2">
                          <span className="font-extrabold text-navy text-base">
                            {item.term}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-pale-blue text-cobalt border border-cobalt/20">
                              {item.phonetic}
                            </span>
                            <button
                              type="button"
                              onClick={() => speak(item.term, lang)}
                              className="p-1.5 rounded-md bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-950 border border-blue-300 cursor-pointer transition-colors shadow-2xs"
                              title={t.pronounceTerm}
                            >
                              <Volume2 className="w-3.5 h-3.5 text-blue-700" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-navy/90 font-medium leading-relaxed">
                          {item.simple_meaning}
                        </p>

                        <div className="pt-2 border-t border-border-grey text-xs flex items-start gap-1.5 text-jade-dark bg-pale-mint/40 p-2 rounded-lg">
                          <Info className="w-3.5 h-3.5 text-jade shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-jade-dark uppercase tracking-wider text-[10px]">
                              {t.whyItMattersLabel}
                            </span>
                            <span className="text-navy/90 font-medium">{item.why_it_matters}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. RECOMMENDED NEXT STEPS (Interactive Checklist with Vibrant Jade Progress) */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-grey pb-2">
                    <div>
                      <h3 className="text-sm uppercase font-extrabold tracking-wider text-navy">
                        {t.sectionActionsTitle}
                      </h3>
                      <span className="text-xs text-slate-subtle font-medium">
                        Check off each step as you complete it
                      </span>
                    </div>

                    {totalSteps > 0 && (
                      <div className="flex items-center gap-2 text-xs font-bold text-jade-dark bg-pale-mint px-3 py-1 rounded-full border border-jade/30">
                        <Check className="w-3.5 h-3.5 text-jade" />
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
                              ? 'bg-pale-mint/30 border-jade/40 text-slate-subtle'
                              : 'bg-white border-border-grey hover:border-slate-subtle'
                          }`}
                        >
                          <div className="pt-0.5 shrink-0">
                            {isDone ? (
                              <CheckSquare className="w-5 h-5 text-jade" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-light hover:text-navy" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <span
                              className={`text-sm sm:text-base font-bold text-navy ${
                                isDone ? 'line-through text-slate-subtle' : ''
                              }`}
                            >
                              {step.action}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-pale-amber text-amber-900 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>{step.deadline_or_urgency}</span>
                              </span>
                              {isDone && (
                                <span className="text-[11px] font-bold text-jade">
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

                {/* 4. QUESTIONS TO ASK YOUR OFFICIAL OR DOCTOR */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border-grey pb-2">
                    <h3 className="text-sm uppercase font-extrabold tracking-wider text-navy">
                      {t.sectionQuestionsTitle}
                    </h3>
                    <span className="text-xs text-slate-subtle font-medium">
                      Read aloud in clinic or branch
                    </span>
                  </div>

                  <div className="space-y-3">
                    {understandResult.questions_to_ask?.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-ivory border border-border-grey flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 hover:border-royal/40 transition-all"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="font-extrabold text-cobalt text-sm shrink-0 mt-0.5">
                            Q{idx + 1}.
                          </span>
                          <p className="text-sm sm:text-base font-semibold text-navy leading-relaxed">
                            "{q}"
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                          <button
                            type="button"
                            onClick={() => speak(q, lang)}
                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-950 border border-blue-300 cursor-pointer transition-all shadow-2xs"
                            title={t.listenAloudBtn}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-blue-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyQuestion(q, idx)}
                            className="min-h-[36px] px-3.5 rounded-lg bg-teal-100 hover:bg-teal-200 active:bg-teal-300 border-2 border-teal-400 text-xs font-black text-teal-950 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <Copy className="w-3.5 h-3.5 text-teal-800" />
                            <span>{copiedQuestionIndex === idx ? t.copiedBtn : t.copyBtn}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. IMPORTANT WARNINGS & DEADLINES */}
                {understandResult.watch_out_for?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border-grey pb-2">
                      <h3 className="text-sm uppercase font-extrabold tracking-wider text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        <span>{t.sectionWatchoutTitle}</span>
                      </h3>
                      <span className="text-xs text-amber-800 font-semibold">
                        Critical notices & liabilities
                      </span>
                    </div>

                    <div className="space-y-3">
                      {understandResult.watch_out_for.map((warn, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-pale-amber/40 border border-amber-300 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950 text-sm sm:text-base">
                              {warn.warning}
                            </span>
                            {warn.verified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-jade bg-white px-2 py-0.5 rounded-full border border-jade/30">
                                <Check className="w-3 h-3 text-jade" />
                                <span>{t.verifiedEvidenceBadge}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-slate-subtle bg-white px-2 py-0.5 rounded border border-border-grey">
                                {t.unverifiedWarningBadge}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-amber-900 font-medium bg-white/70 p-2.5 rounded-lg border border-amber-200">
                            <span className="font-bold text-amber-950 block mb-0.5">
                              {t.originalTextQuoteLabel}
                            </span>
                            <span className="italic font-mono">"{warn.exact_quote}"</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. SUPPORTING QUOTES & DOCUMENT REFERENCES */}
                {understandResult.supporting_evidence && understandResult.supporting_evidence.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border-grey">
                    <div className="flex items-center justify-between border-b border-border-grey pb-2">
                      <h3 className="text-sm uppercase font-extrabold tracking-wider text-navy flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cobalt" />
                        <span>{t.supportingEvidenceTitle}</span>
                      </h3>
                      <span className="text-[11px] font-bold text-jade bg-white px-2 py-0.5 rounded-full border border-jade/30">
                        {t.verifiedEvidenceBadge}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {understandResult.supporting_evidence.map((ev, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-cobalt">
                              {ev.source_ref || 'Document Extract'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 py-0.5 bg-white rounded border border-slate-200">
                              Verbatim Source
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-navy italic border-l-2 border-cobalt pl-2.5 py-0.5 bg-white/60 rounded-r">
                            &ldquo;{ev.quote}&rdquo;
                          </p>
                          {ev.context && (
                            <p className="text-xs text-slate-subtle font-medium pt-0.5">
                              {ev.context}
                            </p>
                          )}
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
            <div className="space-y-2 border-b border-border-grey pb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pale-blue text-cobalt border border-cobalt/20 text-xs font-bold">
                <Search className="w-3.5 h-3.5" />
                <span>Open Government Data Platform &bull; data.gov.in</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
                {t.findHeading}
              </h1>
              <p className="text-slate-subtle text-base font-normal max-w-3xl leading-relaxed">
                {t.findSubtitle}
              </p>
            </div>

            {/* Catalog Selector */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-subtle block">
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
                      ? 'bg-blue-100 border-blue-600 ring-4 ring-blue-200 shadow-md'
                      : 'bg-blue-50/90 border-blue-300 hover:border-blue-500 hover:bg-blue-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-200 text-blue-950 flex items-center justify-center font-bold mb-2 border border-blue-400">
                    <Wheat className="w-4 h-4 text-blue-800" />
                  </div>
                  <h3 className="font-extrabold text-navy text-base">{t.mandiTitle}</h3>
                  <p className="text-xs text-blue-950/80 mt-1 line-clamp-2 font-medium">{t.mandiDesc}</p>
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
                      ? 'bg-teal-100 border-teal-600 ring-4 ring-teal-200 shadow-md'
                      : 'bg-teal-50/90 border-teal-300 hover:border-teal-500 hover:bg-teal-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-200 text-teal-950 flex items-center justify-center font-bold mb-2 border border-teal-400">
                    <Building2 className="w-4 h-4 text-teal-800" />
                  </div>
                  <h3 className="font-extrabold text-navy text-base">{t.hospitalTitle}</h3>
                  <p className="text-xs text-teal-950/80 mt-1 line-clamp-2 font-medium">{t.hospitalDesc}</p>
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
                      ? 'bg-amber-100 border-amber-600 ring-4 ring-amber-200 shadow-md'
                      : 'bg-amber-50/90 border-amber-300 hover:border-amber-500 hover:bg-amber-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-950 flex items-center justify-center font-bold mb-2 border border-amber-400">
                    <Wind className="w-4 h-4 text-amber-800" />
                  </div>
                  <h3 className="font-extrabold text-navy text-base">{t.aqiTitle}</h3>
                  <p className="text-xs text-amber-950/80 mt-1 line-clamp-2 font-medium">{t.aqiDesc}</p>
                </button>

                {/* Education & Competitive Exams (Right next to AQI) */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlug('competitive-exams');
                    setSelectedFilterVal('All');
                    setPublicDataResult(null);
                  }}
                  className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                    selectedSlug === 'competitive-exams'
                      ? 'bg-orange-100 border-orange-600 ring-4 ring-orange-200 shadow-md'
                      : 'bg-orange-50/90 border-orange-300 hover:border-orange-500 hover:bg-orange-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-200 text-orange-950 flex items-center justify-center font-bold mb-2 border border-orange-400">
                    <GraduationCap className="w-4 h-4 text-orange-800" />
                  </div>
                  <h3 className="font-extrabold text-navy text-base">{t.educationTitle}</h3>
                  <p className="text-xs text-orange-950/80 mt-1 line-clamp-2 font-medium">{t.educationDesc}</p>
                </button>
              </div>
            </div>

            {/* Filter Control & Query Action */}
            <div className="bg-white rounded-2xl border border-border-grey shadow-card p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="space-y-1.5 md:col-span-5">
                  <label htmlFor="filter-select" className="block text-xs uppercase font-extrabold tracking-wider text-slate-subtle">
                    {t.filterLabel}
                  </label>
                  <select
                    id="filter-select"
                    value={selectedFilterVal}
                    onChange={(e) => setSelectedFilterVal(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-border-grey bg-ivory-surface font-semibold text-navy outline-none focus:border-cobalt focus:ring-2 focus:ring-pale-blue cursor-pointer"
                  >
                    {currentCatalog?.filter_options?.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {lang === 'hi' ? opt.label_hi : opt.label_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-4">
                  <label htmlFor="public-search-input" className="block text-xs uppercase font-extrabold tracking-wider text-slate-subtle">
                    {lang === 'hi' ? 'खोजें (विषय, पद या कीवर्ड)' : 'Search Records (Keyword, Post, City)'}
                  </label>
                  <div className="relative">
                    <input
                      id="public-search-input"
                      type="text"
                      value={publicSearchQuery}
                      onChange={(e) => setPublicSearchQuery(e.target.value)}
                      placeholder={t.searchPublicInfoPlaceholder}
                      className="w-full p-3.5 pl-10 pr-9 rounded-xl border border-border-grey bg-ivory-surface font-semibold text-navy outline-none focus:border-cobalt focus:ring-2 focus:ring-pale-blue text-sm"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                    {publicSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPublicSearchQuery('')}
                        className="absolute right-3 top-3.5 p-1 rounded-full text-slate-400 hover:text-navy cursor-pointer"
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
                    className="w-full min-h-[50px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Search className="w-4 h-4 text-amber-300" />
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
                <div className="bg-white rounded-2xl border border-border-grey shadow-card p-6 sm:p-8 space-y-6 animate-fadeIn">
                  {/* Result Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-grey">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-cobalt bg-pale-blue px-2.5 py-0.5 rounded border border-cobalt/20">
                          {lang === 'hi' ? publicDataResult.catalog.title_hi : publicDataResult.catalog.title_en}
                        </span>
                        <span className="text-xs font-semibold text-slate-subtle">
                          {publicDataResult.filter_value}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {t.verifiedSourceBadge}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-300">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          {t.aiGroundedBadge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-light font-medium mt-1 block">
                        {publicDataResult.source_badge.source} &bull; Resource ID: {publicDataResult.source_badge.resource_id} &bull; Verified: {new Date(publicDataResult.source_badge.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speak(publicDataResult.summary.summary, lang)}
                        className="min-h-[40px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs border-b-2 border-indigo-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>{t.listenAloudBtn}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePublicData}
                        disabled={isSavedCurrentData}
                        className={`min-h-[40px] px-4 rounded-xl font-black text-xs flex items-center gap-1.5 border-2 transition-all cursor-pointer shadow-xs ${
                          isSavedCurrentData
                            ? 'bg-emerald-500 text-white border-emerald-700 border-b-4'
                            : 'bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-950 border-emerald-400'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 text-emerald-800" />
                        <span>{isSavedCurrentData ? t.savedSuccessBtn : t.saveForLaterBtn}</span>
                      </button>
                    </div>
                  </div>

                  {/* Gemini AI Civic Summary Callout */}
                  <div className="p-5 rounded-xl bg-ivory-surface border-l-4 border-cobalt border border-border-grey space-y-2">
                    <span className="text-xs uppercase font-extrabold text-cobalt block">
                      {t.officialSummaryTitle}
                    </span>
                    <p className="font-semibold text-navy leading-relaxed text-base">
                      {publicDataResult.summary.summary}
                    </p>
                    {publicDataResult.summary.advice && (
                      <div className="pt-2 border-t border-border-grey flex items-start gap-2 text-xs">
                        <Info className="w-4 h-4 text-cobalt shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-navy uppercase tracking-wider block text-[10px]">
                            {t.practicalAdviceTitle}
                          </span>
                          <p className="text-slate-dark mt-0.5 font-medium">
                            {publicDataResult.summary.advice}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clean Official Data Table OR Competitive Exam Cards */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-extrabold text-slate-subtle tracking-wider block">
                        {t.recordsTableTitle}
                      </span>
                      <span className="text-xs font-semibold text-slate-dark">
                        {displayRows.length} {lang === 'hi' ? 'प्रविष्टियां उपलब्ध' : 'matching records'}
                      </span>
                    </div>

                    {displayRows.length === 0 ? (
                      <div className="p-8 text-center bg-ivory rounded-xl border border-border-grey text-slate-subtle text-sm font-medium">
                        {lang === 'hi'
                          ? 'आपकी खोज के अनुसार कोई रिकॉर्ड नहीं मिला। कृपया कीवर्ड बदलकर देखें।'
                          : 'No records matched your search term. Try a different keyword or clear the search field.'}
                      </div>
                    ) : publicDataResult.catalog.slug === 'competitive-exams' || Boolean(publicDataResult.rows[0]?.exam_name) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayRows.map((exam: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-5 rounded-2xl border border-border-grey bg-white hover:border-slate-subtle hover:shadow-card transition-all space-y-3.5 flex flex-col justify-between"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2 border-b border-border-subtle pb-2.5">
                                <div>
                                  <h4 className="font-extrabold text-navy text-base leading-snug">
                                    {exam.exam_name}
                                  </h4>
                                  <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded bg-pale-blue text-cobalt border border-cobalt/20">
                                    {exam.conducting_body}
                                  </span>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-saffron flex items-center justify-center shrink-0">
                                  <GraduationCap className="w-4 h-4 text-saffron" />
                                </div>
                              </div>

                              {exam.target_posts && (
                                <div className="text-xs">
                                  <span className="font-bold text-slate-subtle block uppercase tracking-wider text-[10px]">
                                    {t.targetPostsLabel}
                                  </span>
                                  <span className="font-semibold text-navy mt-0.5 block">
                                    {exam.target_posts}
                                  </span>
                                </div>
                              )}

                              {exam.eligibility && (
                                <div className="text-xs">
                                  <span className="font-bold text-slate-subtle block uppercase tracking-wider text-[10px]">
                                    {t.eligibilityLabel}
                                  </span>
                                  <span className="font-medium text-slate-dark mt-0.5 block">
                                    {exam.eligibility}
                                  </span>
                                </div>
                              )}

                              {exam.exam_stages && (
                                <div className="text-xs">
                                  <span className="font-bold text-slate-subtle block uppercase tracking-wider text-[10px]">
                                    {t.examStagesLabel}
                                  </span>
                                  <span className="font-medium text-slate-dark mt-0.5 block bg-ivory p-2 rounded-lg border border-border-subtle">
                                    {exam.exam_stages}
                                  </span>
                                </div>
                              )}

                              {exam.key_timelines_2026 && (
                                <div className="text-xs">
                                  <span className="font-bold text-slate-subtle block uppercase tracking-wider text-[10px]">
                                    {t.timelinesLabel}
                                  </span>
                                  <span className="font-bold text-amber-800 mt-0.5 block">
                                    {exam.key_timelines_2026}
                                  </span>
                                </div>
                              )}

                              {exam.senior_family_tip && (
                                <div className="p-3 rounded-xl bg-pale-amber/40 border border-amber-300 text-xs text-amber-950 font-medium space-y-1">
                                  <span className="font-bold text-[10px] block uppercase tracking-wider text-amber-900">
                                    {t.familyGuidanceTip}
                                  </span>
                                  <p className="leading-relaxed">{exam.senior_family_tip}</p>
                                </div>
                              )}
                            </div>

                            {exam.official_portal && (
                              <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                                <span className="text-[11px] font-mono text-slate-light truncate max-w-[180px]">
                                  {exam.official_portal}
                                </span>
                                <a
                                  href={exam.official_portal.startsWith('http') ? exam.official_portal : `https://${exam.official_portal}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-black transition-colors shadow-sm border-b-2 border-blue-900"
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
                        <div className="hidden md:block overflow-hidden rounded-xl border border-border-grey">
                          <table className="w-full text-left border-collapse bg-white text-sm">
                            <thead>
                              <tr className="bg-ivory border-b border-border-grey text-navy font-bold">
                                {Object.keys(displayRows[0] || {}).map((col) => (
                                  <th key={col} className="p-3 capitalize tracking-tight">
                                    {col.replace(/_/g, ' ')}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle font-medium text-navy/90">
                              {displayRows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-ivory-surface transition-colors">
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
                              className="p-4 rounded-xl border border-border-grey bg-white space-y-1.5 shadow-subtle"
                            >
                              {Object.entries(row).map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-3 text-sm">
                                  <span className="font-semibold text-slate-subtle capitalize">
                                    {k.replace(/_/g, ' ')}:
                                  </span>
                                  <span className="font-bold text-navy text-right">{String(v)}</span>
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
            <div className="space-y-2 border-b border-border-grey pb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pale-mint text-emerald-900 border border-emerald-300 text-xs font-bold">
                <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Public Opportunities & Mentorship &bull; National Portals</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
                {t.resourcesHeading}
              </h1>
              <p className="text-slate-subtle text-base font-normal max-w-3xl leading-relaxed">
                {t.resourcesSubtitle}
              </p>
            </div>

            {/* Category Navigation Pills */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-subtle block">
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
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md border-b-2 border-blue-900'
                          : 'bg-white text-navy border border-border-grey hover:bg-slate-100 hover:border-slate-subtle'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-cobalt'}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Beneficiary Filter & Keyword Search */}
            <div className="bg-white rounded-2xl border border-border-grey shadow-card p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="space-y-1.5 md:col-span-5">
                  <label htmlFor="resource-target-select" className="block text-xs uppercase font-extrabold tracking-wider text-slate-subtle">
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
                    className="w-full p-3.5 rounded-xl border border-border-grey bg-ivory-surface font-semibold text-navy outline-none focus:border-cobalt focus:ring-2 focus:ring-pale-blue cursor-pointer"
                  >
                    <option value="all">{lang === 'hi' ? 'सभी नागरिक व लाभार्थी (All)' : 'All Beneficiaries & Citizens'}</option>
                    <option value="senior">{lang === 'hi' ? 'वरिष्ठ नागरिक एवं बुजुर्ग (Senior Citizens & Elders)' : 'Senior Citizens & Elders'}</option>
                    <option value="students">{lang === 'hi' ? 'छात्र, प्रतियोगी व युवा (Students, Youth & Aspirants)' : 'Students, Youth & Aspirants'}</option>
                    <option value="women">{lang === 'hi' ? 'महिला उद्यमी व स्वयं सहायता समूह (Women Entrepreneurs)' : 'Women Entrepreneurs & SHGs'}</option>
                    <option value="farmers">{lang === 'hi' ? 'लघु उद्यमी, कारीगर व किसान (Micro Business & Farmers)' : 'Micro Business, Artisans & Farmers'}</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-4">
                  <label htmlFor="resource-search-input" className="block text-xs uppercase font-extrabold tracking-wider text-slate-subtle">
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
                      className="w-full p-3.5 pl-10 pr-9 rounded-xl border border-border-grey bg-ivory-surface font-semibold text-navy outline-none focus:border-cobalt focus:ring-2 focus:ring-pale-blue text-sm"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                    {resourceSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setResourceSearchQuery('');
                          fetchResources(selectedResourceCategory, selectedResourceTarget, '');
                        }}
                        className="absolute right-3 top-3.5 p-1 rounded-full text-slate-400 hover:text-navy cursor-pointer"
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
                    className="w-full min-h-[50px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Search className="w-4 h-4 text-amber-300" />
                    <span>{isFetchingResources ? t.fetchingData : (lang === 'hi' ? 'अवसर खोजें' : 'Find Opportunities')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Opportunities List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-grey pb-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-subtle block">
                  {lang === 'hi' ? 'सत्यापित अवसर एवं सेवाएं' : 'Verified Opportunities & Public Services'}
                </span>
                <span className="text-xs font-bold text-slate-dark">
                  {resourcesList.length} {lang === 'hi' ? 'अवसर उपलब्ध' : 'opportunities available'}
                </span>
              </div>

              {isFetchingResources ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-border-grey space-y-3">
                  <div className="w-8 h-8 border-3 border-cobalt border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-semibold text-slate-subtle">{t.fetchingData}</p>
                </div>
              ) : resourcesList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-border-grey space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-ivory text-slate-subtle flex items-center justify-center mx-auto border border-border-grey">
                    <Briefcase className="w-6 h-6 text-cobalt" />
                  </div>
                  <h3 className="text-lg font-extrabold text-navy">{t.noResourcesFound}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedResourceCategory('all');
                      setSelectedResourceTarget('all');
                      setResourceSearchQuery('');
                      fetchResources('all', 'all', '');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs border-b-2 border-blue-900 shadow-sm"
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
                        className="p-5 sm:p-6 rounded-2xl border border-border-grey bg-white hover:border-slate-subtle hover:shadow-card transition-all space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3.5">
                          {/* Badges Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                                resource.category === 'scholarships-education'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : resource.category === 'mentors-orgs'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : resource.category === 'internships-competitions'
                                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                                  : resource.category === 'funding-grants'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : 'bg-cyan-50 text-cyan-900 border-cyan-300'
                              }`}>
                                {resource.category.replace(/-/g, ' ')}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-subtle bg-slate-100 px-2 py-0.5 rounded">
                                {resource.location_coverage}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t.verifiedDateLabel}: {resource.verification_date}</span>
                            </span>
                          </div>

                          {/* Title & Provider */}
                          <div>
                            <h3 className="font-extrabold text-navy text-lg sm:text-xl leading-snug">
                              {lang === 'hi' ? resource.title_hi : resource.title_en}
                            </h3>
                            <p className="text-xs font-bold text-cobalt mt-1">
                              {lang === 'hi' ? resource.provider_hi : resource.provider_en}
                            </p>
                          </div>

                          {/* Description */}
                          <p className="text-sm font-medium text-navy/90 leading-relaxed">
                            {lang === 'hi' ? resource.description_hi : resource.description_en}
                          </p>

                          {/* Why this matches callout */}
                          <div className="p-3.5 rounded-xl bg-pale-mint/40 border border-jade/30 space-y-1">
                            <span className="text-[11px] font-extrabold uppercase text-jade-dark flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-jade" />
                              <span>{t.whyItMatchesTitle}</span>
                            </span>
                            <p className="text-xs sm:text-sm font-semibold text-navy leading-relaxed">
                              {lang === 'hi' ? resource.why_it_matches_hi : resource.why_it_matches_en}
                            </p>
                          </div>

                          {/* Eligibility Requirements Checklist */}
                          <div className="p-3.5 rounded-xl bg-ivory border border-border-subtle space-y-2">
                            <span className="text-[11px] font-extrabold uppercase text-slate-subtle block">
                              {t.eligibilityChecklistTitle}
                            </span>
                            <ul className="space-y-1.5">
                              {(lang === 'hi' ? resource.eligibility_requirements_hi : resource.eligibility_requirements_en).map((req, rIdx) => (
                                <li key={rIdx} className="flex items-start gap-2 text-xs font-semibold text-navy/95">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Missing Requirements Warning */}
                          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-300 space-y-1">
                            <span className="text-[11px] font-extrabold uppercase text-amber-900 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                              <span>{t.missingRequirementsTitle}</span>
                            </span>
                            <p className="text-xs font-medium text-amber-950 leading-relaxed">
                              {lang === 'hi' ? resource.missing_requirements_warning_hi : resource.missing_requirements_warning_en}
                            </p>
                          </div>

                          {/* Schedule / Deadline */}
                          <div className="text-xs flex items-center gap-1.5 text-slate-subtle">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium">Timeline / Schedule:</span>
                            <span className="font-bold text-navy">{resource.deadline_or_schedule}</span>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
                          <a
                            href={resource.official_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs shadow-sm border-b-2 border-blue-900 transition-colors"
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
                              className="p-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 active:bg-indigo-300 text-indigo-950 border border-indigo-300 cursor-pointer shadow-2xs"
                              title={t.listenAloudBtn}
                            >
                              <Volume2 className="w-3.5 h-3.5 text-indigo-700" />
                            </button>

                            {isSaved ? (
                              <button
                                type="button"
                                disabled
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs border-b-2 border-emerald-900 flex items-center gap-1.5 shadow-sm"
                              >
                                <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" />
                                <span>{t.savedSuccessBtn}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSaveResource(resource)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-950 font-black text-xs border-2 border-emerald-400 flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Bookmark className="w-3.5 h-3.5 text-emerald-800" />
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
            <div className="space-y-2 border-b border-border-grey pb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pale-blue text-cobalt border border-cobalt/20 text-xs font-bold">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Anonymous Offline Persistence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
                {t.savedHeading}
              </h1>
              <p className="text-slate-subtle text-base font-normal max-w-3xl leading-relaxed">
                {t.savedSubtitle}
              </p>
            </div>

            {inspectingItem ? (
              /* Full Detailed Dossier Inspector View */
              <div className="bg-white rounded-2xl border border-border-grey shadow-card p-6 sm:p-8 space-y-6 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-grey pb-4">
                  <div>
                    <span className="text-xs font-bold text-cobalt bg-pale-blue px-2.5 py-0.5 rounded border border-cobalt/20">
                      {inspectingItem.kind === 'understand'
                        ? 'Document Breakdown'
                        : inspectingItem.kind === 'resource'
                        ? 'Civic Resource'
                        : 'Public Data Query'}
                    </span>
                    <h2 className="text-xl font-extrabold text-navy mt-1">
                      {inspectingItem.title}
                    </h2>
                    <span className="text-xs text-slate-light font-medium mt-0.5 block">
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
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs border-b-2 border-indigo-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t.listenAloudBtn}</span>
                    </button>
                    {confirmDeleteId === inspectingItem.id ? (
                      <div className="flex items-center gap-1.5 animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedItem(inspectingItem.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs border-b-2 border-rose-900"
                        >
                          {t.deleteBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs cursor-pointer border-2 border-amber-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(inspectingItem.id)}
                        className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                        <span>{t.deleteBtn}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Flow 1 Full Dossier when inspected */}
                {inspectingItem.kind === 'understand' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-ivory border border-border-grey">
                      <span className="text-xs uppercase font-extrabold text-slate-subtle block mb-1">
                        Original Document Text / File:
                      </span>
                      <p className="text-sm font-medium text-navy leading-relaxed">
                        {inspectingItem.payload?.text || inspectingItem.payload?.file_name}
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-ivory-surface border-l-4 border-cobalt border border-border-grey">
                      <span className="text-xs uppercase font-extrabold text-cobalt block mb-1">
                        {t.sectionMeaningTitle}
                      </span>
                      <p className="font-semibold text-navy text-base leading-relaxed">
                        {inspectingItem.payload?.result?.summary}
                      </p>
                    </div>

                    {/* Terms */}
                    {inspectingItem.payload?.result?.terms_explained?.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-xs uppercase font-extrabold text-slate-subtle tracking-wider block">
                          {t.sectionTermsTitle}
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {inspectingItem.payload.result.terms_explained.map((termItem: any, idx: number) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-white border border-border-grey space-y-1.5 shadow-2xs">
                              <div className="flex justify-between items-baseline border-b border-border-grey pb-1.5">
                                <span className="font-extrabold text-navy text-sm">{termItem.term}</span>
                                <span className="text-xs font-semibold text-cobalt bg-pale-blue px-2 py-0.5 rounded border border-cobalt/20">
                                  {termItem.phonetic}
                                </span>
                              </div>
                              <p className="text-xs text-navy/90 font-medium">{termItem.simple_meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {inspectingItem.payload?.result?.action_steps?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs uppercase font-extrabold text-slate-subtle tracking-wider block">
                          {t.sectionActionsTitle}
                        </span>
                        {inspectingItem.payload.result.action_steps.map((actionItem: any) => (
                          <div key={actionItem.step_number} className="p-3 rounded-xl bg-white border border-border-grey text-sm">
                            <span className="font-bold text-navy">{actionItem.action}</span>
                            <span className="block text-xs text-slate-subtle mt-0.5">Deadline: {actionItem.deadline_or_urgency}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Flow 2 Full Dossier when inspected */}
                {inspectingItem.kind === 'public_data' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl bg-ivory-surface border-l-4 border-cobalt border border-border-grey">
                      <span className="text-xs uppercase font-extrabold text-cobalt block mb-1">
                        {t.officialSummaryTitle}
                      </span>
                      <p className="font-semibold text-navy text-base leading-relaxed">
                        {inspectingItem.payload?.summary?.summary}
                      </p>
                    </div>

                    {inspectingItem.payload?.rows?.length > 0 && (
                      <div className="overflow-hidden rounded-xl border border-border-grey">
                        <table className="w-full text-left border-collapse bg-white text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-ivory border-b border-border-grey text-navy font-bold">
                              {Object.keys(inspectingItem.payload.rows[0] || {}).map((col) => (
                                <th key={col} className="p-2.5 capitalize">{col.replace(/_/g, ' ')}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-subtle font-medium text-navy/90">
                            {inspectingItem.payload.rows.map((row: any, rIdx: number) => (
                              <tr key={rIdx} className="hover:bg-ivory-surface">
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
                      <span className="text-xs font-bold text-cobalt bg-pale-blue px-2.5 py-0.5 rounded border border-cobalt/20 capitalize">
                        {inspectingItem.payload?.category?.replace(/-/g, ' ')}
                      </span>
                      <span className="text-xs font-semibold text-slate-subtle bg-slate-100 px-2 py-0.5 rounded">
                        {inspectingItem.payload?.location_coverage}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified: {inspectingItem.payload?.verification_date} &bull; {inspectingItem.payload?.verified_source}
                      </span>
                    </div>

                    <div className="p-5 rounded-xl bg-ivory-surface border-l-4 border-cobalt border border-border-grey space-y-2">
                      <span className="text-xs uppercase font-extrabold text-cobalt block">
                        {lang === 'hi' ? 'संसाधन विवरण' : 'Resource Overview'}
                      </span>
                      <p className="font-semibold text-navy text-base leading-relaxed">
                        {lang === 'hi' ? inspectingItem.payload?.description_hi : inspectingItem.payload?.description_en}
                      </p>
                      <span className="text-xs text-slate-subtle block font-medium">
                        Provider: {lang === 'hi' ? inspectingItem.payload?.provider_hi : inspectingItem.payload?.provider_en}
                      </span>
                    </div>

                    {/* Why this matches */}
                    <div className="p-4 rounded-xl bg-pale-mint/40 border border-jade/30 space-y-1.5">
                      <span className="text-xs font-extrabold uppercase text-jade-dark flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-jade" />
                        {t.whyItMatchesTitle}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-navy leading-relaxed">
                        {lang === 'hi' ? inspectingItem.payload?.why_it_matches_hi : inspectingItem.payload?.why_it_matches_en}
                      </p>
                    </div>

                    {/* Eligibility criteria */}
                    {inspectingItem.payload?.eligibility_requirements_en && (
                      <div className="space-y-2">
                        <span className="text-xs uppercase font-extrabold text-slate-subtle tracking-wider block">
                          {t.eligibilityChecklistTitle}
                        </span>
                        <div className="p-4 rounded-xl bg-white border border-border-grey space-y-2">
                          {(lang === 'hi'
                            ? inspectingItem.payload?.eligibility_requirements_hi
                            : inspectingItem.payload?.eligibility_requirements_en
                          )?.map((crit: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-navy font-medium">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{crit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing requirements warning */}
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5">
                      <span className="text-xs font-extrabold uppercase text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        {t.missingRequirementsTitle}
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-amber-950 leading-relaxed">
                        {lang === 'hi'
                          ? inspectingItem.payload?.missing_requirements_warning_hi
                          : inspectingItem.payload?.missing_requirements_warning_en}
                      </p>
                    </div>

                    {/* Portal link */}
                    {inspectingItem.payload?.official_link && (
                      <div className="pt-2 border-t border-border-grey flex items-center justify-between">
                        <span className="text-xs text-slate-light font-mono truncate max-w-sm">
                          {inspectingItem.payload.official_link}
                        </span>
                        <a
                          href={inspectingItem.payload.official_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-sm border-b-2 border-blue-900"
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
                {savedItems.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-border-grey p-12 text-center space-y-3 shadow-subtle">
                    <div className="w-12 h-12 rounded-xl bg-ivory text-slate-subtle flex items-center justify-center mx-auto border border-border-grey">
                      <Bookmark className="w-6 h-6 text-cobalt" />
                    </div>
                    <h3 className="text-lg font-extrabold text-navy">
                      {t.savedEmptyTitle}
                    </h3>
                    <p className="text-slate-subtle text-sm max-w-md mx-auto">
                      {t.savedEmptyDesc}
                    </p>
                  </div>
                ) : (
                  savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-xl bg-white border border-border-grey shadow-subtle flex flex-wrap items-center justify-between gap-4 hover:border-slate-subtle transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-pale-blue text-cobalt border border-cobalt/20">
                            {item.kind === 'understand'
                              ? 'Document'
                              : item.kind === 'resource'
                              ? 'Civic Resource'
                              : 'Public Data'}
                          </span>
                          <span className="text-xs text-slate-light font-medium">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-navy">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectingItem(item)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs border-b-2 border-blue-900 transition-all cursor-pointer shadow-sm"
                        >
                          {t.viewDetailsBtn}
                        </button>
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1.5 animate-fadeIn">
                            <button
                              type="button"
                              onClick={() => handleDeleteSavedItem(item.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs border-b-2 border-rose-900"
                            >
                              {t.deleteBtn}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs cursor-pointer border-2 border-amber-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="p-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300 transition-all cursor-pointer shadow-2xs"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4 text-rose-700" />
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

      {/* 3. MOBILE FLOATING NAVIGATION BAR (Architectural & High-Contrast 4-Tab Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border-grey p-2 shadow-lg">
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('understand');
              setInspectingItem(null);
              stopSpeaking();
            }}
            className={`min-h-[48px] rounded-xl font-black text-[11px] sm:text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-xs ${
              activeTab === 'understand'
                ? 'bg-blue-600 text-white shadow-md border-b-2 border-blue-900'
                : 'bg-blue-100 text-blue-950 border border-blue-300 hover:bg-blue-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="truncate">{t.understandTab}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('find');
              setInspectingItem(null);
              stopSpeaking();
            }}
            className={`min-h-[48px] rounded-xl font-black text-[11px] sm:text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-xs ${
              activeTab === 'find'
                ? 'bg-emerald-600 text-white shadow-md border-b-2 border-emerald-900'
                : 'bg-emerald-100 text-emerald-950 border border-emerald-300 hover:bg-emerald-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="truncate">{t.findTab}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('resources');
              setInspectingItem(null);
              stopSpeaking();
            }}
            className={`min-h-[48px] rounded-xl font-black text-[11px] sm:text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-xs ${
              activeTab === 'resources'
                ? 'bg-amber-600 text-white shadow-md border-b-2 border-amber-900'
                : 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="truncate">{t.resourcesTab}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('saved');
              stopSpeaking();
            }}
            className={`min-h-[48px] rounded-xl font-black text-[11px] sm:text-xs flex flex-col items-center justify-center gap-1 transition-all relative shadow-xs ${
              activeTab === 'saved'
                ? 'bg-purple-600 text-white shadow-md border-b-2 border-purple-900'
                : 'bg-purple-100 text-purple-950 border border-purple-300 hover:bg-purple-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="truncate">{t.savedTab}</span>
            {savedItems.length > 0 && (
              <span className="absolute top-1 right-3 w-2.5 h-2.5 rounded-full bg-amber-400 border border-purple-900"></span>
            )}
          </button>
        </div>
      </nav>

      {/* 4. STATIC DIGNIFIED CIVIC FOOTER */}
      <footer className="border-t border-border-grey bg-white/80 py-6 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-subtle">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-navy">Setu (सेतु)</span>
            <span>&bull;</span>
            <span>Devlympics – Shunya 2026</span>
          </div>
          <p className="max-w-xl text-center sm:text-right leading-relaxed font-medium">
            {t.disclaimerText}
          </p>
        </div>
      </footer>
    </div>
  );
}
