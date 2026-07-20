import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Message from '../Message';

describe('Message', () => {
  it('renders the message text (via dangerouslySetInnerHTML)', () => {
    render(<Message msg="Hello <b>world</b>" />);
    expect(screen.getByText('world')).toBeInTheDocument();
  });

  it('applies the given background/text colors, falling back to defaults', () => {
    const { container, rerender } = render(<Message msg="x" bgColor="#111111" textColor="#222222" />);
    const box = container.querySelector('.floating-message');
    expect(box.style.backgroundColor).toBe('rgb(17, 17, 17)');
    expect(box.style.color).toBe('rgb(34, 34, 34)');

    rerender(<Message msg="x" />);
    expect(container.querySelector('.floating-message').style.backgroundColor).toBe('rgb(220, 53, 69)');
  });

  it('calls onDoubleClick when provided and double-clicked', () => {
    const onDoubleClick = vi.fn();
    const { container } = render(<Message msg="x" onDoubleClick={onDoubleClick} />);
    fireEvent.doubleClick(container.querySelector('.floating-message'));
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('shows a hint title only when onDoubleClick is provided', () => {
    const { container, rerender } = render(<Message msg="x" onDoubleClick={() => {}} />);
    expect(container.querySelector('.floating-message')).toHaveAttribute('title', 'Double click to dismiss');

    rerender(<Message msg="x" />);
    expect(container.querySelector('.floating-message')).toHaveAttribute('title', '');
  });

  it('does not throw when double-clicked with no onDoubleClick handler', () => {
    const { container } = render(<Message msg="x" />);
    expect(() => fireEvent.doubleClick(container.querySelector('.floating-message'))).not.toThrow();
  });
});
