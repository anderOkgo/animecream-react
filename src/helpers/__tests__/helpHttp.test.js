import { vi } from 'vitest';
import helpHttp from '../helpHttp';
import set from '../set.json';

const answer = (body, { ok = true, status = 200, statusText = 'OK' } = {}) =>
  Promise.resolve({ ok, status, statusText, json: () => Promise.resolve(body) });

const setOnline = (value) => Object.defineProperty(navigator, 'onLine', { value, configurable: true });

describe('helpHttp', () => {
  beforeEach(() => {
    setOnline(true);
    globalThis.fetch = vi.fn();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('sends a GET with JSON headers and no body, and returns the JSON', async () => {
    fetch.mockReturnValue(answer({ data: 1 }));
    expect(await helpHttp.get('/x')).toEqual({ data: 1 });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/x');
    expect(options.method).toBe('GET');
    expect(options.headers).toEqual({ Authorization: undefined, 'Content-Type': 'application/json', Accept: 'application/json' });
    expect('body' in options).toBe(false);
  });

  it('sends POST, PUT, DELETE and OPTIONS with a JSON body, the token and extra headers', async () => {
    fetch.mockImplementation(() => answer({}));
    await helpHttp.post('/p', { body: { a: 1 }, token: 'Bearer t', headers: { X: 'y' } });
    await helpHttp.put('/u', { body: { b: 2 } });
    await helpHttp.del('/d', { body: { c: 3 } });
    await helpHttp.opt('/o');
    await helpHttp.get('/g', { method: 'HEAD' });
    expect(fetch.mock.calls.map(([, o]) => o.method)).toEqual(['POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']);
    const first = fetch.mock.calls[0][1];
    expect(first.body).toBe('{"a":1}');
    expect(first.headers).toMatchObject({ Authorization: 'Bearer t', X: 'y' });
  });

  it('uses the default methods when called without options', async () => {
    fetch.mockImplementation(() => answer({}));
    await helpHttp.get('/g');
    await helpHttp.post('/p');
    await helpHttp.put('/u');
    await helpHttp.del('/d');
    expect(fetch.mock.calls.map(([, o]) => o.method)).toEqual(['GET', 'POST', 'PUT', 'DELETE']);
  });

  it('sends FormData as it is, with only the token header (the browser sets the boundary)', async () => {
    fetch.mockReturnValue(answer({ ok: 1 }));
    const form = new FormData();
    form.append('image', 'x');
    await helpHttp.post('/upload', { body: form, token: 'Bearer t' });
    const [, options] = fetch.mock.calls[0];
    expect(options.body).toBe(form);
    expect(options.headers).toEqual({ Authorization: 'Bearer t' });
  });

  it('aborts after the given timeout, or the default one', async () => {
    vi.useFakeTimers();
    fetch.mockImplementation(() => answer({}));
    await helpHttp.get('/slow', { timeout: 50 });
    const signal = fetch.mock.calls[0][1].signal;
    vi.advanceTimersByTime(49);
    expect(signal.aborted).toBe(false);
    vi.advanceTimersByTime(1);
    expect(signal.aborted).toBe(true);

    await helpHttp.get('/default');
    vi.advanceTimersByTime(set.defaul_fetch_request);
    expect(fetch.mock.calls[1][1].signal.aborted).toBe(true);
  });

  it('returns an Offline error without calling fetch when the browser is offline', async () => {
    setOnline(false);
    expect(await helpHttp.get('/x')).toEqual({ err: { status: '00', statusText: 'Offline', message: 'Offline' } });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns a thrown fetch error as err, and an abort as "Request timeout"', async () => {
    const boom = new Error('network');
    fetch.mockRejectedValueOnce(boom);
    expect(await helpHttp.get('/x')).toEqual({ err: boom });

    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    fetch.mockRejectedValueOnce(abort);
    expect((await helpHttp.get('/x')).err).toMatchObject({ message: 'Request timeout' });
  });

  describe('a failed answer', () => {
    const failWith = async (body, init) => {
      fetch.mockReturnValue(answer(body, { ok: false, status: 400, statusText: 'Bad Request', ...init }));
      return (await helpHttp.get('/x')).err;
    };

    it('keeps the status and its text, or defaults for them', async () => {
      expect(await failWith('Nope')).toEqual({ status: 400, statusText: 'Bad Request', message: 'Nope' });
      expect(await failWith('Nope', { status: 0, statusText: '' })).toEqual({
        status: '00',
        statusText: 'An error has occurred',
        message: 'Nope',
      });
    });

    it('reads the message from each body shape', async () => {
      expect((await failWith(null)).message).toBe('Unknown error');
      expect((await failWith(['a', 'b'])).message).toEqual(['a', 'b']);
      expect((await failWith({ message: 'Bad name' })).message).toBe('Bad name');
      expect((await failWith({ error: 'Not allowed' })).message).toBe('Not allowed');
      expect((await failWith({ errors: ['x'] })).message).toEqual(['x']);
      expect((await failWith({ message: { message: 'Nested' } })).message).toBe('Nested');
      expect((await failWith({ name: 'Too short', year: 'Required', count: 3 })).message).toEqual([
        'Too short',
        'Required',
      ]);
      expect((await failWith({ message: null })).message).toBe('Unknown error');
      expect((await failWith({ code: 1 })).message).toBe('Unknown error');
      expect((await failWith(42)).message).toBe('Unknown error');
    });
  });
});
