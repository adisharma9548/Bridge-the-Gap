import { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../i18n/translations';

export type VoiceState =
  | 'idle'
  | 'requesting_permission'
  | 'listening'
  | 'paused'
  | 'finalizing'
  | 'analysing'
  | 'error';

export interface UseSpeechReturn {
  // Speech Synthesis (Read Aloud)
  speak: (text: string, lang?: Language) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;

  // Voice Input State Machine
  voiceState: VoiceState;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  errorMessage: string | null;
  speechRecognitionSupported: boolean;

  // Voice Actions
  startVoiceSession: (lang?: Language) => void;
  pauseVoiceSession: () => void;
  resumeVoiceSession: (lang?: Language) => void;
  cancelVoiceSession: () => void;
  finalizeVoiceSession: () => string;
  setTranscript: (text: string) => void;
  setVoiceState: (state: VoiceState) => void;
}

export function useSpeech(currentLang: Language = 'en'): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const accumulatedTranscriptRef = useRef('');
  const activeSessionLangRef = useRef<Language>(currentLang);
  const intentionalStopRef = useRef(false);

  // Keep accumulated ref in sync when user edits transcript in UI textarea
  const updateTranscript = useCallback((newText: string) => {
    accumulatedTranscriptRef.current = newText;
    setTranscript(newText);
  }, []);

  // Check Web Speech API availability on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setSpeechRecognitionSupported(hasRecognition);
    }
  }, []);

  // Teardown speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          intentionalStopRef.current = true;
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // ----------------------------------------------------------------------------
  // 1. SPEECH SYNTHESIS (Text-to-Speech)
  // ----------------------------------------------------------------------------
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, []);

  const speak = useCallback(
    (text: string, lang: Language = currentLang) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser.');
        return;
      }

      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      if (!text || text.trim().length === 0) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.88; // Comfortable pace for seniors
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const targetLocale = lang === 'hi' ? 'hi' : 'en-IN';
        const preferredVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes(targetLocale) ||
            (lang === 'en' && v.lang.toLowerCase().includes('en'))
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [currentLang]
  );

  // ----------------------------------------------------------------------------
  // 2. SPEECH RECOGNITION (Controlled Voice State Machine)
  // ----------------------------------------------------------------------------
  const spawnRecognition = useCallback(
    (lang: Language) => {
      if (typeof window === 'undefined') return null;

      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) return null;

      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        intentionalStopRef.current = false;
        setVoiceState('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const textChunk = item[0]?.transcript || '';

          if (item.isFinal) {
            const trimmed = textChunk.trim();
            if (trimmed) {
              const prev = accumulatedTranscriptRef.current.trim();
              const updated = prev ? `${prev} ${trimmed}` : trimmed;
              accumulatedTranscriptRef.current = updated;
              setTranscript(updated);
            }
          } else {
            currentInterim += textChunk;
          }
        }

        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('[Setu Voice Recognition Event Error]:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceState('error');
          setErrorMessage(
            lang === 'hi'
              ? 'माइक्रोफ़ोन अनुमति अस्वीकृत हो गई। कृपया अपने ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।'
              : 'Microphone permission was denied. Please allow microphone access in your browser.'
          );
        } else if (event.error === 'no-speech') {
          // Do not discard transcript on silence! Transition to paused
          setVoiceState('paused');
        } else if (event.error !== 'aborted') {
          setVoiceState('paused');
        }
      };

      recognition.onend = () => {
        setInterimTranscript('');
        // If stopped intentionally by user pause/cancel/finalize, leave in current state
        if (intentionalStopRef.current) return;

        // In Chromium, continuous recognition stops after ~6-8 seconds of silence.
        // Rule: NEVER automatically submit, close, or discard transcript!
        // Transition to 'paused' state gracefully so the senior can resume or analyse.
        setVoiceState((prev) => (prev === 'listening' ? 'paused' : prev));
      };

      return recognition;
    },
    []
  );

  const startVoiceSession = useCallback(
    (lang: Language = currentLang) => {
      if (typeof window === 'undefined') return;

      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        setVoiceState('error');
        setErrorMessage(
          lang === 'hi'
            ? 'इस ब्राउज़र में आवाज़ इनपुट समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।'
            : 'Voice input is not supported on this browser. Please use Chrome or Edge.'
        );
        return;
      }

      // Stop speech synthesis if playing
      stopSpeaking();

      // Reset session variables
      intentionalStopRef.current = false;
      activeSessionLangRef.current = lang;
      accumulatedTranscriptRef.current = '';
      setTranscript('');
      setInterimTranscript('');
      setErrorMessage(null);
      setVoiceState('requesting_permission');

      // Abort previous recognition instance if alive
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const instance = spawnRecognition(lang);
      if (!instance) return;

      recognitionRef.current = instance;
      try {
        instance.start();
      } catch (err: any) {
        console.warn('Recognition start exception:', err);
        setVoiceState('error');
        setErrorMessage(err.message || 'Could not start microphone.');
      }
    },
    [currentLang, stopSpeaking, spawnRecognition]
  );

  const pauseVoiceSession = useCallback(() => {
    intentionalStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setInterimTranscript('');
    setVoiceState('paused');
  }, []);

  const resumeVoiceSession = useCallback(
    (lang: Language = activeSessionLangRef.current) => {
      intentionalStopRef.current = false;
      setErrorMessage(null);
      setVoiceState('requesting_permission');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const instance = spawnRecognition(lang);
      if (!instance) return;

      recognitionRef.current = instance;
      try {
        instance.start();
      } catch (err: any) {
        console.warn('Recognition resume exception:', err);
        setVoiceState('paused');
      }
    },
    [spawnRecognition]
  );

  const cancelVoiceSession = useCallback(() => {
    intentionalStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    accumulatedTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    setVoiceState('idle');
  }, []);

  const finalizeVoiceSession = useCallback(() => {
    intentionalStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    const finalResult = accumulatedTranscriptRef.current.trim();
    setInterimTranscript('');
    setVoiceState('idle');
    return finalResult;
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    voiceState,
    isListening: voiceState === 'listening',
    transcript,
    interimTranscript,
    errorMessage,
    speechRecognitionSupported,
    startVoiceSession,
    pauseVoiceSession,
    resumeVoiceSession,
    cancelVoiceSession,
    finalizeVoiceSession,
    setTranscript: updateTranscript,
    setVoiceState,
  };
}
