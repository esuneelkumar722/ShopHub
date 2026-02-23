import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVoiceSearchReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  isFinalResult: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useVoiceSearch = (): UseVoiceSearchReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isFinalResult, setIsFinalResult] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to clean transcript by removing trailing punctuation
  const cleanTranscript = (text: string): string => {
    return text.replace(/[.,!?;:]\s*$/, '').trim();
  };

  // Check if browser supports Speech Recognition
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const [error, setError] = useState<string | null>(
    !isSupported ? 'Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.' : null
  );

  // Helper function to set error with auto-dismiss after 1 second
  const setErrorWithAutoDismiss = useCallback((errorMessage: string | null) => {
    // Clear any existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }

    setError(errorMessage);

    // Auto-dismiss after 1 second if there's an error message
    if (errorMessage) {
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false; // Stop after one result
    recognition.interimResults = true; // Show results as user speaks
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setIsFinalResult(false);
      setErrorWithAutoDismiss(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current][0];
      const transcriptResult = cleanTranscript(result.transcript);
      
      setTranscript(transcriptResult);
      
      // If this is the final result, set the flag for auto-submit
      if (event.results[current].isFinal) {
        setIsFinalResult(true);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);

      switch (event.error) {
        case 'no-speech':
          setErrorWithAutoDismiss('No speech detected. Please try again.');
          break;
        case 'network':
          setErrorWithAutoDismiss('Network error. Please check your internet connection.');
          break;
        case 'not-allowed':
          setErrorWithAutoDismiss('Microphone access denied. Please allow microphone permissions.');
          break;
        case 'aborted':
          setErrorWithAutoDismiss(null); // User stopped, no error needed
          break;
        default:
          setErrorWithAutoDismiss('An error occurred. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // Clear timeout on cleanup
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [isSupported, setErrorWithAutoDismiss]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorWithAutoDismiss('Voice search is not supported in your browser.');
      return;
    }

    setTranscript('');
    setIsFinalResult(false);
    setErrorWithAutoDismiss(null);

    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setErrorWithAutoDismiss('Failed to start voice recognition.');
    }
  }, [isSupported, setErrorWithAutoDismiss]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (err) {
      console.error('Error stopping recognition:', err);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setIsFinalResult(false);
    setErrorWithAutoDismiss(null);
  }, [setErrorWithAutoDismiss]);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    isFinalResult,
    startListening,
    stopListening,
    resetTranscript,
  };
};

// Type definitions for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  }

  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };

  var webkitSpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
  }
}
