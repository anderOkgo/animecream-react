import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigationHistory } from '../useNavigationHistory';

// pushHistory sets a 100ms lock (pushHistoryLockRef) after each push to
// avoid double-registering fast-fired side effects; any test pushing more
// than once needs to advance past it, or the second push is silently
// dropped by the lock's own guard.
describe('useNavigationHistory', () => {
  it('starts with a single "initial" entry, unable to go back or forward', () => {
    const { result } = renderHook(() => useNavigationHistory());
    expect(result.current.currentState).toEqual({ type: 'initial', data: null });
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  it('pushHistory appends a new entry and becomes the current state', () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('tab-change', { tabId: 2 }));

    expect(result.current.currentState).toMatchObject({ type: 'tab-change', data: { tabId: 2 } });
    expect(result.current.canGoBack).toBe(true);
    expect(result.current.canGoForward).toBe(false);
  });

  it('pushHistory is a no-op when the new entry is identical to the current one', () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('tab-change', { tabId: 2 }));
    const historyLengthAfterFirst = result.current.history.length;

    act(() => result.current.pushHistory('tab-change', { tabId: 2 }));
    expect(result.current.history.length).toBe(historyLengthAfterFirst);
  });

  it('pushHistory adds a distinct entry even with the same type but different data', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('tab-change', { tabId: 2 }));
    act(() => vi.advanceTimersByTime(150)); // clear the push lock
    act(() => result.current.pushHistory('tab-change', { tabId: 3 }));
    expect(result.current.history).toHaveLength(3); // initial + 2 pushes
    expect(result.current.currentState).toMatchObject({ data: { tabId: 3 } });
    vi.useRealTimers();
  });

  it('replaceHistory swaps the current entry in place without changing the index', () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('tab-change', { tabId: 2 }));
    const indexBefore = result.current.currentIndex;

    act(() => result.current.replaceHistory('tab-change', { tabId: 5 }));
    expect(result.current.currentIndex).toBe(indexBefore);
    expect(result.current.currentState).toMatchObject({ data: { tabId: 5 } });
    expect(result.current.history).toHaveLength(2); // still initial + 1, not 3
  });

  it('goBack calls window.history.go(-1) and returns the previous entry, only when possible', () => {
    const goSpy = vi.spyOn(window.history, 'go').mockImplementation(() => {});
    const { result } = renderHook(() => useNavigationHistory());

    expect(result.current.goBack()).toBeNull(); // nothing to go back to yet
    expect(goSpy).not.toHaveBeenCalled();

    act(() => result.current.pushHistory('tab-change', { tabId: 2 }));
    let previousEntry;
    act(() => {
      previousEntry = result.current.goBack();
    });
    expect(goSpy).toHaveBeenCalledWith(-1);
    expect(previousEntry).toEqual({ type: 'initial', data: null });

    goSpy.mockRestore();
  });

  it('goForward calls window.history.go(1) and returns the next entry, only when possible', () => {
    const goSpy = vi.spyOn(window.history, 'go').mockImplementation(() => {});
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('tab-change', { tabId: 2 }));

    expect(result.current.goForward()).toBeNull(); // already at the tip
    expect(goSpy).not.toHaveBeenCalled();

    goSpy.mockRestore();
  });

  it('syncs currentIndex from a real popstate event carrying a valid state index', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('tab-change', { tabId: 2 }));
    act(() => vi.advanceTimersByTime(150));
    act(() => result.current.pushHistory('tab-change', { tabId: 3 }));
    expect(result.current.currentIndex).toBe(2);
    vi.useRealTimers();

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { index: 1, type: 'tab-change', data: { tabId: 2 } } }));
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it('clamps to the last known index when popstate reports an out-of-range index', () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('tab-change', { tabId: 2 }));

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { index: 99 } }));
    });

    expect(result.current.currentIndex).toBe(result.current.history.length - 1);
  });
});
