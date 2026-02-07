import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation, useFocusTrap, announceToScreenReader } from '../../hooks/useAccessibility';

describe('useKeyboardNavigation', () => {
  let mockOnEscape = vi.fn<() => void>();
  let mockOnEnter = vi.fn<() => void>();

  beforeEach(() => {
    mockOnEscape = vi.fn();
    mockOnEnter = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls onEscape when Escape key is pressed', () => {
    renderHook(() => useKeyboardNavigation(mockOnEscape, mockOnEnter));

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    expect(mockOnEscape).toHaveBeenCalled();
  });

  it('calls onEnter when Enter key is pressed', () => {
    renderHook(() => useKeyboardNavigation(mockOnEscape, mockOnEnter));

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(enterEvent);

    expect(mockOnEnter).toHaveBeenCalled();
  });

  it('does not call callbacks for other keys', () => {
    renderHook(() => useKeyboardNavigation(mockOnEscape, mockOnEnter));

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    document.dispatchEvent(spaceEvent);

    expect(mockOnEscape).not.toHaveBeenCalled();
    expect(mockOnEnter).not.toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardNavigation(mockOnEscape, mockOnEnter));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

describe('useFocusTrap', () => {
  beforeEach(() => {
    // Create mock focusable elements
    document.body.innerHTML = `
      <button id="first">First</button>
      <button id="second">Second</button>
      <button id="last">Last</button>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('does nothing when not active', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    renderHook(() => useFocusTrap(false));

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('sets up focus trap when active', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(() => { });

    renderHook(() => useFocusTrap(true));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(focusSpy).toHaveBeenCalled();
  });

  it('moves focus to last element when tabbing from first with shift', () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(() => { });
    const preventDefaultSpy = vi.fn();

    renderHook(() => useFocusTrap(true));

    // Simulate being on first element and pressing Shift+Tab
    Object.defineProperty(document, 'activeElement', {
      value: document.getElementById('first'),
      writable: true
    });

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
    tabEvent.preventDefault = preventDefaultSpy;
    document.dispatchEvent(tabEvent);

    expect(focusSpy).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('moves focus to first element when tabbing from last', () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(() => { });
    const preventDefaultSpy = vi.fn();

    renderHook(() => useFocusTrap(true));

    // Simulate being on last element and pressing Tab
    Object.defineProperty(document, 'activeElement', {
      value: document.getElementById('last'),
      writable: true
    });

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    tabEvent.preventDefault = preventDefaultSpy;
    document.dispatchEvent(tabEvent);

    expect(focusSpy).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useFocusTrap(true));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

describe('announceToScreenReader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('creates and appends announcement element', () => {
    announceToScreenReader('Test message');

    const announcement = document.querySelector('[role="status"]');
    expect(announcement).toBeInTheDocument();
    expect(announcement).toHaveAttribute('aria-live', 'polite');
    expect(announcement).toHaveAttribute('aria-atomic', 'true');
    expect(announcement).toHaveClass('sr-only');
    expect(announcement).toHaveTextContent('Test message');
  });

  it('uses assertive priority when specified', () => {
    announceToScreenReader('Test message', 'assertive');

    const announcement = document.querySelector('[role="status"]');
    expect(announcement).toHaveAttribute('aria-live', 'assertive');
  });

  it('removes announcement element after timeout', () => {
    announceToScreenReader('Test message');

    expect(document.querySelector('[role="status"]')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(document.querySelector('[role="status"]')).not.toBeInTheDocument();
  });
});