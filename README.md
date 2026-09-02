# decentralamerica.com

The landing site for DecentralAmerica — an association building Latin America's
permanent public record.

Static React, no backend. The live chain figures in the hero are read from the
public mainnet node directly by the reader's browser, so there is no server to
run and nothing to trust between the node and the page.

## Develop

```bash
pnpm install
pnpm dev          # vite, port 5173
pnpm build        # blog → vite build → prerender every route to static HTML
pnpm lint         # biome
pnpm typecheck    # tsc --noEmit
```

## Rules that are not negotiable

**Every figure comes from `src/lib/content.ts`.** Nothing on the page may state a
fact that is not in that file, and nothing enters that file without a source in
the comment above it. This carries over the SOURCE-OF-TRUTH discipline from the
DecentralChain site, which exists because sourced facts and editorial framing
were being mixed in the same sentence with nothing to tell them apart.

**Spanish is authored, English is translated.** The audience is Central American
institutions.

**No token, ticker, yield or "web3" in user-facing copy.** If the page cannot
explain the organization without those words, the positioning is not finished.
The single permitted technical disclosure is the closed `<details>` in the
"how it works" section.

**`--color-confirmed` is reserved for confirmed state.** It is never decorative.

## Layout

- `src/lib/content.ts` — the facts. Start here.
- `src/lib/i18n.tsx` — `useT()`, Spanish default
- `src/lib/chain.ts` — live mainnet reads, SSR-safe, deduped polling
- `src/sections/` — the landing page, in scroll order
- `content/blog/` — markdown, bilingual, three types: artículo · hallazgo · informe
