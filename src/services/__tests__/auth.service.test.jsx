import { vi } from 'vitest';

vi.mock('../../helpers/helpHttp', () => ({
  default: { post: vi.fn() },
}));
import helpHttp from '../../helpers/helpHttp';
import AuthService from '../auth.service';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('AuthService.login / getCurrentUser round-trip', () => {
  it('stores the encrypted session on a successful login, decryptable via getCurrentUser', async () => {
    helpHttp.post.mockResolvedValue({ token: 'jwt-token', message: 'Login successful', role: 'admin' });

    const result = await AuthService.login('alice', 'secret');

    expect(result).toEqual({ message: 'Login successful' });
    const user = AuthService.getCurrentUser();
    expect(user).toMatchObject({ token: 'jwt-token', message: 'Login successful', role: 'admin' });
  });

  it('returns an err payload and stores nothing when the response has no token', async () => {
    helpHttp.post.mockResolvedValue({ err: { message: 'Invalid credentials' } });

    const result = await AuthService.login('alice', 'wrong');

    expect(result).toEqual({ err: { message: 'Invalid credentials' } });
    expect(AuthService.getCurrentUser()).toBeNull();
  });

  it('falls back to a generic message when the failed response has no err.message', async () => {
    helpHttp.post.mockResolvedValue({});

    const result = await AuthService.login('alice', 'wrong');

    expect(result).toEqual({ err: { message: 'Login failed' } });
  });
});

describe('AuthService.getCurrentUser', () => {
  it('returns null when no session is stored', () => {
    expect(AuthService.getCurrentUser()).toBeNull();
  });

  it('returns null instead of throwing when the stored session is corrupted', async () => {
    helpHttp.post.mockResolvedValue({ token: 'jwt-token', message: 'ok' });
    await AuthService.login('alice', 'secret');

    // Corrupt every stored value in place -- whichever key the encrypted
    // session landed under, decryption should now fail gracefully.
    Object.keys(localStorage).forEach((key) => {
      localStorage.setItem(key, 'not-valid-cyfer-output');
    });

    expect(AuthService.getCurrentUser()).toBeNull();
  });
});

describe('AuthService.register', () => {
  it('logs in automatically after a successful registration', async () => {
    helpHttp.post
      .mockResolvedValueOnce({ message: 'User created successfully' })
      .mockResolvedValueOnce({ token: 'jwt-token', message: 'Login successful' });

    const message = await AuthService.register('alice', 'a@x.com', 'secret', '123456');

    expect(message).toBe('User created successfully');
    expect(helpHttp.post).toHaveBeenCalledTimes(2);
    expect(AuthService.getCurrentUser()).toMatchObject({ token: 'jwt-token' });
  });

  it('does not attempt a login when registration itself fails', async () => {
    helpHttp.post.mockResolvedValueOnce({ message: 'Username already taken' });

    const message = await AuthService.register('alice', 'a@x.com', 'secret', '123456');

    expect(message).toBe('Username already taken');
    expect(helpHttp.post).toHaveBeenCalledTimes(1);
  });
});

describe('AuthService.logout', () => {
  it('clears the session but preserves non-auth data (storage, lang, lists)', async () => {
    helpHttp.post.mockResolvedValue({ token: 'jwt-token', message: 'ok' });
    await AuthService.login('alice', 'secret');

    localStorage.setItem('storage', '{"cached":true}');
    localStorage.setItem('storage_initial', '{"cached":true}');
    localStorage.setItem('lang', 'es');
    localStorage.setItem('selectedListId', 'list_1');
    localStorage.setItem('list_1', '{"name":"Favorites","items":[]}');

    AuthService.logout();

    expect(AuthService.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('storage')).toBe('{"cached":true}');
    expect(localStorage.getItem('storage_initial')).toBe('{"cached":true}');
    expect(localStorage.getItem('lang')).toBe('es');
    expect(localStorage.getItem('selectedListId')).toBe('list_1');
    expect(localStorage.getItem('list_1')).toBe('{"name":"Favorites","items":[]}');
  });
});

describe('AuthService.getUserName', () => {
  const makeJwt = (payload) => {
    const base64Payload = btoa(JSON.stringify(payload));
    return `header.${base64Payload}.signature`;
  };

  it('decodes role and username from a valid JWT payload', () => {
    const token = makeJwt({ role: 'admin', username: 'alice' });
    expect(AuthService.getUserName(token)).toEqual({ role: 'admin', username: 'alice' });
  });

  it('returns null for a malformed token', () => {
    expect(AuthService.getUserName('not-a-jwt')).toBeNull();
  });

  it('returns null when no token is given', () => {
    expect(AuthService.getUserName(null)).toBeNull();
    expect(AuthService.getUserName(undefined)).toBeNull();
  });
});
