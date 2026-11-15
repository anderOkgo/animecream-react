import { renderHook, act } from '@testing-library/react';
import useSwipeableTabs from '../useSwipeableTabs';

const touchEvent = (clientX, overrides = {}) => ({
  touches: [{ clientX }],
  changedTouches: [{ clientX }],
  target: { type: 'text', closest: () => null },
  ...overrides,
});

describe('useSwipeableTabs', () => {
  it('starts at the given initial option', () => {
    const { result } = renderHook(() => useSwipeableTabs(2, 4, 170));
    expect(result.current.selectedOption).toBe(2);
  });

  it('swipes left (negative delta) to advance to the next option', () => {
    const { result } = renderHook(() => useSwipeableTabs(1, 4, 170));
    act(() => result.current.handleTouchStart(touchEvent(300)));
    act(() => result.current.handleTouchEnd(touchEvent(100))); // moved left 200px
    expect(result.current.selectedOption).toBe(2);
  });

  it('swipes right (positive delta) to go back to the previous option', () => {
    const { result } = renderHook(() => useSwipeableTabs(2, 4, 170));
    act(() => result.current.handleTouchStart(touchEvent(100)));
    act(() => result.current.handleTouchEnd(touchEvent(300))); // moved right 200px
    expect(result.current.selectedOption).toBe(1);
  });

  it('clamps at the first option (never goes below 1)', () => {
    const { result } = renderHook(() => useSwipeableTabs(1, 4, 170));
    act(() => result.current.handleTouchStart(touchEvent(100)));
    act(() => result.current.handleTouchEnd(touchEvent(300)));
    expect(result.current.selectedOption).toBe(1);
  });

  it('clamps at the last option (never exceeds numOptions)', () => {
    const { result } = renderHook(() => useSwipeableTabs(4, 4, 170));
    act(() => result.current.handleTouchStart(touchEvent(300)));
    act(() => result.current.handleTouchEnd(touchEvent(100)));
    expect(result.current.selectedOption).toBe(4);
  });

  it('ignores a swipe shorter than the threshold', () => {
    const { result } = renderHook(() => useSwipeableTabs(2, 4, 170));
    act(() => result.current.handleTouchStart(touchEvent(300)));
    act(() => result.current.handleTouchEnd(touchEvent(250))); // only 50px
    expect(result.current.selectedOption).toBe(2);
  });

  it('ignores touches that originate from a range input', () => {
    const { result } = renderHook(() => useSwipeableTabs(2, 4, 170));
    act(() => result.current.handleTouchStart(touchEvent(300)));
    act(() =>
      result.current.handleTouchEnd(
        touchEvent(50, { target: { type: 'range', closest: () => null } })
      )
    );
    expect(result.current.selectedOption).toBe(2);
  });

  it('exposes setSelectedOption for direct/external control', () => {
    const { result } = renderHook(() => useSwipeableTabs(1, 4, 170));
    act(() => result.current.setSelectedOption(3));
    expect(result.current.selectedOption).toBe(3);
  });

  it('ignores a second touch end after a short swipe (no new touch start)', () => {
    const { result } = renderHook(() => useSwipeableTabs(2, 4, 170));
    // The first end clears the start
    act(() => result.current.handleTouchStart(touchEvent(100)));
    act(() => result.current.handleTouchEnd(touchEvent(120)));
    act(() => result.current.handleTouchEnd(touchEvent(500)));
    expect(result.current.selectedOption).toBe(2);
  });

  it('ignores a touch end with no touch start', () => {
    const { result } = renderHook(() => useSwipeableTabs(2, 4, 170));
    act(() => result.current.handleTouchEnd(touchEvent(500)));
    expect(result.current.selectedOption).toBe(2);
  });

  it('keeps the swipe when the component re-renders between touch start and end (G14)', () => {
    const { result, rerender } = renderHook(({ n }) => useSwipeableTabs(1, n, 170), { initialProps: { n: 4 } });
    act(() => result.current.handleTouchStart(touchEvent(300)));
    rerender({ n: 4 }); // new handlers, as when the app re-renders mid-swipe
    act(() => result.current.handleTouchEnd(touchEvent(100)));
    expect(result.current.selectedOption).toBe(2);
  });
});
