// cyfer version 2 — the library's own tests, copied with the library into every project that uses
// it (home: github.com/anderOkgo/cyfer-vanilla). Only the import path changes from one to another.
// Spec: module-docs/apps/bitacora/SPEC.md §2.13 (D40), change 20261120-cyfer-v2. Invented texts and keys.
import { createHash, randomBytes } from 'node:crypto';
import { vi } from 'vitest';
import cyfer, { cy, cyAsync, dcy, dcyAsync, sha256 } from '../cyfer';

const KEY = 'an invented key';
// Made with the browser's own SHA-256 (crypto.subtle); module-docs' recover.py checks the same ones.
const VECTOR_SHORT = 'AQIDR8ub/+vi4uzfQIVT7dNu4M5+IG8P+kSP';
const VECTOR_LONG =
  'AQID5mYifltL8T3fltx1oFn+M9VpnZkGvF3jlN7yfyqULLiuDSthy7GSCz435t+zHmjJr7MeyTlw1I1yjiv+W2H/NFDfQg';

/** A version-2 text made by hand from the plain body P (before it is reversed), for odd cases. */
function forge(plain, key = KEY) {
  const nonce = Uint8Array.of(9, 9, 9);
  const keyBytes = new TextEncoder().encode(key);
  const stream = sha256(Uint8Array.of(...keyBytes, ...nonce, 0, 0, 0, 0));
  const body = Uint8Array.from(plain).reverse();
  let s = '';
  for (const b of [...nonce, ...body.map((b, i) => (b + stream[i]) & 255)]) s += String.fromCharCode(b);
  return btoa(s).replace(/=+$/, '');
}
const check = (bytes) => [...sha256(Uint8Array.from(bytes)).subarray(0, 4)];
const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

describe('SHA-256 (written out)', () => {
  it('matches Node for every padding edge and long inputs', () => {
    for (const n of [0, 1, 55, 56, 63, 64, 65, 119, 120, 1000, 100000]) {
      const data = randomBytes(n);
      expect(hex(sha256(data))).toBe(createHash('sha256').update(data).digest('hex'));
    }
    expect(hex(sha256(new TextEncoder().encode('abc')))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });
});

describe('cyfer version 2', () => {
  it('opens the shared vectors, and writes them again with the same nonce', async () => {
    expect(dcy(VECTOR_SHORT, 'clave-ñ')).toBe('Mañana 🌙\nlínea');
    expect(cy('Mañana 🌙\nlínea', 'clave-ñ', Uint8Array.of(1, 2, 3))).toBe(VECTOR_SHORT);
    const long = 'Una noche tranquila en casa, leyendo y escribiendo. '.repeat(20);
    expect(await dcyAsync(VECTOR_LONG, 'clave-ñ')).toBe(long);
    expect(await cyAsync(long, 'clave-ñ', Uint8Array.of(1, 2, 3))).toBe(VECTOR_LONG);
    expect(dcy(VECTOR_LONG, 'clave-ñ')).toBeNull(); // compressed: only dcyAsync opens it
    expect(await dcyAsync(VECTOR_SHORT, 'clave-ñ')).toBe('Mañana 🌙\nlínea');
  });

  it('round-trips, gives a new text each time, and keeps short things short', async () => {
    const text = 'señor 👨‍👩‍👧 "x"\n';
    const a = cy(text, KEY);
    expect(a).not.toBe(cy(text, KEY));
    expect(dcy(a, KEY)).toBe(text);
    expect(await dcyAsync(await cyAsync(text, KEY), KEY)).toBe(text);
    expect(cy('hola', KEY).length).toBe(16);
    expect(dcy(cy('', ''), '')).toBe('');
  });

  it('a wrong key, a changed character or a text that is not cyfer gives null', async () => {
    const a = cy('the secret', KEY);
    expect(dcy(a, 'another key')).toBeNull();
    expect(dcy(a.slice(0, 8) + (a[8] === 'A' ? 'B' : 'A') + a.slice(9), KEY)).toBeNull();
    expect(dcy('not base64!', KEY)).toBeNull();
    expect(dcy('AAAA', KEY)).toBeNull(); // too short
    expect(await dcyAsync('not base64!', KEY)).toBeNull();
  });

  it('odd bodies never open: a flag above 1, bad UTF-8, a broken deflate', async () => {
    const x = [...new TextEncoder().encode('x')];
    expect(dcy(forge([0, ...check(x), ...x]), KEY)).toBe('x');
    expect(await dcyAsync(forge([2, ...check(x), ...x]), KEY)).toBeNull();
    expect(dcy(forge([1, ...check(x), ...x]), KEY)).toBeNull();
    const bad = [0xff, 0xfe];
    expect(dcy(forge([0, ...check(bad), ...bad]), KEY)).toBeNull();
    expect(await dcyAsync(forge([1, ...check(x), 0xff, 0xff, 0xff]), KEY)).toBeNull();
    expect(await dcyAsync(forge([1, 0, 0, 0, 0, 0x03, 0x00]), KEY)).toBeNull(); // deflate of "", wrong check
  });

  it('cyAsync does not compress what would not shrink, nor without CompressionStream', async () => {
    expect(dcy(await cyAsync('hola', KEY), KEY)).toBe('hola'); // flag 0: dcy opens it
    vi.stubGlobal('CompressionStream', undefined);
    try {
      const long = 'abc '.repeat(200);
      expect(dcy(await cyAsync(long, KEY), KEY)).toBe(long);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('works as cyfer().cy (Finanz, Animecream) and cyfer.cy (cyfer-vanilla)', async () => {
    expect(cyfer().dcy(cyfer.cy('x', KEY), KEY)).toBe('x');
    expect(await cyfer.dcyAsync(await cyfer().cyAsync('x', KEY), KEY)).toBe('x');
  });
});
