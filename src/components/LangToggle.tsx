import type { Lang } from '@/lib/i18n';
import { useLang, useT } from '@/lib/i18n';

/**
 * The names stay in their own language rather than going through `t()`. A reader
 * who cannot read the page they landed on is exactly the person who needs this
 * control, and "Inglés" is no help to them; `lang` on the span keeps a screen
 * reader from pronouncing each name with the page's voice.
 */
const LANGS = [
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'en', label: 'EN', name: 'English' },
] as const satisfies readonly { code: Lang; label: string; name: string }[];

/**
 * A utility, not a feature. Two real buttons so the choice is operable and
 * announced; the active one is marked by `aria-pressed` and, visually, by a
 * filled pill and a heavier weight — never by colour, of which there is none.
 *
 * The wrapper is a <fieldset> rather than a div with role="group": same
 * exposed role, no ARIA, and it is the element the linter accepts.
 */
export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang();
  const t = useT();

  return (
    <fieldset
      aria-label={t({ en: 'Language', es: 'Idioma' })}
      className={`mono-data m-0 inline-flex items-center gap-px rounded-full border-0 bg-ink/5 p-[3px] ${className}`}
    >
      {LANGS.map(({ code, label, name }) => {
        const active = code === lang;
        return (
          <button
            aria-pressed={active}
            className={`rounded-full px-2 py-[3px] leading-none transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-2.5 ${
              active ? 'bg-ink font-medium text-ground' : 'text-muted hover:text-ink'
            }`}
            key={code}
            onClick={() => setLang(code)}
            type="button"
          >
            {label}
            <span className="sr-only" lang={code}>
              {' '}
              {name}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
