import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Menu from '../Menu';

vi.mock('../../../services/auth.service', () => ({
  default: { getCurrentUser: vi.fn(), logout: vi.fn() },
}));
import AuthService from '../../../services/auth.service';

const baseProps = {
  init: 1,
  proc: false,
  boot: vi.fn(),
  toggleDarkMode: vi.fn(),
  saveThemeAsDefault: vi.fn(),
  restoreThemeDefault: vi.fn(),
  setInit: vi.fn(),
  onLoginClick: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('Menu -- logged out', () => {
  beforeEach(() => {
    AuthService.getCurrentUser.mockReturnValue(null);
  });

  it('shows Login but not Finanz/Cyfer/Logout', () => {
    render(<Menu {...baseProps} />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Finanz')).not.toBeInTheDocument();
    expect(screen.queryByText('Cyfer')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('clicking Login calls onLoginClick', () => {
    render(<Menu {...baseProps} />);
    fireEvent.click(screen.getByText('Login'));
    expect(baseProps.onLoginClick).toHaveBeenCalledTimes(1);
  });
});

describe('Menu -- logged in', () => {
  beforeEach(() => {
    AuthService.getCurrentUser.mockReturnValue({ token: 'abc' });
  });

  it('shows Finanz/Cyfer/Logout but not Login', () => {
    render(<Menu {...baseProps} />);
    expect(screen.getByText('Finanz')).toBeInTheDocument();
    expect(screen.getByText('Cyfer')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('clicking Logout calls AuthService.logout and setInit, then reveals Login again', () => {
    render(<Menu {...baseProps} />);
    fireEvent.click(screen.getByText('Logout'));

    expect(AuthService.logout).toHaveBeenCalledTimes(1);
    expect(baseProps.setInit).toHaveBeenCalled();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});

describe('Menu -- status icon and theme toggle', () => {
  beforeEach(() => {
    AuthService.getCurrentUser.mockReturnValue(null);
  });

  it('clicking the status icon calls boot() and toggleDarkMode()', () => {
    const { container } = render(<Menu {...baseProps} />);
    fireEvent.click(container.querySelector('.icon-activity'));
    expect(baseProps.boot).toHaveBeenCalledTimes(1);
    expect(baseProps.toggleDarkMode).toHaveBeenCalledTimes(1);
  });

  it('double-clicking with no stored theme preference saves it as default', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = render(<Menu {...baseProps} />);
    fireEvent.doubleClick(container.querySelector('.icon-activity'));
    expect(baseProps.saveThemeAsDefault).toHaveBeenCalledTimes(1);
    expect(baseProps.restoreThemeDefault).not.toHaveBeenCalled();
    window.alert.mockRestore();
  });

  it('double-clicking with a stored theme preference restores the system default', () => {
    localStorage.setItem('themePreference', 'dark');
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = render(<Menu {...baseProps} />);
    fireEvent.doubleClick(container.querySelector('.icon-activity'));
    expect(baseProps.restoreThemeDefault).toHaveBeenCalledTimes(1);
    expect(baseProps.saveThemeAsDefault).not.toHaveBeenCalled();
    window.alert.mockRestore();
  });
});

describe('Menu -- hamburger checkbox / outside click', () => {
  beforeEach(() => {
    AuthService.getCurrentUser.mockReturnValue(null);
  });

  it('unchecks the hamburger checkbox on a click outside the navbar', () => {
    const { container } = render(<Menu {...baseProps} />);
    const checkbox = container.querySelector('#checkbox_toggle');
    checkbox.checked = true;

    fireEvent.click(document.body);
    expect(checkbox.checked).toBe(false);
  });

  it('does not uncheck the checkbox when the click is inside the navbar', () => {
    const { container } = render(<Menu {...baseProps} />);
    const checkbox = container.querySelector('#checkbox_toggle');
    checkbox.checked = true;

    fireEvent.click(container.querySelector('.logo'));
    expect(checkbox.checked).toBe(true);
  });
});
