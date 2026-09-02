import { prerender } from 'react-dom/static';
import App from '@/App';
import type { Lang } from '@/lib/i18n';

export { POST_PATHS, POSTS } from '@/lib/blog';
export {
  canonicalFor,
  DESCRIPTION,
  escapeHtml,
  ROUTE_META,
  ROUTE_PATHS,
  SITE,
  SITE_NAME,
  TITLE,
} from '@/lib/seo';

/**
 * Renders one route to complete HTML. `prerender` rather than renderToString:
 * the blog pages are behind React.lazy, and prerender waits for every Suspense
 * boundary to resolve, so the output is the finished page and not a fallback.
 */
export async function render(path: string, lang: Lang = 'es'): Promise<string> {
  // prerender recovers from a thrown component and emits the rest of the page.
  // Collecting and rethrowing is what stops a broken route shipping as a
  // plausible-looking half-page.
  const errors: unknown[] = [];
  const { prelude } = await prerender(<App lang={lang} path={path} />, {
    onError: (e: unknown) => {
      errors.push(e);
    },
  });
  if (errors.length > 0) throw errors[0];

  const reader = prelude.getReader();
  const decoder = new TextDecoder();
  let html = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    html += decoder.decode(value, { stream: true });
  }
  return html + decoder.decode();
}
