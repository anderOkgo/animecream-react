import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppCrashFallback from '../AppCrashFallback';

describe('AppCrashFallback', () => {
  it('renders the fallback message and a Reload button', () => {
    render(<AppCrashFallback />);
    expect(screen.getByText(/couldn't load/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });

  it('reloads the page when the button is clicked', () => {
    const reloadSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', { value: { ...originalLocation, reload: reloadSpy }, writable: true });

    render(<AppCrashFallback />);
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(reloadSpy).toHaveBeenCalledTimes(1);

    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
  });
});
