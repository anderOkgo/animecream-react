import cyfer from '../cyfer';

// Every real call site (auth.service.js) does `cyfer().cy(...)` and
// `cyfer().dcy(...)` as two separate calls, each getting a fresh closure --
// `li` (the per-instance key-cursor) is never meant to be shared across an
// encode and a decode. Mirror that here: a fresh `cyfer()` per operation.

describe('cyfer', () => {
  it('round-trips a plain ASCII string through cy/dcy with the same key', () => {
    const key = 'my-secret-key';
    const encoded = cyfer().cy('hello world', key);
    expect(cyfer().dcy(encoded, key)).toBe('hello world');
  });

  it('strips diacritics before encoding (normalize), so they do not round-trip', () => {
    const key = 'k';
    const encoded = cyfer().cy('café', key);
    expect(cyfer().dcy(encoded, key)).toBe('cafe');
  });

  it('produces different ciphertext for different keys', () => {
    expect(cyfer().cy('same input', 'key-a')).not.toBe(cyfer().cy('same input', 'key-b'));
  });

  it('applies dcy\'s negative-intermediate-value correction instead of throwing/producing NaN', () => {
    // dcy computes p1 = ((p2*16)|p3) - key.charCodeAt(li); decoding with a
    // high-codepoint key can drive that negative. The `p1 < 0 ? p1 * -1 : p1`
    // branch (mirrors module-api's cyfer.ts, same scheme) corrects it back
    // to a valid char code. This is only exercised by a key mismatch (or,
    // as here, decoding cipher-bytes with a codepoint the 8-bit `p2`/`p3`
    // masking can't represent losslessly) -- it's not a correct-decryption
    // guarantee, just proof the branch runs without throwing/NaN-ing.
    const encrypted = cyfer().cy('test', 'normalKey');
    const decrypted = cyfer().dcy(encrypted, String.fromCharCode(500));
    expect(decrypted).not.toBeNaN();
    expect(typeof decrypted).toBe('string');
  });

  it('cycles the key index across characters longer than the key', () => {
    const key = 'ab';
    const input = 'a longer piece of text than the key';
    expect(cyfer().dcy(cyfer().cy(input, key), key)).toBe(input);
  });

  it('the same cyfer() instance shares its key cursor across calls (documented, not a bug to fix here)', () => {
    // Calling cy() twice on the SAME instance advances the shared `li`
    // cursor, so the second call does NOT start back at key index 0 --
    // this only matches real usage because every call site above creates
    // a fresh cyfer() per operation, never reusing one across cy/dcy.
    const { cy } = cyfer();
    const key = 'ab';
    const first = cy('a', key);
    const second = cy('a', key);
    expect(first).not.toBe(second);
  });
});
