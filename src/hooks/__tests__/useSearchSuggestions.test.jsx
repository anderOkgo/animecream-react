import { useState } from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { useSearchSuggestions } from '../useSearchSuggestions';

const dataset = [{ production_name: 'Naruto' }, { production_name: 'Nana' }, { production_name: 'One Piece' }];

describe('useSearchSuggestions -- pure logic (renderHook)', () => {
  it('shouldShowSuggestions is false below minChars and true at/above it', () => {
    const { result, rerender } = renderHook(
      ({ term }) => useSearchSuggestions(dataset, term, 2, 10),
      { initialProps: { term: 'n' } }
    );
    expect(result.current.shouldShowSuggestions).toBe(false);

    rerender({ term: 'na' });
    expect(result.current.shouldShowSuggestions).toBe(true);
  });

  it('handleKeyDown does nothing while suggestions are not shown', () => {
    const { result } = renderHook(() => useSearchSuggestions(dataset, 'na', 2, 10));
    const handled = result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() });
    expect(handled).toBe(false);
  });

  it('ArrowDown/ArrowUp move selectedIndex within bounds', () => {
    const { result } = renderHook(() => useSearchSuggestions(dataset, 'na', 2, 10));
    act(() => result.current.setShowSuggestions(true));

    act(() => result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() }));
    expect(result.current.selectedIndex).toBe(0);

    act(() => result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() }));
    expect(result.current.selectedIndex).toBe(1);

    act(() => result.current.handleKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() }));
    expect(result.current.selectedIndex).toBe(0);

    // ArrowUp below 0 clamps to -1, not negative-infinite
    act(() => result.current.handleKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() }));
    act(() => result.current.handleKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() }));
    expect(result.current.selectedIndex).toBe(-1);
  });

  it('ArrowDown does not advance past the last suggestion', () => {
    const { result } = renderHook(() => useSearchSuggestions(dataset, 'na', 2, 10));
    act(() => result.current.setShowSuggestions(true));
    const total = result.current.suggestions.length;

    for (let i = 0; i < total + 3; i++) {
      act(() => result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() }));
    }
    expect(result.current.selectedIndex).toBe(total - 1);
  });

  it('Enter with a selection calls onSuggestionSelect with the selected suggestion', () => {
    const { result } = renderHook(() => useSearchSuggestions(dataset, 'na', 2, 10));
    act(() => result.current.setShowSuggestions(true));
    act(() => result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() }));

    const onSelect = vi.fn();
    act(() => result.current.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() }, onSelect));
    expect(onSelect).toHaveBeenCalledWith(result.current.suggestions[0]);
  });

  it('Enter with no selection (selectedIndex -1) does not call onSuggestionSelect', () => {
    const { result } = renderHook(() => useSearchSuggestions(dataset, 'na', 2, 10));
    act(() => result.current.setShowSuggestions(true));

    const onSelect = vi.fn();
    const handled = result.current.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() }, onSelect);
    expect(onSelect).not.toHaveBeenCalled();
    expect(handled).toBe(false);
  });

  it('Escape hides suggestions and resets the selection', () => {
    const { result } = renderHook(() => useSearchSuggestions(dataset, 'na', 2, 10));
    act(() => result.current.setShowSuggestions(true));
    act(() => result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() }));

    act(() => result.current.handleKeyDown({ key: 'Escape', preventDefault: vi.fn() }));
    expect(result.current.showSuggestions).toBe(false);
    expect(result.current.selectedIndex).toBe(-1);
  });

  it('selectSuggestion calls onSelect, hides the list, and resets the selection', () => {
    const { result } = renderHook(() => useSearchSuggestions(dataset, 'na', 2, 10));
    act(() => result.current.setShowSuggestions(true));
    act(() => result.current.setSelectedIndex(1));

    const onSelect = vi.fn();
    act(() => result.current.selectSuggestion('Nana', onSelect));
    expect(onSelect).toHaveBeenCalledWith('Nana');
    expect(result.current.showSuggestions).toBe(false);
    expect(result.current.selectedIndex).toBe(-1);
  });
});

// Harness for the DOM-dependent effects (auto-show while the real input is
// focused, and closing on an outside click) -- these read `inputRef.current`
// / `document.activeElement`, which only exist with a real rendered input.
function SearchHarness({ term }) {
  const [value, setValue] = useState(term);
  const { suggestions, showSuggestions, inputRef, suggestionsRef } = useSearchSuggestions(dataset, value, 2, 10);
  return (
    <div>
      <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} />
      {showSuggestions && (
        <ul ref={suggestionsRef} data-testid="suggestions">
          {suggestions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}
      <button className="card-close-btn">close</button>
    </div>
  );
}

describe('useSearchSuggestions -- DOM-dependent effects', () => {
  it('auto-shows suggestions once the input is focused and has enough characters', () => {
    render(<SearchHarness term="" />);
    const input = screen.getByRole('textbox');

    input.focus();
    fireEvent.change(input, { target: { value: 'na' } });

    expect(screen.getByTestId('suggestions')).toBeInTheDocument();
  });

  it('hides suggestions again once the term drops below minChars', () => {
    render(<SearchHarness term="" />);
    const input = screen.getByRole('textbox');
    input.focus();
    fireEvent.change(input, { target: { value: 'na' } });
    expect(screen.getByTestId('suggestions')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'n' } });
    expect(screen.queryByTestId('suggestions')).not.toBeInTheDocument();
  });

  it('closes suggestions on a click outside the input/list', () => {
    render(<SearchHarness term="" />);
    const input = screen.getByRole('textbox');
    input.focus();
    fireEvent.change(input, { target: { value: 'na' } });
    expect(screen.getByTestId('suggestions')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId('suggestions')).not.toBeInTheDocument();
  });

  it('closes suggestions when a card close button is clicked', () => {
    render(<SearchHarness term="" />);
    const input = screen.getByRole('textbox');
    input.focus();
    fireEvent.change(input, { target: { value: 'na' } });
    expect(screen.getByTestId('suggestions')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText('close'));
    expect(screen.queryByTestId('suggestions')).not.toBeInTheDocument();
  });
});
