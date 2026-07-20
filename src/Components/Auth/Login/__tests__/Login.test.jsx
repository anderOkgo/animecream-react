import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';

vi.mock('../../../../services/auth.service', () => ({
  default: { login: vi.fn() },
}));
import AuthService from '../../../../services/auth.service';

const t = (key) => key;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Login', () => {
  it('renders username/password fields and a submit button', () => {
    render(<Login t={t} init={true} setInit={() => {}} />);
    expect(screen.getByLabelText('username')).toBeInTheDocument();
    expect(screen.getByLabelText('password')).toBeInTheDocument();
  });

  it('alerts and does not call AuthService when offline (init falsy)', () => {
    render(<Login t={t} init={false} setInit={() => {}} />);
    fireEvent.submit(screen.getByRole('button').closest('form'));
    expect(window.alert).toHaveBeenCalledWith('Offline');
    expect(AuthService.login).not.toHaveBeenCalled();
  });

  it('logs in successfully and calls setInit + onLoginSuccess', async () => {
    AuthService.login.mockResolvedValue({ message: 'ok' });
    const setInit = vi.fn();
    const onLoginSuccess = vi.fn();
    render(<Login t={t} init={true} setInit={setInit} onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByLabelText('username'), { target: { value: 'ander' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'secret' } });
    fireEvent.submit(screen.getByRole('button').closest('form'));

    await waitFor(() => expect(AuthService.login).toHaveBeenCalledWith('ander', 'secret'));
    await waitFor(() => expect(setInit).toHaveBeenCalled());
    expect(onLoginSuccess).toHaveBeenCalledTimes(1);
  });

  it('shows a translated alert and does not call onLoginSuccess when login fails', async () => {
    AuthService.login.mockResolvedValue({ err: { message: 'Invalid credentials' } });
    const onLoginSuccess = vi.fn();
    render(<Login t={t} init={true} setInit={() => {}} onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByLabelText('username'), { target: { value: 'ander' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'wrong' } });
    fireEvent.submit(screen.getByRole('button').closest('form'));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it('shows a generic error alert when AuthService.login throws', async () => {
    AuthService.login.mockRejectedValue(new Error('network down'));
    render(<Login t={t} init={true} setInit={() => {}} />);

    fireEvent.change(screen.getByLabelText('username'), { target: { value: 'ander' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'secret' } });
    fireEvent.submit(screen.getByRole('button').closest('form'));

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('errorUnknown'));
  });

  it('ignores a second submit while the first is still in flight', async () => {
    let resolveLogin;
    AuthService.login.mockReturnValue(new Promise((resolve) => (resolveLogin = resolve)));
    render(<Login t={t} init={true} setInit={() => {}} />);

    const form = screen.getByRole('button').closest('form');
    fireEvent.change(screen.getByLabelText('username'), { target: { value: 'ander' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'secret' } });
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(AuthService.login).toHaveBeenCalledTimes(1);
    await waitFor(() => resolveLogin({ message: 'ok' }));
  });
});
