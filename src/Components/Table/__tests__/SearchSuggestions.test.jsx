import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchSuggestions from '../SearchSuggestions';

describe('SearchSuggestions', () => {
  it('renders nothing when there are no suggestions', () => {
    const { container } = render(
      <SearchSuggestions suggestions={[]} selectedIndex={-1} onSuggestionClick={() => {}} onSuggestionHover={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders every suggestion and marks the selected one', () => {
    render(
      <SearchSuggestions
        suggestions={['Naruto', 'Bleach']}
        selectedIndex={1}
        onSuggestionClick={() => {}}
        onSuggestionHover={() => {}}
      />
    );
    expect(screen.getByText('Naruto')).not.toHaveClass('selected');
    expect(screen.getByText('Bleach')).toHaveClass('selected');
  });

  it('calls onSuggestionClick with the clicked suggestion', () => {
    const onSuggestionClick = vi.fn();
    render(
      <SearchSuggestions
        suggestions={['Naruto']}
        selectedIndex={-1}
        onSuggestionClick={onSuggestionClick}
        onSuggestionHover={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Naruto'));
    expect(onSuggestionClick).toHaveBeenCalledWith('Naruto');
  });

  it('calls onSuggestionHover with the hovered index', () => {
    const onSuggestionHover = vi.fn();
    render(
      <SearchSuggestions
        suggestions={['Naruto', 'Bleach']}
        selectedIndex={-1}
        onSuggestionClick={() => {}}
        onSuggestionHover={onSuggestionHover}
      />
    );
    fireEvent.mouseEnter(screen.getByText('Bleach'));
    expect(onSuggestionHover).toHaveBeenCalledWith(1);
  });
});
