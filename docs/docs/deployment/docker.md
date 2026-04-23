---
id: docker
title: Docker
---

# Déploiement Docker

L'application est configurée pour un build **standalone** Next.js, optimisé pour la conteneurisation.

## Configuration Next.js

Dans `next.config.ts` :

```ts
output: "standalone"
serverActions.bodySizeLimit: "6mb"   // pour les uploads de documents
images.remotePatterns: [{ protocol: "https", hostname: "**" }]
```

## Build

```bash
docker build -t michelin-smartguide .
```

Le Dockerfile utilise un **build multi-stage** :

1. **Stage `deps`** — installe les dépendances avec Bun
2. **Stage `builder`** — compile l'application (`bun run build`)
3. **Stage `runner`** — image finale légère avec uniquement les fichiers standalone

## Run

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e OPENAI_API_KEY=... \
  michelin-smartguide
```

## Développement local

```bash
bun install
bun dev
```

L'application est accessible sur `http://localhost:3000`.
