import { vi } from 'vitest';
import { OPTIONS_TTL_MS, loadOptions, readOptions, writeOptions } from '../optionsCache';

vi.mock('../helpHttp', () => ({ default: { get: vi.fn() } }));
import helpHttp from '../helpHttp';

const LIST = [{ id: 1, name: 'Drama' }];

describe('optionsCache (SPEC v0.8, G6)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('keeps lists 24 hours', () => {
    expect(OPTIONS_TTL_MS).toBe(24 * 60 * 60 * 1000);
  });

  it('reads a list only while fresh, unless asked for any age', () => {
    writeOptions('genres', LIST, 1000);
    expect(localStorage.getItem('options_genres_ts')).toBe('1000');
    expect(readOptions('genres', { now: 1000 + OPTIONS_TTL_MS - 1 })).toEqual(LIST);
    expect(readOptions('genres', { now: 1000 + OPTIONS_TTL_MS })).toBeNull();
    expect(readOptions('genres', { fresh: false, now: 1000 + OPTIONS_TTL_MS })).toEqual(LIST);
  });

  it('treats a list with no date as old, and a missing, broken or empty one as none', () => {
    localStorage.setItem('options_genres', JSON.stringify(LIST));
    expect(readOptions('genres')).toBeNull();
    expect(readOptions('genres', { fresh: false })).toEqual(LIST);
    localStorage.setItem('options_genres', '{bad');
    expect(readOptions('genres', { fresh: false })).toBeNull();
    localStorage.setItem('options_genres', '[]');
    expect(readOptions('genres', { fresh: false })).toBeNull();
    expect(readOptions('demographics', { fresh: false })).toBeNull();
  });

  it('answers a fresh list from the cache, with no request', async () => {
    writeOptions('demographics', LIST);
    expect(await loadOptions('demographics')).toEqual(LIST);
    expect(helpHttp.get).not.toHaveBeenCalled();
  });

  it('fetches and caches a list named after its kind or as data, with or without a token', async () => {
    helpHttp.get.mockResolvedValueOnce({ genres: LIST });
    expect(await loadOptions('genres')).toEqual(LIST);
    expect(helpHttp.get).toHaveBeenLastCalledWith(expect.stringMatching(/api\/series\/genres$/));
    expect(readOptions('genres')).toEqual(LIST);

    helpHttp.get.mockResolvedValueOnce({ data: LIST });
    expect(await loadOptions('demographics', { token: 'Bearer t' })).toEqual(LIST);
    expect(helpHttp.get).toHaveBeenLastCalledWith(expect.stringMatching(/demographics$/), { token: 'Bearer t' });
  });

  it('falls back to the old list, or [], when the API fails or brings nothing', async () => {
    writeOptions('genres', LIST, Date.now() - OPTIONS_TTL_MS);
    helpHttp.get.mockResolvedValueOnce({ err: { message: 'down' } });
    expect(await loadOptions('genres')).toEqual(LIST);

    localStorage.clear();
    helpHttp.get.mockResolvedValueOnce({ genres: [] });
    expect(await loadOptions('genres')).toEqual([]);
    helpHttp.get.mockResolvedValueOnce(null);
    expect(await loadOptions('genres')).toEqual([]);
    helpHttp.get.mockResolvedValueOnce({});
    expect(await loadOptions('genres')).toEqual([]);
    expect(localStorage.getItem('options_genres')).toBeNull();
  });
});
