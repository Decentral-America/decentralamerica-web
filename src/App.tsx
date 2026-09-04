import { lazy, Suspense } from 'react';
import { Nav } from '@/components/Nav';
import { type Lang, LangProvider } from '@/lib/i18n';
import { normalize, useRoute } from '@/lib/router';
import { Disappearance } from '@/sections/Disappearance';
import { Doors } from '@/sections/Doors';
import { Footer } from '@/sections/Footer';
import { Hero } from '@/sections/Hero';
import { HowItWorks } from '@/sections/HowItWorks';
import { NodoPublico } from '@/sections/NodoPublico';
import { Origin } from '@/sections/Origin';
import { Programs } from '@/sections/Programs';
import { PublicacionesTeaser } from '@/sections/Publicaciones';
import { Reach } from '@/sections/Reach';

/* The blog loads on demand so the landing bundle does not carry the renderer. */
const Publicaciones = lazy(() => import('@/pages/Publicaciones'));
const Post = lazy(() => import('@/pages/Post'));
const Nodo = lazy(() => import('@/pages/Nodo'));
const Verificar = lazy(() => import('@/pages/Verificar'));
const Organizaciones = lazy(() => import('@/pages/Organizaciones'));
const Financiar = lazy(() => import('@/pages/Financiar'));

/**
 * The scroll order is the argument, and it only works in this sequence:
 * the claim, the loss that motivates it, the mechanism, the instruments,
 * the reach, the precedent, the custodians, the ways in.
 */
function Landing() {
  return (
    <>
      <Hero />
      <Disappearance />
      <HowItWorks />
      <Programs />
      <Reach />
      <Origin />
      <NodoPublico />
      <PublicacionesTeaser />
      <Doors />
    </>
  );
}

function Body({ path: raw }: { path: string }) {
  const path = normalize(raw);
  if (path === '/') return <Landing />;
  if (path === '/verificar') return <Verificar />;
  if (path === '/organizaciones') return <Organizaciones />;
  if (path === '/nodo') return <Nodo />;
  if (path === '/financiar') return <Financiar />;
  if (path === '/publicaciones') return <Publicaciones />;
  if (path.startsWith('/publicaciones/'))
    return <Post slug={path.slice('/publicaciones/'.length)} />;
  return <Landing />;
}

export default function App({ path: initial, lang }: { path?: string; lang?: Lang }) {
  const path = useRoute(initial);

  return (
    <LangProvider initial={lang}>
      <Nav />
      <main id="main">
        <Suspense fallback={<div className="min-h-[60svh]" />}>
          <Body path={path} />
        </Suspense>
      </main>
      <Footer />
    </LangProvider>
  );
}
