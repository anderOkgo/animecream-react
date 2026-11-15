import { vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

// App wires hooks and children together. Every child and hook has its own suite, so here they are
// thin stand-ins: the test checks what App passes down, its global message, the login overlay, the
// user's role and the emergency repair.
const state = vi.hoisted(() => ({ alive: {}, install: {}, tabProps: null }));

vi.mock('../hooks/useAlive', () => ({ useAlive: () => state.alive }));
vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ toggleDarkMode: vi.fn(), saveThemeAsDefault: vi.fn(), restoreSystemDefault: vi.fn() }),
}));
vi.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
    toggleLanguage: vi.fn(),
    saveLanguageAsDefault: vi.fn(),
    restoreSystemDefault: vi.fn(),
    t: (k) => `<${k}>`,
  }),
  translateApiMessage: (t, m) => `api(${m})`,
}));
vi.mock('../hooks/useNavigationHistory', () => ({ useNavigationHistory: () => ({ currentState: null }) }));
vi.mock('../hooks/useInstallPrompt', () => ({ useInstallPrompt: () => state.install }));
vi.mock('../services/auth.service', () => ({ default: { getCurrentUser: vi.fn(), getUserName: vi.fn() } }));
vi.mock('../Components/Menu/Menu', () => ({
  default: ({ onLoginClick }) => <button onClick={onLoginClick}>open-login</button>,
}));
vi.mock('../Components/Tab/Tab', () => ({
  default: (props) => {
    state.tabProps = props;
    return <div data-testid="tab" data-role={String(props.role)} />;
  },
}));
vi.mock('../Components/Auth/Login/Login', () => ({
  default: ({ onLoginSuccess }) => <button onClick={onLoginSuccess}>login-ok</button>,
}));
vi.mock('../Components/Loader/Loader', () => ({ default: () => <div data-testid="loader" /> }));
vi.mock('../Components/InstallPrompt/InstallPrompt', () => ({
  default: ({ variant }) => <div data-testid={`install-${variant}`} />,
}));
vi.mock('../Components/Message/Message', () => ({
  default: ({ msg, bgColor, textColor, onDoubleClick }) => (
    <div data-testid="message" data-bg={bgColor} data-color={String(textColor)} onDoubleClick={onDoubleClick}>
      {msg}
    </div>
  ),
}));
import AuthService from '../services/auth.service';
import App from '../App';

const message = () => screen.queryByTestId('message');
const say = (m) => act(() => state.tabProps.setGlobalMessage(m));

beforeEach(() => {
  vi.clearAllMocks();
  state.alive = { init: 1, setInit: vi.fn(), proc: false, setProc: vi.fn(), boot: vi.fn() };
  state.install = { canInstall: false, showIosInstructions: false, promptInstall: vi.fn(), dismissPrompt: vi.fn() };
  AuthService.getCurrentUser.mockReturnValue(null);
});

describe('App, user and login', () => {
  it('reads the role of the logged-in user, or none', () => {
    AuthService.getCurrentUser.mockReturnValue({ token: 'tok' });
    AuthService.getUserName.mockReturnValueOnce({ role: 'admin' }).mockReturnValue(null);
    render(<App />);
    expect(screen.getByTestId('tab').dataset.role).toBe('admin');
    // Another tab logs in or out: only the session key matters
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'user-in' })));
    expect(screen.getByTestId('tab').dataset.role).toBe('null');
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'theme' })));
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: null })));
    expect(AuthService.getUserName).toHaveBeenCalledTimes(2);
  });

  it('opens the login overlay, closes it on the backdrop or ×, not inside, and after a login', () => {
    render(<App />);
    fireEvent.click(screen.getByText('open-login'));
    fireEvent.click(document.querySelector('.login-container'));
    expect(document.querySelector('.login-overlay')).not.toBeNull();
    fireEvent.click(document.querySelector('.login-overlay'));
    expect(document.querySelector('.login-overlay')).toBeNull();
    fireEvent.click(screen.getByText('open-login'));
    fireEvent.click(screen.getByTitle('<close>'));
    expect(document.querySelector('.login-overlay')).toBeNull();
    fireEvent.click(screen.getByText('open-login'));
    fireEvent.click(screen.getByText('login-ok'));
    expect(document.querySelector('.login-overlay')).toBeNull();
  });

  it('shows the loader while busy, and the install prompt that applies', () => {
    state.alive.proc = true;
    state.install.canInstall = true;
    const { rerender } = render(<App />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByTestId('install-native')).toBeInTheDocument();
    state.install = { ...state.install, canInstall: false, showIosInstructions: true };
    rerender(<App />);
    expect(screen.getByTestId('install-ios')).toBeInTheDocument();
  });
});

describe('App, global message', () => {
  it('builds the text from a key, an API error with prefix, id and suffix, a fallback, or plain text', () => {
    render(<App />);
    say({ type: 'success', key: 'saved' });
    expect(message()).toHaveTextContent('<saved>');
    say({ type: 'error', error: 'Bad', prefixKey: 'p', prefixParams: { id: 7, useParentheses: true }, suffixKey: 's' });
    expect(message()).toHaveTextContent('<p> (ID: 7) <s>: api(Bad)');
    say({ type: 'warning', error: 'Bad', prefixKey: 'p', prefixParams: { id: 7 } });
    expect(message()).toHaveTextContent('<p> ID: 7 api(Bad)');
    say({ type: 'info', error: '', prefixKey: 'p', fallbackKey: 'fb' });
    expect(message()).toHaveTextContent('<p> <fb>');
    say({ error: null, fallbackKey: 'fb' });
    expect(message()).toHaveTextContent('<fb>');
    say({ error: undefined, text: 'Plain' });
    expect(message()).toHaveTextContent('Plain');
  });

  it('colors the message by type, with dark text on a warning', () => {
    render(<App />);
    const colors = { success: 'var(--color-success)', error: 'var(--color-danger)', warning: 'var(--color-warning)', other: 'var(--brand-primary)' };
    Object.entries(colors).forEach(([type, bg]) => {
      say({ type, text: type });
      expect(message().dataset.bg).toBe(bg);
      expect(message().dataset.color).toBe(type === 'warning' ? '#1a1a1a' : 'undefined');
    });
  });

  it('hides an ordinary message after 5 seconds or on a double click', () => {
    vi.useFakeTimers();
    render(<App />);
    say({ type: 'success', text: 'Done' });
    act(() => vi.advanceTimersByTime(5000));
    expect(message()).toBeNull();
    say({ type: 'success', text: 'Again' });
    fireEvent.doubleClick(message());
    expect(message()).toBeNull();
    vi.useRealTimers();
  });
});

describe('App, emergency repair', () => {
  const reload = vi.fn();
  beforeEach(() => {
    Object.defineProperty(window, 'location', { value: { ...window.location, reload }, configurable: true });
  });
  afterEach(() => {
    delete window.caches;
    delete navigator.serviceWorker;
  });

  it('turns a load failure into a lasting message, and only those failures', () => {
    vi.useFakeTimers();
    render(<App />);
    act(() => window.dispatchEvent(new ErrorEvent('error', { message: 'Something else' })));
    expect(message()).toBeNull();
    act(() => window.dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason: { message: 'Failed to fetch' } })));
    expect(message()).toHaveTextContent('<loadingErrorRepair>');
    act(() => vi.advanceTimersByTime(10000));
    expect(message()).not.toBeNull();
    act(() => window.dispatchEvent(new ErrorEvent('error', { message: 'Loading chunk 3 failed' })));
    act(() => window.dispatchEvent(new ErrorEvent('error', { message: 'Response is not ok' })));
    act(() => window.dispatchEvent(new Event('error')));
    vi.useRealTimers();
  });

  it('clears the caches and the service workers, then reloads', async () => {
    const unregister = vi.fn();
    window.caches = { keys: vi.fn().mockResolvedValue(['a', 'b']), delete: vi.fn().mockResolvedValue(true) };
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { getRegistrations: vi.fn().mockResolvedValue([{ unregister }]) },
      configurable: true,
    });
    render(<App />);
    act(() => window.dispatchEvent(new ErrorEvent('error', { message: 'Failed to fetch' })));
    fireEvent.doubleClick(message());
    await waitFor(() => expect(reload).toHaveBeenCalled());
    expect(window.caches.delete).toHaveBeenCalledTimes(2);
    expect(unregister).toHaveBeenCalled();
    expect(state.alive.setProc).toHaveBeenCalledWith(true);
  });

  it('reloads even where the browser has neither caches nor service workers', async () => {
    render(<App />);
    act(() => window.dispatchEvent(new ErrorEvent('error', { message: 'Failed to fetch' })));
    fireEvent.doubleClick(message());
    await waitFor(() => expect(reload).toHaveBeenCalled());
  });

  it('says the repair failed when clearing fails', async () => {
    window.caches = { keys: vi.fn().mockRejectedValue(new Error('no')), delete: vi.fn() };
    render(<App />);
    act(() => window.dispatchEvent(new ErrorEvent('error', { message: 'Failed to fetch' })));
    fireEvent.doubleClick(message());
    await waitFor(() => expect(message()).toHaveTextContent('<repairError>'));
    expect(state.alive.setProc).toHaveBeenLastCalledWith(false);
  });
});
