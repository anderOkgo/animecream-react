/**
 * cyfer, version 2 — the owner's cipher (home: github.com/anderOkgo/cyfer-vanilla, dist/js/cyfer.js;
 * the same file is copied into every project that uses it). Spec: module-docs/apps/bitacora/SPEC.md
 * §2.13 (D40), change 20261120-cyfer-v2.
 *
 * It keeps the steps of the owner's cyfer (latest version 1: finan-react, 2023-11-20; cyfer-vanilla,
 * 2024-12-22): reverse, add the key byte by byte, base64. Version 2 improves it with nothing but what
 * every browser and Node already have (TextEncoder, btoa/atob, crypto.getRandomValues, and
 * CompressionStream for the async pair):
 *
 *   B  = UTF-8 of the text                     (no accent or emoji is lost, unlike version 1)
 *   K  = the first 4 bytes of SHA-256(B)       (a wrong key or a changed byte never opens)
 *   P  = 0x00 ‖ K ‖ B, or 0x01 ‖ K ‖ deflate-raw(B) when shorter (cyAsync only)
 *   C  = reverse(P), each byte + one byte of the key stream, mod 256
 *   key stream = SHA-256(UTF-8 key ‖ nonce ‖ block, 4 bytes big-endian), block after block
 *   out = base64 without "=" of (nonce, 3 random bytes ‖ C)
 *
 * cy / dcy are synchronous and never compress (small data: sessions, settings). cyAsync / dcyAsync
 * compress long texts; dcyAsync opens both, dcy only the uncompressed ones. Version 1 texts do not
 * open: the format changed on purpose. A text that does not open gives null.
 */

// ── SHA-256 (FIPS 180-4), written out so cy and dcy stay synchronous everywhere ─────────────────
const PRIMES = [];
for (let n = 2; PRIMES.length < 64; n++) if (PRIMES.every((p) => n % p)) PRIMES.push(n);
const fraction = (x) => ((x - Math.floor(x)) * 0x100000000) >>> 0;
const H0 = Uint32Array.from(PRIMES.slice(0, 8), (p) => fraction(Math.sqrt(p)));
const K = Uint32Array.from(PRIMES, (p) => fraction(Math.cbrt(p)));
const rotr = (x, n) => (x >>> n) | (x << (32 - n));

export function sha256(data) {
  const padded = new Uint8Array(Math.ceil((data.length + 9) / 64) * 64);
  padded.set(data);
  padded[data.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(data.length / 0x20000000));
  view.setUint32(padded.length - 4, (data.length * 8) >>> 0);
  const h = H0.slice();
  const w = new Uint32Array(64);
  for (let at = 0; at < padded.length; at += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(at + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    [a, b, c, d, e, f, g, hh].forEach((v, i) => (h[i] = (h[i] + v) >>> 0));
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  h.forEach((v, i) => outView.setUint32(i * 4, v));
  return out;
}

// ── cyfer version 2 ──────────────────────────────────────────────────────────────────────────
const NONCE_BYTES = 3;
const CHECK_BYTES = 4;
const encoder = new TextEncoder();

const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
};

const checkOf = (bytes) => sha256(bytes).subarray(0, CHECK_BYTES);

function keyStream(key, nonce, length) {
  const keyBytes = encoder.encode(key);
  const out = new Uint8Array(length);
  for (let block = 0; block * 32 < length; block++) {
    const counter = new Uint8Array(4);
    new DataView(counter.buffer).setUint32(0, block);
    out.set(sha256(concat(keyBytes, nonce, counter)).subarray(0, Math.min(32, length - block * 32)), block * 32);
  }
  return out;
}

const toBase64 = (bytes) => {
  let text = '';
  for (const b of bytes) text += String.fromCharCode(b);
  return btoa(text).replace(/=+$/, '');
};

const fromBase64 = (text) => Uint8Array.from(atob(text + '='.repeat((4 - (text.length % 4)) % 4)), (c) => c.charCodeAt(0));

const newNonce = () => crypto.getRandomValues(new Uint8Array(NONCE_BYTES));

/** The cyfer step on a plain body P: reverse, add the key stream, prefix the nonce, base64. */
function seal(body, key, nonce) {
  const reversed = body.slice().reverse();
  const stream = keyStream(key, nonce, reversed.length);
  return toBase64(concat(nonce, reversed.map((b, i) => (b + stream[i]) & 255)));
}

/** The plain body P of a cyfer text, or null when it is not base64 or too short. */
function unseal(text, key) {
  try {
    const bytes = fromBase64(text);
    if (bytes.length < NONCE_BYTES + 1 + CHECK_BYTES) return null;
    const nonce = bytes.subarray(0, NONCE_BYTES);
    const cipher = bytes.subarray(NONCE_BYTES);
    const stream = keyStream(key, nonce, cipher.length);
    return cipher.map((b, i) => (b - stream[i]) & 255).reverse();
  } catch {
    return null;
  }
}

/** The text of B when its check matches, else null. */
function finish(raw, check) {
  if (!checkOf(raw).every((b, i) => b === check[i])) return null;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(raw);
  } catch {
    return null;
  }
}

/** Ciphers `text` with `key` (never compressed). `nonce` is for tests only. */
export function cy(text, key, nonce = newNonce()) {
  const raw = encoder.encode(text);
  return seal(concat(Uint8Array.of(0), checkOf(raw), raw), key, nonce);
}

/** The text of an uncompressed cyfer text, or null (wrong key, changed, compressed or not cyfer). */
export function dcy(text, key) {
  const body = unseal(text, key);
  if (body === null || body[0] !== 0) return null;
  return finish(body.subarray(1 + CHECK_BYTES), body.subarray(1, 1 + CHECK_BYTES));
}

async function pipe(bytes, stream) {
  return new Uint8Array(await new Response(new Response(bytes).body.pipeThrough(stream)).arrayBuffer());
}

/** Ciphers `text`, compressed with deflate-raw when that is shorter and the platform has it. */
export async function cyAsync(text, key, nonce = newNonce()) {
  const raw = encoder.encode(text);
  if (typeof CompressionStream === 'function') {
    const packed = await pipe(raw, new CompressionStream('deflate-raw'));
    if (packed.length < raw.length) return seal(concat(Uint8Array.of(1), checkOf(raw), packed), key, nonce);
  }
  return cy(text, key, nonce);
}

/** The text of any cyfer version-2 text, compressed or not, or null. */
export async function dcyAsync(text, key) {
  const body = unseal(text, key);
  if (body === null || body[0] > 1) return null;
  if (body[0] === 0) return dcy(text, key);
  try {
    const raw = await pipe(body.subarray(1 + CHECK_BYTES), new DecompressionStream('deflate-raw'));
    return finish(raw, body.subarray(1, 1 + CHECK_BYTES));
  } catch {
    return null;
  }
}

/** `cyfer().cy(...)` as in Finanz and Animecream, and `cyfer.cy(...)` as in cyfer-vanilla. */
const cyfer = () => ({ cy, dcy, cyAsync, dcyAsync });
Object.assign(cyfer, { cy, dcy, cyAsync, dcyAsync });

export default cyfer;
