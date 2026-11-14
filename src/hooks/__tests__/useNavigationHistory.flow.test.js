import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigationHistory } from '../useNavigationHistory';

// Locks and timers of the hook: pushes locked for 100 ms, popstate flags cleared after 150 ms,
// a push dropped while navigating, the fallback for a popstate without an index.
const pop = (state) => act(() => window.dispatchEvent(new PopStateEvent('popstate', { state })));
const wait = (ms) => act(async () => vi.advanceTimersByTimeAsync(ms));

describe('useNavigationHistory, locks and timers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.history.replaceState(null, '', window.location.href);
    vi.spyOn(window.history, 'go').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('drops a push while navigating, until the popstate that follows has been processed', async () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('a'));
    await wait(100);
    act(() => {
      result.current.goBack();
    });
    act(() => result.current.pushHistory('b')); // dropped: navigating
    expect(result.current.history).toHaveLength(2);

    pop({ index: 0 });
    act(() => result.current.pushHistory('c')); // dropped: the popstate is being processed
    expect(result.current.history).toHaveLength(2);

    await wait(150); // flags cleared
    act(() => result.current.pushHistory('d'));
    expect(result.current.currentState.type).toBe('d');
  });

  it('skips a push equal to the current entry once the lock is over', async () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('tab', { id: 2 }));
    await wait(100);
    act(() => result.current.pushHistory('tab', { id: 2 }));
    expect(result.current.history).toHaveLength(2);
  });

  it('goes forward when there is an entry ahead', async () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('a'));
    await wait(100);
    pop({ index: 0 });
    await wait(150);
    let entry;
    act(() => {
      entry = result.current.goForward();
    });
    expect(entry.type).toBe('a');
    expect(window.history.go).toHaveBeenCalledWith(1);
  });

  it('ignores a second popstate while the first is processed', async () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('a'));
    await wait(100);
    pop({ index: 0 });
    pop({ index: 1 }); // ignored
    expect(result.current.currentIndex).toBe(0);
    await wait(150);
  });

  it('steps back one entry on a popstate without an index, and stays at the start', async () => {
    const { result } = renderHook(() => useNavigationHistory());
    act(() => result.current.pushHistory('a'));
    await wait(100);
    pop(null);
    expect(result.current.currentIndex).toBe(0);
    await wait(150);
    pop(null);
    expect(result.current.currentIndex).toBe(0);
    await wait(150);
  });

  it('ignores a negative index', async () => {
    const { result } = renderHook(() => useNavigationHistory());
    pop({ index: -1 });
    expect(result.current.currentIndex).toBe(0);
    await wait(150);
  });
});
