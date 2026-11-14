import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InstallPrompt from '../InstallPrompt';

const t = (key) => key;

describe('InstallPrompt', () => {
  it('offers to install on browsers with a native prompt, the default', () => {
    const onInstall = vi.fn();
    const onDismiss = vi.fn();
    render(<InstallPrompt t={t} onInstall={onInstall} onDismiss={onDismiss} />);
    expect(screen.getByRole('dialog', { name: 'installApp' })).toBeInTheDocument();
    expect(screen.getByText('installAppDescription')).toBeInTheDocument();
    fireEvent.click(screen.getByText('install'));
    fireEvent.click(screen.getByText('notNow'));
    expect(onInstall).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('explains the Share step on iOS, with no install button', () => {
    render(<InstallPrompt t={t} variant="ios" onDismiss={vi.fn()} />);
    expect(screen.getByText('installAppIosDescription')).toBeInTheDocument();
    expect(screen.queryByText('install')).not.toBeInTheDocument();
    expect(screen.getByText('⬆️')).toBeInTheDocument();
  });
});
