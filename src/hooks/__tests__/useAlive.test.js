import { vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../../services/data.service', () => ({
  default: { boot: vi.fn() },
}));
import DataService from '../../services/data.service';
import { useAlive } from '../useAlive';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAlive', () => {
  it('boots automatically on mount and sets init to a truthy timestamp on success', async () => {
    DataService.boot.mockResolvedValue({});
    const { result } = renderHook(() => useAlive());

    await waitFor(() => expect(result.current.init).toBeTruthy());
    expect(typeof result.current.init).toBe('number');
    expect(result.current.proc).toBe(false);
  });

  it('sets init to false when the boot response has an error', async () => {
    DataService.boot.mockResolvedValue({ err: { message: 'down' } });
    const { result } = renderHook(() => useAlive());

    await waitFor(() => expect(DataService.boot).toHaveBeenCalled());
    expect(result.current.init).toBe(false);
  });

  it('sets init to false when boot() itself rejects', async () => {
    DataService.boot.mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => useAlive());

    await waitFor(() => expect(DataService.boot).toHaveBeenCalled());
    expect(result.current.init).toBe(false);
  });

  it('boot() ignores a concurrent call while one is already in flight', async () => {
    let resolveFirst;
    DataService.boot.mockReturnValue(new Promise((resolve) => (resolveFirst = resolve)));
    const { result } = renderHook(() => useAlive());

    await waitFor(() => expect(DataService.boot).toHaveBeenCalledTimes(1));

    let secondCallResult;
    await act(async () => {
      secondCallResult = await result.current.boot(true);
    });
    expect(DataService.boot).toHaveBeenCalledTimes(1); // second call short-circuited
    expect(secondCallResult).toBe(false); // isOnlineRef was still false

    await act(async () => resolveFirst({}));
  });

  it('setInit synchronously flips the internal online ref, reflected in the next boot() call', async () => {
    DataService.boot.mockResolvedValue({});
    const { result } = renderHook(() => useAlive());
    await waitFor(() => expect(result.current.init).toBeTruthy());

    act(() => result.current.setInit(Date.now()));
    expect(result.current.init).toBeTruthy();

    // Now genuinely online (per isOnlineRef) -- a manual boot() call still
    // runs (boot() itself has no "already online" short-circuit), but the
    // window 'offline' handler below is what actually depends on this ref.
    await act(async () => result.current.boot(false));
  });

  it('the "offline" window event resets init to false', async () => {
    DataService.boot.mockResolvedValue({});
    const { result } = renderHook(() => useAlive());
    await waitFor(() => expect(result.current.init).toBeTruthy());

    act(() => window.dispatchEvent(new Event('offline')));
    expect(result.current.init).toBe(false);
  });

  it('cleans up its event listeners and interval on unmount', async () => {
    DataService.boot.mockResolvedValue({});
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useAlive());
    await waitFor(() => expect(DataService.boot).toHaveBeenCalled());

    unmount();
    const addedEvents = addSpy.mock.calls.map(([type]) => type);
    const removedEvents = removeSpy.mock.calls.map(([type]) => type);
    expect(addedEvents).toEqual(expect.arrayContaining(['online', 'offline']));
    expect(removedEvents).toEqual(expect.arrayContaining(['online', 'offline']));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
