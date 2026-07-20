import { vi } from 'vitest';
import { formattedDate, generateUniqueId } from '../operations';

describe('formattedDate', () => {
  it('formats the current date as YYYY-MM-DD with zero-padded month/day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 5)); // Jan 5, 2024 -- both need padding
    expect(formattedDate()).toBe('2024-01-05');
    vi.useRealTimers();
  });
});

describe('generateUniqueId', () => {
  it('starts with an underscore and is non-empty', () => {
    const id = generateUniqueId();
    expect(id.startsWith('_')).toBe(true);
    expect(id.length).toBeGreaterThan(1);
  });

  it('generates different ids across calls', () => {
    expect(generateUniqueId()).not.toBe(generateUniqueId());
  });
});
