import type { ReactNode } from 'react';
import { Mark } from '@/components/Logo';
import { Container, Mono } from '@/components/primitives';
import { ENTITY } from '@/lib/content';
import type { T } from '@/lib/i18n';
import { useT } from '@/lib/i18n';

const CONTACT = 'info@decentralchain.io';

/**
 * Absolute `/#hash` rather than a bare `#hash`: the footer also renders on the
 * blog routes, where a bare fragment has nothing to scroll to. The router turns
 * these into a navigation home followed by the scroll, and leaves them to the
 * browser when the landing page is already on screen.
 */
const SITE: { href: string; label: T }[] = [
  { href: '/#registro', label: { en: 'The record', es: 'El registro' } },
  { href: '/#como-funciona', label: { en: 'How it works', es: 'Cómo funciona' } },
  { href: '/#alcance', label: { en: 'Reach', es: 'Alcance' } },
  { href: '/#nodo-publico', label: { en: 'Nodo Público', es: 'Nodo Público' } },
  { href: '/#puertas', label: { en: 'Ways in', es: 'Cómo entrar' } },
  { href: '/publicaciones', label: { en: 'Publications', es: 'Publicaciones' } },
];

/** The same four destinations the Doors section opens, repeated as plain nav. */
const WAYS: { href: string; label: T }[] = [
  { href: '/verificar', label: { en: 'Verify a record', es: 'Verificá un registro' } },
  { href: '/organizaciones', label: { en: 'Add your organization', es: 'Sumá tu organización' } },
  { href: '/nodo', label: { en: 'Run a node', es: 'Operá un nodo' } },
  { href: '/financiar', label: { en: 'Fund a country', es: 'Financiá un país' } },
];

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-block text-[0.9375rem] text-muted transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-ink"
    >
      {children}
    </a>
  );
}

export function Footer() {
  const t = useT();

  return (
    <footer className="rule">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.3fr]">
          <div className="max-w-[38ch]">
            <p className="flex items-center gap-2.5 text-lg font-bold tracking-[-0.025em]">
              <Mark className="h-[1.3em] w-[1.3em] shrink-0 translate-y-[0.04em]" />
              DecentralAmerica
            </p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
              {t({
                en: 'The public memory of Latin America.',
                es: 'La memoria pública de América Latina.',
              })}
            </p>
            {/* The site's claim discipline, stated where anyone checking can find it. */}
            <p className="mt-8 text-[0.8125rem] leading-relaxed text-faint">
              {t({
                en: 'Every figure published on this site is traceable to a source document. No document, no figure.',
                es: 'Cada cifra publicada en este sitio es trazable a un documento fuente. Si no hay documento, no hay cifra.',
              })}
            </p>
          </div>

          <nav aria-label={t({ en: 'The site', es: 'El sitio' })}>
            <h2 className="eyebrow">{t({ en: 'The site', es: 'El sitio' })}</h2>
            <ul className="mt-5 space-y-3">
              {SITE.map((s) => (
                <li key={s.href}>
                  <FooterLink href={s.href}>{t(s.label)}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t({ en: 'Take part', es: 'Participar' })}>
            <h2 className="eyebrow">{t({ en: 'Take part', es: 'Participar' })}</h2>
            <ul className="mt-5 space-y-3">
              {WAYS.map((w) => (
                <li key={w.href}>
                  <FooterLink href={w.href}>{t(w.label)}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow">{t({ en: 'The association', es: 'La asociación' })}</h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="eyebrow">{t({ en: 'Legal entity', es: 'Entidad legal' })}</dt>
                <dd className="mt-1.5 text-[0.9375rem]">
                  {ENTITY.name}
                  {ENTITY.registered ? null : (
                    <span className="text-faint">
                      {' '}
                      {t({ en: '(in formation)', es: '(en constitución)' })}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">{t({ en: 'Registration id', es: 'Cédula jurídica' })}</dt>
                {/*
                 * Words, not an empty slot. A blank here reads as an oversight;
                 * "en trámite" states the actual position, which is that the
                 * association is not registered yet and is not pretending to be.
                 */}
                <dd className="mt-1.5">
                  {ENTITY.cedula ? (
                    <Mono>{ENTITY.cedula}</Mono>
                  ) : (
                    <span className="text-[0.9375rem] text-muted">
                      {t({ en: 'Pending registration', es: 'En trámite' })}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                {/* Not "registered seat" — there is no registration to seat it in. */}
                <dt className="eyebrow">{t({ en: 'Based in', es: 'Domicilio' })}</dt>
                <dd className="mt-1.5 text-[0.9375rem]">{ENTITY.domicile}</dd>
              </div>
              <div>
                <dt className="eyebrow">{t({ en: 'Contact', es: 'Contacto' })}</dt>
                <dd className="mt-1.5">
                  <a
                    href={`mailto:${CONTACT}`}
                    className="mono-data underline decoration-hairline-2 decoration-1 underline-offset-4 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:decoration-ink"
                  >
                    {CONTACT}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rule mt-16 pt-6 sm:mt-20">
          <p className="text-[0.8125rem] text-faint">
            {t({
              en: 'Open source under the MIT license.',
              es: 'Código abierto bajo licencia MIT.',
            })}
          </p>
        </div>
      </Container>
    </footer>
  );
}
