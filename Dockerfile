# Builds the prerendered site and serves it from Caddy.
#
# A Dockerfile rather than Railway's static provider, which serves a single-page
# app fallback that cannot be turned off through railway.json: it answered 200
# with the home page for /landing4 and every other path that does not exist.
# See the Caddyfile.

# renovate: image=node tag=24.12.0-alpine
FROM node:24.12.0-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.29.2 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# build-blog, vite build, then prerender: writes every route, copies home.html
# over Vite's shell, and emits the sitemap.
RUN pnpm run build

# renovate: image=caddy tag=2.11.4-alpine
FROM caddy:2.11.4-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

# Fails the build on a malformed Caddyfile rather than at container start, where
# Railway would report it as a crash loop.
RUN caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

EXPOSE 8080
