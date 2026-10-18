import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Scale,
  Activity,
  AlertTriangle,
  Copy,
} from 'lucide-react';
import gsap from 'gsap';

interface IntroWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const IntroWalkthrough: React.FC<IntroWalkthroughProps> = ({
  isOpen,
  onClose,
  onComplete,
  onNavigateTab: _onNavigateTab,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && slideContainerRef.current) {
      gsap.fromTo(
        slideContainerRef.current,
        { opacity: 0, y: 16, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [currentSlide, isOpen]);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Welcome to Setu — Your Civic Action Bridge',
      badge: 'Step 1 of 4: The Core Problem',
      icon: <Sparkles className="w-6 h-6 text-brass" />,
      tagline: 'Never feel intimidated by complex statutory or medical notices again.',
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm leading-relaxed">
            Every day, citizens receive adversarial notices: loan default demands under <strong>SARFAESI Section 13(2)</strong>, unexpected medical lab panels with alarming biomarkers, or health insurance claim repudiations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-border bg-canvas/60">
              <div className="flex items-center gap-2 text-xs font-bold text-aubergine mb-1">
                <Scale className="w-3.5 h-3.5" /> Bank & Debt
              </div>
              <p className="text-[11px] text-text-secondary">
                NPA classifications, property liens, and statutory 60-day recovery deadlines.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-canvas/60">
              <div className="flex items-center gap-2 text-xs font-bold text-semantic-success mb-1">
                <Activity className="w-3.5 h-3.5" /> Medical Reports
              </div>
              <p className="text-[11px] text-text-secondary">
                Elevated lipid panels, HbA1c ranges, and prescription statin advisories.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-canvas/60">
              <div className="flex items-center gap-2 text-xs font-bold text-persimmon mb-1">
                <FileText className="w-3.5 h-3.5" /> Insurance Claims
              </div>
              <p className="text-[11px] text-text-secondary">
                Pre-existing disease exclusions, waiting periods, and mandatory co-pays.
              </p>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Setu does not give generic chatbot answers. It builds a structured, evidence-grounded action dossier around your exact situation.
          </p>
        </div>
      ),
    },
    {
      title: 'Verbatim Quotes vs Plain-Language Meaning',
      badge: 'Step 2 of 4: Evidence Grounding',
      icon: <ShieldCheck className="w-6 h-6 text-aubergine" />,
      tagline: 'Zero AI hallucinations. Every interpretation is backed by proof.',
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm leading-relaxed">
            Unlike standard AI chatbots that generate unchecked summaries, Setu extracts <strong>verbatim evidence citations</strong> directly from your notice and places them side-by-side with human translations.
          </p>
          <div className="p-4 rounded-xl border-2 border-aubergine/30 bg-aubergine-soft/30 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-aubergine text-white shrink-0 mt-0.5">
                Exact Clause
              </span>
              <p className="text-xs font-mono text-text-primary italic">
                "Account classified as Non-Performing Asset with Rs. 45,000 lien marked on Fixed Deposit..."
              </p>
            </div>
            <div className="flex items-start gap-2.5 pt-1 border-t border-aubergine/20">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-semantic-success text-white shrink-0 mt-0.5">
                Plain Meaning
              </span>
              <p className="text-xs text-text-primary font-medium">
                The bank has temporarily frozen Rs. 45,000 in your fixed deposit because your loan installment was delayed past 90 days.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-semantic-warning/40 bg-semantic-warning-soft text-xs text-semantic-warning flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Setu also explicitly alerts you to what the document does <strong>not</strong> state.</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Action Checklists & Questions to Ask Officials',
      badge: 'Step 3 of 4: Practical Action',
      icon: <CheckCircle2 className="w-6 h-6 text-semantic-success" />,
      tagline: 'Know exactly what to do and what to say during visits.',
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm leading-relaxed">
            Understanding a document is only half the battle. Setu generates a step-by-step checklist with concrete tasks, deadline alerts, and verbatim questions you can ask officials.
          </p>
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl border border-border bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-text-primary font-semibold">
                <span className="w-4 h-4 rounded border-2 border-aubergine bg-aubergine text-white flex items-center justify-center text-[10px]">✓</span>
                <span>Request written statement of account and interest calculation breakdown</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-semantic-error-soft text-semantic-error">
                High Priority
              </span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-text-primary font-semibold">
                <span className="w-4 h-4 rounded border-2 border-border-strong" />
                <span>Ask: "Under which specific clause was my lien marked before 60-day notice?"</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-aubergine-soft text-aubergine flex items-center gap-1">
                <Copy className="w-3 h-3" /> One-Tap Copy
              </span>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            You can check off completed tasks as you resolve them, and export your case file before walking into the bank or hospital.
          </p>
        </div>
      ),
    },
    {
      title: 'Civic Resources & Your Profile Dashboard',
      badge: 'Step 4 of 4: Profile & Resources',
      icon: <Sparkles className="w-6 h-6 text-aubergine" />,
      tagline: 'Instant connection to verified civic resources and your case control profile.',
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm leading-relaxed">
            Setu bridges you to verified civic resources and non-profit advocacy organizations. If you have an unfair debt notice or insurance denial, Setu matches the relevant dispute process:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border bg-surface">
              <div className="text-xs font-bold text-text-primary">Legal Aid & Lok Adalat Resources</div>
              <div className="text-[11px] text-aubergine font-bold mt-0.5">Civil & Debt Counseling</div>
              <p className="text-[11px] text-text-secondary mt-1">
                Access representation and pre-litigation settlement channels for tenancy and loan disputes.
              </p>
            </div>
            <div className="p-3 rounded-xl border border-border bg-surface">
              <div className="text-xs font-bold text-text-primary">Consumer Dispute Grievances</div>
              <div className="text-[11px] text-persimmon font-bold mt-0.5">Online Grievance Filing</div>
              <p className="text-[11px] text-text-secondary mt-1">
                Structured dispute escalation guidance for rejected insurance claims and wrongful bank charges.
              </p>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            All your analyzed notices, checklists, and saved resources are tracked in your <strong>User Profile & Activity Dashboard</strong>.
          </p>
        </div>
      ),
    },
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      localStorage.setItem('setu_intro_completed', 'true');
      if (onComplete) onComplete();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={slideContainerRef}
        className="relative w-full max-w-2xl bg-surface rounded-2xl border-2 border-border shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between min-h-[500px]"
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-aubergine-soft border border-aubergine/20 text-aubergine">
                {slide.icon}
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-persimmon">
                  {slide.badge}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-text-primary leading-tight">
                  {slide.title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-canvas transition-colors"
              aria-label="Close Tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-aubergine font-bold mt-2">{slide.tagline}</p>

          {/* Slide Content */}
          <div className="py-5">{slide.content}</div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
          {/* Step Indicators */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-6 bg-aubergine' : 'w-2 bg-border-strong hover:bg-aubergine/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="py-2.5 px-3.5 rounded-xl border border-border bg-canvas hover:bg-surface text-xs font-bold text-text-secondary flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-5 rounded-xl bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white font-black text-xs sm:text-sm tracking-wide shadow-md border-b-4 border-[#A83D1B] flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{currentSlide === slides.length - 1 ? 'Start Using Setu' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
