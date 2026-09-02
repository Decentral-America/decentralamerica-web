import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type Lang = 'es' | 'en';

/**
 * Spanish is the default and the authored language. English is the translation,
 * not the other way round: the audience is Central American institutions, and an
 * English-default site asking a municipality to trust it with public-record
 * integrity works against itself.
 */
export const DEFAULT_LANG: Lang = 'es';

const KEY = 'da:lang';
const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: DEFAULT_LANG,
  setLang: () => {},
});

export function LangProvider({ children, initial }: { children: ReactNode; initial?: Lang }) {
  // `initial` is what the prerender renders. On the client it is undefined, so
  // the first hydrated render matches the HTML and the stored choice is applied
  // in the effect below — one extra render, nothing visible.
  const [lang, setLangState] = useState<Lang>(initial ?? DEFAULT_LANG);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* private mode, blocked site data — fall through to the default */
    }
    if (stored === 'en' || stored === 'es') {
      setLangState(stored);
      return;
    }
    // No stored choice: honour the browser, but only to pick English out of
    // Spanish. Anything else still gets Spanish.
    if (typeof navigator !== 'undefined' && navigator.language?.startsWith('en')) {
      setLangState('en');
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* nothing to do — the choice just will not persist */
    }
  }, []);

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

/** A pair of strings, picked by the active language. */
export type T = { es: string; en: string };

/** `const t = useT(); t({ es: '…', en: '…' })` */
export function useT() {
  const { lang } = useLang();
  return useCallback((pair: T) => pair[lang], [lang]);
}

/** Picks from a pair outside a component (prerender, metadata). */
export function pick(pair: T, lang: Lang) {
  return pair[lang];
}

/**
 * Thousands separator by language: Costa Rica writes 2.325.752, English writes
 * 2,325,752. Grouped by hand rather than through Intl.NumberFormat because Node
 * and the browser do not always ship the same ICU data, and a disagreement here
 * would be a hydration mismatch on the one number the hero exists to show.
 */
export function fmtNumber(n: number, lang: Lang) {
  // Both separators swap, not just the grouping one: Spanish writes 3,04 where
  // English writes 3.04. An earlier version rounded with toFixed(0), which threw
  // the decimals away before they could be formatted and rendered 3.04 GB as
  // "3 GB" — the fraction branch below was unreachable.
  const group = lang === 'es' ? '.' : ',';
  const decimal = lang === 'es' ? ',' : '.';
  const [whole = '', frac] = Math.abs(n).toString().split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `${n < 0 ? '-' : ''}${grouped}${frac ? decimal + frac : ''}`;
}

/** `const n = useNum(); n(2325752)` */
export function useNum() {
  const { lang } = useLang();
  return useCallback((v: number) => fmtNumber(v, lang), [lang]);
}
