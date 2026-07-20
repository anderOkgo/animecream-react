import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RangeFilter from '../RangeFilter';

describe('RangeFilter', () => {
  it('renders the label and the displayed value (falling back to raw value)', () => {
    render(<RangeFilter label="Year" min={1990} max={2030} value={2010} onChange={() => {}} />);
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
  });

  it('prefers displayValue over the raw value when given', () => {
    render(
      <RangeFilter label="Year" min={1990} max={2030} value={2010} displayValue="2010s" onChange={() => {}} />
    );
    expect(screen.getByText('2010s')).toBeInTheDocument();
  });

  it('the decrease/increase buttons step by `step` and clamp to min/max', () => {
    const onChange = vi.fn();
    render(<RangeFilter label="Year" min={1990} max={2030} value={2010} step={5} onChange={onChange} />);

    fireEvent.click(screen.getByTitle('Decrease'));
    expect(onChange).toHaveBeenCalledWith(2005);

    fireEvent.click(screen.getByTitle('Increase'));
    expect(onChange).toHaveBeenCalledWith(2015);
  });

  it('disables the decrease/increase buttons at the bounds', () => {
    const { rerender } = render(
      <RangeFilter label="Year" min={1990} max={2030} value={1990} onChange={() => {}} />
    );
    expect(screen.getByTitle('Decrease')).toBeDisabled();
    expect(screen.getByTitle('Increase')).not.toBeDisabled();

    rerender(<RangeFilter label="Year" min={1990} max={2030} value={2030} onChange={() => {}} />);
    expect(screen.getByTitle('Increase')).toBeDisabled();
  });

  it('the range input calls onChange with a parsed integer', () => {
    const onChange = vi.fn();
    render(<RangeFilter label="Year" min={1990} max={2030} value={2010} onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '2020' } });
    expect(onChange).toHaveBeenCalledWith(2020);
  });

  it('a click (no drag) on the header toggles the range disabled, calling onReset when disabling', () => {
    const onReset = vi.fn();
    const { container } = render(
      <RangeFilter label="Year" min={1990} max={2030} value={2010} onChange={() => {}} onReset={onReset} />
    );
    const header = container.querySelector('.range-header');

    fireEvent.mouseDown(header, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseUp(header, { button: 0, clientX: 10, clientY: 10 });

    expect(screen.getByRole('slider')).toBeDisabled();
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('a drag (mouse moved beyond the threshold) does not toggle the range', () => {
    const onReset = vi.fn();
    const { container } = render(
      <RangeFilter label="Year" min={1990} max={2030} value={2010} onChange={() => {}} onReset={onReset} />
    );
    const header = container.querySelector('.range-header');

    fireEvent.mouseDown(header, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseMove(header, { buttons: 1, clientX: 50, clientY: 10 });
    fireEvent.mouseUp(header, { button: 0, clientX: 50, clientY: 10 });

    expect(screen.getByRole('slider')).not.toBeDisabled();
    expect(onReset).not.toHaveBeenCalled();
  });

  it('re-enabling does not call onReset', () => {
    const onReset = vi.fn();
    const { container } = render(
      <RangeFilter label="Year" min={1990} max={2030} value={2010} onChange={() => {}} onReset={onReset} />
    );
    const header = container.querySelector('.range-header');

    // First click: disable (calls onReset)
    fireEvent.mouseDown(header, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseUp(header, { button: 0, clientX: 10, clientY: 10 });
    expect(onReset).toHaveBeenCalledTimes(1);

    // Second click: re-enable (should NOT call onReset again)
    fireEvent.mouseDown(header, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseUp(header, { button: 0, clientX: 10, clientY: 10 });
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('slider')).not.toBeDisabled();
  });

  it('a tap (touch, no move) toggles the range the same way a click does', () => {
    const { container } = render(
      <RangeFilter label="Year" min={1990} max={2030} value={2010} onChange={() => {}} />
    );
    const header = container.querySelector('.range-header');

    fireEvent.touchStart(header, { touches: [{ clientX: 10, clientY: 10 }] });
    fireEvent.touchEnd(header, { touches: [{ clientX: 10, clientY: 10 }] });

    expect(screen.getByRole('slider')).toBeDisabled();
  });
});
