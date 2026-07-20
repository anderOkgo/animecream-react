import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage, translateApiMessage, translateEN } from '../useLanguage';

const identity = (key) => key;

beforeEach(() => {
  localStorage.clear();
});

describe('translateApiMessage', () => {
  it('falls back to errorUnknown for falsy/non-string/empty messages', () => {
    expect(translateApiMessage(identity, null)).toBe('errorUnknown');
    expect(translateApiMessage(identity, undefined)).toBe('errorUnknown');
    expect(translateApiMessage(identity, 42)).toBe('errorUnknown');
  });

  it('extracts the year from a "Year must be between 1900 and X" message', () => {
    expect(translateApiMessage(identity, 'Year must be between 1900 and 2030')).toBe(
      'Year must be between 1900 and 2030'
    );
  });

  it('extracts the id from a "Demography ID X does not exist" message', () => {
    expect(translateApiMessage(identity, 'Demography ID 7 does not exist')).toBe(
      'Demography ID 7 does not exist'
    );
  });

  it('translates a plain message via t()', () => {
    const t = vi.fn((k) => `[${k}]`);
    expect(translateApiMessage(t, 'Unknown error')).toBe('[Unknown error]');
  });

  it('splits and translates a comma-separated list of messages', () => {
    const t = vi.fn((k) => k.toUpperCase());
    expect(translateApiMessage(t, 'foo, bar')).toBe('FOO, BAR');
  });

  it('translates each element of an array message and joins them', () => {
    const t = vi.fn((k) => k.toUpperCase());
    expect(translateApiMessage(t, ['foo', 'bar'])).toBe('FOO, BAR');
  });

  it('recurses into an object with a string .message field', () => {
    const t = vi.fn((k) => k.toUpperCase());
    expect(translateApiMessage(t, { message: 'boom' })).toBe('BOOM');
  });

  it('recurses into an object with a string .error field when .message is absent', () => {
    const t = vi.fn((k) => k.toUpperCase());
    expect(translateApiMessage(t, { error: 'boom' })).toBe('BOOM');
  });

  it('falls back to the object\'s string values when neither .message nor .error exist', () => {
    const t = vi.fn((k) => k.toUpperCase());
    expect(translateApiMessage(t, { field: 'required' })).toBe('REQUIRED');
  });

  it('falls back to errorUnknown for an object with no string values at all', () => {
    expect(translateApiMessage(identity, { count: 5 })).toBe('errorUnknown');
  });

  it('unwraps a known wrapped-prefix message recursively', () => {
    const t = vi.fn((k) => k);
    expect(translateApiMessage(t, 'Error creating complete series: Invalid genre IDs: 1,2')).toBe(
      'Error creating complete series: Invalid genre IDs: 1,2'
    );
  });
});

describe('translateEN', () => {
  it('returns the key itself when there is no English translation for it', () => {
    expect(translateEN('__not_a_real_key__')).toBe('__not_a_real_key__');
  });
});

function wrapper({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

describe('useLanguage / LanguageProvider', () => {
  it('throws when used outside a LanguageProvider', () => {
    // Rendered without the wrapper -- expect the hook's own guard to throw.
    expect(() => renderHook(() => useLanguage())).toThrow('useLanguage must be used within LanguageProvider');
  });

  it('toggleLanguage flips between en and es', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    const initial = result.current.language;
    act(() => result.current.toggleLanguage());
    expect(result.current.language).toBe(initial === 'en' ? 'es' : 'en');
  });

  it('t() falls back to the key itself for an unknown translation', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.t('__totally_unknown_key__')).toBe('__totally_unknown_key__');
  });

  it('t() returns an empty string for a nullish/empty key', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.t('')).toBe('');
    expect(result.current.t(null)).toBe('');
  });

  it('saveLanguageAsDefault persists the current language and stops following the system', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => result.current.saveLanguageAsDefault());
    expect(localStorage.getItem('lang')).toBe(result.current.language);
  });

  it('toggleLanguage persists to localStorage once a preference has been saved', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => result.current.saveLanguageAsDefault());
    act(() => result.current.toggleLanguage());
    expect(localStorage.getItem('lang')).toBe(result.current.language);
  });

  it('restoreSystemDefault clears the stored preference', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => result.current.saveLanguageAsDefault());
    expect(localStorage.getItem('lang')).not.toBeNull();

    act(() => result.current.restoreSystemDefault());
    expect(localStorage.getItem('lang')).toBeNull();
  });

  it('syncs the language when a cross-tab "storage" event sets a new value', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    const other = result.current.language === 'en' ? 'es' : 'en';

    // A real cross-tab storage event fires because the *other* tab actually
    // wrote to localStorage -- the handler trusts the event's own
    // `newValue`, but a later effect re-reads localStorage directly
    // (`getStoredLanguage()`), so the write has to be real here too, not
    // just a synthetic event with no backing localStorage change.
    act(() => {
      localStorage.setItem('lang', other);
      window.dispatchEvent(new StorageEvent('storage', { key: 'lang', newValue: other }));
    });
    expect(result.current.language).toBe(other);
  });
});
