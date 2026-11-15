// Ported from finan-react (same hook). Covers boot, reconnection retries, visibility, interval and network changes.
import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../services/data.service', () => ({ default: { boot: vi.fn() } }));
import DataService from '../../services/data.service';
import { useAlive } from '../useAlive';

const up = { data: 'ok' };
const down = { err: { message: 'offline' } };

// Lets pending promises (boot's await) settle inside act
const flush = () => act(async () => {});
const advance = (ms) => act(async () => vi.advanceTimersByTimeAsync(ms));

const setVisibility = (state) => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('useAlive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    DataService.boot.mockReset();
    delete navigator.connection;
  });
  afterEach(() => {
    vi.useRealTimers();
    delete navigator.connection;
  });

  it('boots with the loader on mount and reports the server as reachable', async () => {
    DataService.boot.mockResolvedValue(up);
    const { result } = renderHook(() => useAlive());
    expect(result.current.proc).toBe(true);
    await flush();
    expect(result.current.init).toEqual(expect.any(Number));
    expect(result.current.proc).toBe(false);
  });

  it('marks the server unreachable on an error answer or a thrown request', async () => {
    DataService.boot.mockResolvedValueOnce(down);
    const first = renderHook(() => useAlive());
    await flush();
    expect(first.result.current.init).toBe(false);
    first.unmount();

    DataService.boot.mockRejectedValueOnce(new Error('network'));
    const second = renderHook(() => useAlive());
    await flush();
    expect(second.result.current.init).toBe(false);
  });

  it('does not start a second boot while one is running, and returns the current state', async () => {
    let finish;
    DataService.boot.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const { result } = renderHook(() => useAlive());
    let second;
    await act(async () => {
      second = await result.current.boot(false);
    });
    expect(second).toBe(false);
    expect(DataService.boot).toHaveBeenCalledTimes(1);
    await act(async () => finish(up));
  });

  it('setInit and setProc are exposed', async () => {
    DataService.boot.mockResolvedValue(up);
    const { result } = renderHook(() => useAlive());
    await flush();
    act(() => result.current.setInit(false));
    act(() => result.current.setProc(true));
    expect(result.current.init).toBe(false);
    expect(result.current.proc).toBe(true);
  });

  it('going offline clears init; coming back online reconnects at once', async () => {
    DataService.boot.mockResolvedValue(up);
    const { result } = renderHook(() => useAlive());
    await flush();
    act(() => window.dispatchEvent(new Event('offline')));
    expect(result.current.init).toBe(false);
    await act(async () => window.dispatchEvent(new Event('online')));
    expect(result.current.init).toEqual(expect.any(Number));
    expect(DataService.boot).toHaveBeenCalledTimes(2);
  });

  it('does nothing on online when already connected', async () => {
    DataService.boot.mockResolvedValue(up);
    renderHook(() => useAlive());
    await flush();
    await act(async () => window.dispatchEvent(new Event('online')));
    expect(DataService.boot).toHaveBeenCalledTimes(1);
  });

  it('retries after 1, 3 and 5 seconds, then gives up', async () => {
    DataService.boot.mockResolvedValue(down);
    renderHook(() => useAlive());
    await flush(); // mount boot
    await act(async () => window.dispatchEvent(new Event('online')));
    expect(DataService.boot).toHaveBeenCalledTimes(2);
    await advance(1000);
    expect(DataService.boot).toHaveBeenCalledTimes(3);
    await advance(3000);
    expect(DataService.boot).toHaveBeenCalledTimes(4);
    await advance(5000);
    expect(DataService.boot).toHaveBeenCalledTimes(5);
    await advance(5000); // still before the 15-second check
    expect(DataService.boot).toHaveBeenCalledTimes(5);
  });

  it('stops retrying once a retry succeeds', async () => {
    DataService.boot.mockResolvedValue(down);
    renderHook(() => useAlive());
    await flush();
    await act(async () => window.dispatchEvent(new Event('online')));
    DataService.boot.mockResolvedValue(up);
    await advance(1000);
    expect(DataService.boot).toHaveBeenCalledTimes(3);
    await advance(8000);
    expect(DataService.boot).toHaveBeenCalledTimes(3);
  });

  it('stops retrying when the connection comes back during a wait, before or after it', async () => {
    DataService.boot.mockResolvedValue(down);
    const { result } = renderHook(() => useAlive());
    await flush();
    await act(async () => window.dispatchEvent(new Event('online')));
    // Connected by another path while waiting: the loop checks after the sleep
    act(() => result.current.setInit(Date.now()));
    await advance(1000);
    expect(DataService.boot).toHaveBeenCalledTimes(2);
  });

  it('stops before the first wait when the boot already running connects', async () => {
    let finish;
    DataService.boot.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    renderHook(() => useAlive());
    await act(async () => {
      // The mount boot answers, and in the same moment the browser reports online:
      // the reconnect's own try returns at once (a boot is running), and by the time
      // the reconnect looks again the mount boot has connected.
      finish(up);
      window.dispatchEvent(new Event('online'));
    });
    await advance(10000);
    expect(DataService.boot).toHaveBeenCalledTimes(1);
  });

  it('boots when the app becomes visible while offline, and not otherwise', async () => {
    DataService.boot.mockResolvedValue(down);
    renderHook(() => useAlive());
    await flush();
    await act(async () => setVisibility('hidden'));
    expect(DataService.boot).toHaveBeenCalledTimes(1);
    await act(async () => setVisibility('visible'));
    expect(DataService.boot).toHaveBeenCalledTimes(2);

    DataService.boot.mockResolvedValue(up);
    await act(async () => setVisibility('visible'));
    await act(async () => setVisibility('visible'));
    expect(DataService.boot).toHaveBeenCalledTimes(3);
  });

  it('checks every 15 seconds while offline, and not once connected', async () => {
    DataService.boot.mockResolvedValue(down);
    renderHook(() => useAlive());
    await flush();
    DataService.boot.mockResolvedValue(up);
    await advance(15000);
    expect(DataService.boot).toHaveBeenCalledTimes(2);
    await advance(15000);
    expect(DataService.boot).toHaveBeenCalledTimes(2);
  });

  it('reconnects on a network change where the browser reports them, and cleans up', async () => {
    const listeners = {};
    navigator.connection = {
      addEventListener: vi.fn((type, fn) => (listeners[type] = fn)),
      removeEventListener: vi.fn(),
    };
    DataService.boot.mockResolvedValue(down);
    const { unmount } = renderHook(() => useAlive());
    await flush();
    DataService.boot.mockResolvedValue(up);
    await act(async () => listeners.change());
    expect(DataService.boot).toHaveBeenCalledTimes(2);
    unmount();
    expect(navigator.connection.removeEventListener).toHaveBeenCalledWith('change', listeners.change);
  });

  it('does not boot again on a re-render', async () => {
    DataService.boot.mockResolvedValue(up);
    const { result, rerender } = renderHook(() => useAlive());
    await flush();
    rerender();
    expect(result.current.init).toEqual(expect.any(Number));
    expect(DataService.boot).toHaveBeenCalledTimes(1);
  });
});
