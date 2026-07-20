import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTextToSpeech } from '../useTextToSpeech';

beforeEach(() => {
  window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn(), speaking: false };
  window.SpeechSynthesisUtterance = vi.fn().mockImplementation(function (text) {
    this.text = text;
  });
});

describe('useTextToSpeech', () => {
  it('starts not speaking', () => {
    const { result } = renderHook(() => useTextToSpeech());
    expect(result.current.isSpeaking).toBe(false);
  });

  it('does nothing for empty/whitespace-only text', () => {
    const { result } = renderHook(() => useTextToSpeech());
    act(() => result.current.speak('   '));
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('speaks real text with the given language and default rate/pitch/volume', () => {
    const { result } = renderHook(() => useTextToSpeech());
    act(() => result.current.speak('hola mundo', 'es-ES'));

    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.text).toBe('hola mundo');
    expect(utterance.lang).toBe('es-ES');
    expect(utterance.rate).toBe(0.9);
    expect(utterance.pitch).toBe(1);
    expect(utterance.volume).toBe(1);
  });

  it('defaults to es-ES when no language is given', () => {
    const { result } = renderHook(() => useTextToSpeech());
    act(() => result.current.speak('hola'));
    expect(window.speechSynthesis.speak.mock.calls[0][0].lang).toBe('es-ES');
  });

  it('sets isSpeaking true on the utterance onstart callback', () => {
    const { result } = renderHook(() => useTextToSpeech());
    act(() => result.current.speak('hola'));
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];

    act(() => utterance.onstart());
    expect(result.current.isSpeaking).toBe(true);
  });

  it('resets isSpeaking on the utterance onend callback', () => {
    const { result } = renderHook(() => useTextToSpeech());
    act(() => result.current.speak('hola'));
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    act(() => utterance.onstart());

    act(() => utterance.onend());
    expect(result.current.isSpeaking).toBe(false);
  });

  it('resets isSpeaking on the utterance onerror callback', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useTextToSpeech());
    act(() => result.current.speak('hola'));
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    act(() => utterance.onstart());

    act(() => utterance.onerror({ error: 'network' }));
    expect(result.current.isSpeaking).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('cancels any current utterance before starting a new one', () => {
    const { result } = renderHook(() => useTextToSpeech());
    act(() => result.current.speak('first'));
    const first = window.speechSynthesis.speak.mock.calls[0][0];
    act(() => first.onstart()); // now "speaking", currentUtterance is set

    act(() => result.current.speak('second'));
    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(1);
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(2);
  });

  it('stop() cancels only while actually speaking', () => {
    const { result } = renderHook(() => useTextToSpeech());

    window.speechSynthesis.speaking = false;
    act(() => result.current.stop());
    expect(window.speechSynthesis.cancel).not.toHaveBeenCalled();

    window.speechSynthesis.speaking = true;
    act(() => result.current.stop());
    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(1);
    expect(result.current.isSpeaking).toBe(false);
  });

  it('toggle() speaks when idle and stops when already speaking', () => {
    window.speechSynthesis.speaking = true;
    const { result } = renderHook(() => useTextToSpeech());

    act(() => result.current.toggle('hola', 'es-ES'));
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    act(() => utterance.onstart());

    act(() => result.current.toggle('hola', 'es-ES'));
    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(1);
  });
});
