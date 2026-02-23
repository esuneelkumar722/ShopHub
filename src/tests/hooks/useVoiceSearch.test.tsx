import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';

// Mock SpeechRecognition API
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  onstart: ((event: Event) => void) | null = null;
  onend: ((event: Event) => void) | null = null;
  onerror: ((event: { error: string; message: string }) => void) | null = null;
  onresult: ((event: { resultIndex: number; results: Array<{ 0: { transcript: string; confidence: number }; isFinal: boolean; length: number; item: () => { transcript: string; confidence: number } }> }) => void) | null = null;

  start() {
    if (this.onstart) {
      this.onstart(new Event('start'));
    }
  }

  stop() {
    if (this.onend) {
      this.onend(new Event('end'));
    }
  }

  abort() {
    if (this.onend) {
      this.onend(new Event('end'));
    }
  }

  // Simulate speech recognition result
  simulateResult(transcript: string, isFinal = true) {
    if (this.onresult) {
      const event = {
        resultIndex: 0,
        results: [
          {
            0: { transcript, confidence: 0.9 },
            isFinal,
            length: 1,
            item: () => ({ transcript, confidence: 0.9 })
          }
        ]
      };
      this.onresult(event);
    }
  }

  // Simulate error
  simulateError(error: string) {
    if (this.onerror) {
      this.onerror({ error, message: `Error: ${error}` });
    }
  }
}

describe('useVoiceSearch', () => {
  let mockRecognition: MockSpeechRecognition;

  beforeEach(() => {
    vi.useFakeTimers();
    mockRecognition = new MockSpeechRecognition();

    // Mock the global SpeechRecognition as a constructor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).SpeechRecognition = function() { return mockRecognition; };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).webkitSpeechRecognition = function() { return mockRecognition; };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).SpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).webkitSpeechRecognition;
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useVoiceSearch());

    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.isSupported).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isFinalResult).toBe(false);
  });

  it('should detect browser support', () => {
    const { result } = renderHook(() => useVoiceSearch());
    expect(result.current.isSupported).toBe(true);
  });

  it('should show error for unsupported browsers', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).SpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).webkitSpeechRecognition;

    const { result } = renderHook(() => useVoiceSearch());

    expect(result.current.isSupported).toBe(false);
    expect(result.current.error).toBe('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.');
  });

  it('should start listening when startListening is called', () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should stop listening when stopListening is called', () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.stopListening();
    });

    expect(result.current.isListening).toBe(false);
  });

  it('should capture and clean transcript (remove trailing punctuation)', () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognition.simulateResult('wireless mouse.', true);
    });

    expect(result.current.transcript).toBe('wireless mouse');
    expect(result.current.isFinalResult).toBe(true);
  });

  it('should remove various trailing punctuation marks', () => {
    const { result } = renderHook(() => useVoiceSearch());

    const testCases = [
      { input: 'laptop.', expected: 'laptop' },
      { input: 'keyboard,', expected: 'keyboard' },
      { input: 'mouse!', expected: 'mouse' },
      { input: 'headphones?', expected: 'headphones' },
      { input: 'phone;', expected: 'phone' },
      { input: 'tablet:', expected: 'tablet' },
    ];

    testCases.forEach(({ input, expected }) => {
      act(() => {
        result.current.startListening();
      });

      act(() => {
        mockRecognition.simulateResult(input, true);
      });

      expect(result.current.transcript).toBe(expected);

      act(() => {
        result.current.resetTranscript();
      });
    });
  });

  it('should set isFinalResult to true when final result is received', () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    // Interim result
    act(() => {
      mockRecognition.simulateResult('hello', false);
    });

    expect(result.current.isFinalResult).toBe(false);

    // Final result
    act(() => {
      mockRecognition.simulateResult('hello world', true);
    });

    expect(result.current.isFinalResult).toBe(true);
  });

  it('should handle no-speech error', () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognition.simulateError('no-speech');
    });

    expect(result.current.isListening).toBe(false);
    expect(result.current.error).toBe('No speech detected. Please try again.');

    // Error should auto-dismiss after 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle network error', () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognition.simulateError('network');
    });

    expect(result.current.error).toBe('Network error. Please check your internet connection.');

    // Error should auto-dismiss after 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle not-allowed error', async () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognition.simulateError('not-allowed');
    });

    expect(result.current.error).toBe('Microphone access denied. Please allow microphone permissions.');
  });

  it('should handle aborted error without showing error message', () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognition.simulateError('aborted');
    });

    expect(result.current.error).toBeNull();
  });

  it('should reset transcript when resetTranscript is called', () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognition.simulateResult('test transcript', true);
    });

    expect(result.current.transcript).toBe('test transcript');
    expect(result.current.isFinalResult).toBe(true);

    act(() => {
      result.current.resetTranscript();
    });

    expect(result.current.transcript).toBe('');
    expect(result.current.isFinalResult).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should auto-dismiss error messages after 1 second', () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognition.simulateError('no-speech');
    });

    expect(result.current.error).toBe('No speech detected. Please try again.');

    // Advance timer by 500ms - error should still be there
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.error).toBe('No speech detected. Please try again.');

    // Advance timer by another 500ms (total 1000ms) - error should be dismissed
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.error).toBeNull();
  });

  it('should clear previous error timeout when new error occurs', () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    // First error
    act(() => {
      mockRecognition.simulateError('no-speech');
    });

    expect(result.current.error).toBe('No speech detected. Please try again.');

    // Advance timer by 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Second error before first one auto-dismisses
    act(() => {
      mockRecognition.simulateError('network');
    });

    expect(result.current.error).toBe('Network error. Please check your internet connection.');

    // Advance another 500ms (total 1000ms from first error, 500ms from second)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Error should still be there (only 500ms since second error)
    expect(result.current.error).toBe('Network error. Please check your internet connection.');

    // Advance another 500ms (1000ms from second error)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.error).toBeNull();
  });

  it('should reset isFinalResult when starting new listening session', () => {
    const { result } = renderHook(() => useVoiceSearch());

    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognition.simulateResult('first query', true);
    });

    expect(result.current.isFinalResult).toBe(true);

    // Start new listening session
    act(() => {
      result.current.startListening();
    });

    expect(result.current.isFinalResult).toBe(false);
    expect(result.current.transcript).toBe('');
  });
});
