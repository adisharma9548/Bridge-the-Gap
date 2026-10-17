import { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../i18n/translations';

interface UseSpeechReturn {
  // Speech Synthesis (Read Aloud)
  speak: (text: string, lang?: Language) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;

  // Speech Recognition (Voice Input)
  startListening: (onTranscript: (text: string) => void, lang?: Language) => void;
  stopListening: () => void;
  isListening: boolean;
  speechRecognitionSupported: boolean;
}

export function useSpeech(currentLang: Language = 'en'): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check Web Speech API availability on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setSpeechRecognitionSupported(hasRecognition);
    }
  }, []);

  // Stop speaking and listening when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
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

      // Stop any prior speech
      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      if (!text || text.trim().length === 0) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9; // Slightly slower, comfortable cadence for seniors
      utterance.pitch = 1.0;

      // Try selecting an appropriate native voice
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const targetLocale = lang === 'hi' ? 'hi' : 'en-IN';
        const preferredVoice = voices.find(
          (v) => v.lang.toLowerCase().includes(targetLocale) || (lang === 'en' && v.lang.includes('en'))
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

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
  // 2. SPEECH RECOGNITION (Voice-to-Text)
  // ----------------------------------------------------------------------------
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(
    (onTranscript: (text: string) => void, lang: Language = currentLang) => {
      if (typeof window === 'undefined') return;

      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        alert('Voice input is not supported on this browser. Please try Google Chrome or Microsoft Edge.');
        return;
      }

      // Abort any existing recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition event error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {
        console.warn('Could not start recognition:', e);
        setIsListening(false);
      }
    },
    [currentLang]
  );

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    speechRecognitionSupported,
  };
}
