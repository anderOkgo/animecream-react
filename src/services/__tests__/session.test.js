import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuthService from '../auth.service';
import helpHttp from '../../helpers/helpHttp';

vi.mock('../../helpers/helpHttp', () => ({ default: { post: vi.fn(), get: vi.fn() } }));

describe('session across days (Auth spec v0.3)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 5, 22, 0));
    helpHttp.post.mockResolvedValue({ token: 'a.b.c', message: 'ok' });
  });
  afterEach(() => vi.useRealTimers());

  it('stays logged in the next day, and a month later', async () => {
    await AuthService.login('sample', 'sample');
    expect(AuthService.getCurrentUser().token).toBe('a.b.c');

    vi.setSystemTime(new Date(2026, 10, 6, 8, 0));
    expect(AuthService.getCurrentUser()?.token).toBe('a.b.c');

    vi.setSystemTime(new Date(2026, 11, 4, 8, 0));
    expect(AuthService.getCurrentUser()?.token).toBe('a.b.c');
  });

  it('logging out ends it', async () => {
    await AuthService.login('sample', 'sample');
    AuthService.logout();
    expect(AuthService.getCurrentUser()).toBeNull();
  });
});
