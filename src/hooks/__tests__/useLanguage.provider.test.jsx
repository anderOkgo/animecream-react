import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage, translateApiMessage } from '../useLanguage';

const wrapper = ({ children }) => <LanguageProvider>{children}</LanguageProvider>;
const setBrowserLanguage = (lang) => Object.defineProperty(window.navigator, 'language', { value: lang, configurable: true });
const meta = () => document.querySelector('meta[name="description"]');

describe('LanguageProvider, document and storage', () => {
  beforeEach(() => {
    localStorage.clear();
    setBrowserLanguage('en-US');
    document.head.innerHTML = '<meta name="description" content="">';
  });

  it('follows a Spanish browser and writes the Spanish title and description', () => {
    setBrowserLanguage('es-CO');
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe('es');
    expect(document.title).toMatch(/^Animecream - Descubre/);
    expect(meta().content).toMatch(/^Descubre/);
  });

  it('writes the English title and description, and toggles back from Spanish', () => {
    localStorage.setItem('lang', 'es');
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => result.current.toggleLanguage());
    expect(result.current.language).toBe('en');
    expect(document.title).toMatch(/^Animecream - Discover/);
    expect(meta().content).toMatch(/^Discover/);
    expect(localStorage.getItem('lang')).toBe('en');
  });

  it('works without a description meta tag', () => {
    document.head.innerHTML = '';
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('follows another tab that stores or removes the language, and ignores other keys', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      localStorage.setItem('lang', 'es');
      window.dispatchEvent(new StorageEvent('storage', { key: 'lang', newValue: 'es' }));
    });
    expect(result.current.language).toBe('es');

    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'dark' })));
    expect(result.current.language).toBe('es');

    act(() => {
      localStorage.removeItem('lang');
      window.dispatchEvent(new StorageEvent('storage', { key: 'lang', newValue: null }));
    });
    expect(result.current.language).toBe('en');
  });

  it('prefers a language stored outside the hook when it next changes', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.toggleLanguage(); // es, not saved: it follows the browser
      localStorage.setItem('lang', 'en'); // written elsewhere before the effect runs
    });
    expect(result.current.language).toBe('en');
  });

  it('returns to the browser language when the stored default disappears', () => {
    setBrowserLanguage('es-ES');
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.toggleLanguage(); // en
      result.current.saveLanguageAsDefault();
      localStorage.removeItem('lang'); // removed before the effect runs
    });
    expect(result.current.language).toBe('es');
  });

  describe('t', () => {
    it('matches a key case-insensitively in the current language', () => {
      localStorage.setItem('lang', 'es');
      const { result } = renderHook(() => useLanguage(), { wrapper });
      const key = 'errorUnknown';
      expect(result.current.t(key.toUpperCase())).toBe(result.current.t(key));
      expect(result.current.t(42)).toBe(42);
    });

    it('falls back to English, also case-insensitively, for a language it does not know', () => {
      // Another tab can store any value under "lang"
      localStorage.setItem('lang', 'fr');
      const { result } = renderHook(() => useLanguage(), { wrapper });
      expect(result.current.language).toBe('fr');
      const english = translateApiMessage((k) => k, 'errorUnknown');
      expect(result.current.t('errorUnknown')).not.toBe(english); // the English text, not the key
      expect(result.current.t('ERRORUNKNOWN')).toBe(result.current.t('errorUnknown'));
      expect(result.current.t('not a key')).toBe('not a key');
    });
  });
});

describe('translateApiMessage, message parts', () => {
  const t = (k) => `<${k}>`;

  it('drops empty parts of an array', () => {
    expect(translateApiMessage(t, ['a', '  ', 'b'])).toBe('<a>, <b>');
    expect(translateApiMessage(t, ['a', 5])).toBe('<a>, <5>'); // a number part is read as text
  });

  it('translates the known prefixes and keeps their details', () => {
    expect(translateApiMessage(t, 'Invalid genre IDs: 4, 9')).toBe('<Invalid genre IDs:> 4, <9>');
    expect(translateApiMessage(t, 'Invalid title IDs: 7')).toBe('<Invalid title IDs:> 7');
    expect(translateApiMessage(t, 'Image size must not exceed 2MB')).toBe('<Image size must not exceed> 2MB');
    expect(translateApiMessage(t, 'Error updating series image: Year must be between 1900 and 2030')).toBe(
      '<Error updating series image:> <Year must be between 1900 and> 2030'
    );
  });

  it('turns a non-string, non-object message into the unknown error', () => {
    expect(translateApiMessage(t, 42)).toBe('<errorUnknown>');
  });
});
