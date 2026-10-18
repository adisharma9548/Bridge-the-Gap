import React, { useRef, useState } from 'react';
import {
  Sparkles,
  FileText,
  Landmark,
  Activity,
  ShieldAlert,
  Upload,
  Mic,
  Pause,
  AlertTriangle,
  X,
  Paperclip,
  RotateCcw,
} from 'lucide-react';
import { AttachedFile, DemoId } from '../../types';
import { TranslationDictionary, Language } from '../../i18n/translations';

interface DocumentInputCardProps {
  inputText: string;
  setInputText: (text: string) => void;
  attachedFile: AttachedFile | null;
  activeDemoId: DemoId;
  isAnalyzing: boolean;
  onFileChosen: (file: File) => void;
  onRemoveFile: () => void;
  onClear: () => void;
  onTriggerUnderstand: (explicitText?: string) => void;
  onBankDemo: () => void;
  onMedicalDemo: () => void;
  onInsuranceDemo: () => void;
  t: TranslationDictionary;
  lang: Language;
  // Voice dictation props
  voiceState: string;
  voiceTranscript: string;
  voiceInterim: string;
  voiceError: string | null;
  speechRecognitionSupported: boolean;
  setVoiceTranscript: (text: string) => void;
  startVoiceSession: (lang?: Language) => void;
  pauseVoiceSession: () => void;
  resumeVoiceSession: (lang?: Language) => void;
  cancelVoiceSession: () => void;
  finalizeVoiceSession: () => string;
}

export const DocumentInputCard: React.FC<DocumentInputCardProps> = ({
  inputText,
  setInputText,
  attachedFile,
  activeDemoId,
  isAnalyzing,
  onFileChosen,
  onRemoveFile,
  onClear,
  onTriggerUnderstand,
  onBankDemo,
  onMedicalDemo,
  onInsuranceDemo,
  t,
  lang,
  voiceState,
  voiceTranscript,
  voiceInterim,
  voiceError,
  speechRecognitionSupported,
  setVoiceTranscript,
  startVoiceSession,
  pauseVoiceSession,
  resumeVoiceSession,
  cancelVoiceSession,
  finalizeVoiceSession,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onFileChosen(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
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
            onClick={onBankDemo}
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
            onClick={onMedicalDemo}
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
            onClick={onInsuranceDemo}
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
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    voiceState === 'listening'
                      ? 'bg-semantic-error text-white animate-pulse'
                      : 'bg-aubergine-soft text-aubergine'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-text-primary">{t.voiceConsoleTitle}</h4>
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
                placeholder={
                  lang === 'hi'
                    ? 'आपके द्वारा बोले गए शब्द यहां दिखाई देंगे...'
                    : 'Your spoken words will appear here...'
                }
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
                    onTriggerUnderstand(fullText);
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
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                onTriggerUnderstand();
              }
            }}
            placeholder={
              attachedFile
                ? lang === 'hi'
                  ? 'वैकल्पिक: संलग्न दस्तावेज़ के बारे में कोई विशेष प्रश्न या निर्देश यहां लिखें...'
                  : 'Optional: Add any specific questions or notes about your attached document here...'
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
              onClick={onRemoveFile}
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
                  onFileChosen(e.target.files[0]);
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
                onClick={onClear}
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
            onClick={() => onTriggerUnderstand()}
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
    </div>
  );
};
