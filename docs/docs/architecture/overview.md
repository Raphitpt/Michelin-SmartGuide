---
id: overview
title: Vue d'ensemble
---

# Architecture générale

## Structure du projet

```
src/
├── app/                  # Pages Next.js (App Router)
│   ├── (main)/           # Shell principal avec BottomNav
│   ├── (auth)/           # Pages d'authentification
│   ├── (sensoriel)/      # Parcours sensoriel (full-screen)
│   ├── (admin)/          # Back-office admin
│   └── api/              # Route handlers API
├── components/           # Composants React
│   ├── ui/               # Primitives partagées
│   ├── pages/            # Composants de page (client)
│   ├── restaurant/       # Composants restaurant
│   ├── sensoriel/        # Composants du parcours sensoriel
│   ├── editor/           # Éditeur d'articles (TinyMCE)
│   ├── admin/            # Composants admin
│   └── formRestaurant/   # Formulaire d'ajout restaurant
├── lib/                  # Logique métier
│   ├── auth/             # Actions et schémas d'auth
│   ├── articles/         # CRUD articles
│   ├── admin/            # Actions admin
│   ├── sensoriel/        # Queries, actions et scoring
│   └── motion.ts         # Variantes Framer Motion partagées
├── context/              # Contexte React global
├── hooks/                # Hooks personnalisés
├── utils/                # Clients Supabase, S3
├── types/                # Types Supabase auto-générés
└── proxy.ts              # Logique middleware (onboarding gate)
```

## Patterns architecturaux clés

### Server Actions plutôt qu'API routes

Toutes les mutations (auth, articles, swipes, claims) passent par des **Server Actions** Next.js, ce qui garde la logique métier côté serveur sans exposer d'endpoints HTTP.

Les API routes (`/api/restaurants/nearby`, `/api/restaurants/recommended`) sont réservées aux lectures côté client qui nécessitent des paramètres dynamiques (filtre, géolocalisation).

### Deux niveaux de clients Supabase

| Client | Fichier | Usage |
|--------|---------|-------|
| SSR (cookie) | `utils/supabase/server.ts` | Server Components, Server Actions — respecte le scope utilisateur via RLS |
| Admin (service role) | `utils/supabase/admin.ts` | Opérations cross-user : modération admin, mise à jour du profil gustatif |

### Garde d'accès au niveau du layout

Le layout `(admin)` effectue un check serveur et redirige les non-admins avant tout rendu. Pas de logique côté client pour cette protection.

### Middleware comme gate d'onboarding

`src/proxy.ts` est exécuté à chaque requête. Il vérifie l'existence d'un `user_taste_profiles` pour l'utilisateur connecté. Si absent, il redirige vers `/parcours-sensoriel`. Les chefs et admins sont exemptés.

## Flux de données typique

```
Utilisateur → Middleware (proxy.ts)
  → Layout check (auth/role)
    → Page (Server Component ou Client Component)
      → Server Action ou API Route
        → Supabase (PostgreSQL)
```
