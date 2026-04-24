# Michelin SmartGuide

Application mobile-first de découverte gastronomique personnalisée. Les utilisateurs effectuent un parcours sensoriel pour établir leur profil gustatif, qui génère ensuite des recommandations de restaurants adaptées à leurs préférences.

## Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | Next.js (App Router) | 16.2.4 |
| UI | React + TypeScript | 19.x + 5.x |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 12.x |
| Base de données | Supabase (PostgreSQL + Auth + Storage) | 2.x |
| IA | OpenAI GPT-4o-mini | 6.x |
| Stockage fichiers | AWS S3 via Supabase Storage | 3.x |
| Éditeur | TinyMCE | 6.x |
| Validation | Zod | 4.x |
| Package manager | Bun | latest |

## Fonctionnalités principales

### Parcours sensoriel
Expérience de swipe interactive à travers des fiches restaurants. Construit un archétype gustatif basé sur des poids sensoriels, stocké dans `user_taste_profiles` avec un vecteur de scores et un pourcentage de correspondance.

### Recommandations personnalisées
- Restaurants à proximité (géolocalisation + RPC Supabase)
- Filtres : Étoilés Michelin, Bib Gourmand, Terrasse
- Score calculé en pondérant les traits restaurant avec le profil gustatif

### Espace chef
- Gestion du profil restaurant
- Publication d'articles via éditeur riche (TinyMCE)
- Soumission de demandes de revendication de restaurant

### Back-office admin
- KPIs (utilisateurs, chefs, articles, restaurants, revendications en attente)
- Validation / rejet des demandes de revendication avec documents officiels

### Profil utilisateur
- Visualisation de l'archétype gustatif avec barres animées par dimension
- Favoris (À essayer / Visité)
- Notifications en temps réel

## Prérequis

- Node.js >= 20.0.0
- Bun (gestionnaire de paquets)
- Compte Supabase
- Clé API OpenAI

## Installation

```bash
bun install
```

Créer un fichier `.env` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=<url-supabase>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<clé-publique>
SUPABASE_SERVICE_ROLE_KEY=<clé-service>
OPENAI_API_KEY=<clé-openai>
S3_ACCESS_KEY_ID=<clé-s3>
S3_SECRET_ACCESS_KEY=<secret-s3>
```

## Scripts

```bash
bun run dev      # Serveur de développement (http://localhost:3000)
bun run build    # Build de production
bun run start    # Serveur de production
bun run lint     # Linting ESLint
```

## Structure du projet

```
src/
├── app/
│   ├── (main)/          # Shell principal avec navigation basse
│   ├── (auth)/          # Pages authentification
│   ├── (sensoriel)/     # Parcours sensoriel (plein écran)
│   ├── (admin)/         # Back-office admin
│   └── api/             # Routes API (restaurants nearby, recommended)
├── components/          # Composants React
├── lib/                 # Actions serveur et logique métier
├── context/             # AuthContext global
├── hooks/               # useGeolocation, useRestaurantActions
├── utils/               # Clients Supabase (SSR, admin), S3
└── types/               # Types TypeScript (généré Supabase)
```

## Architecture

### Middleware
`src/proxy.ts` — redirige les nouveaux utilisateurs vers le parcours sensoriel si aucun profil gustatif n'existe (sauf chefs et admins).

### Mutations via Server Actions
Toutes les mutations (inscription, revendications, articles, swipes) passent par des Next.js Server Actions avec accès aux cookies et respect des RLS Supabase.

### Clients Supabase
- **SSR** (`utils/supabase/server.ts`) — respecte les RLS via cookies
- **Admin** (`utils/supabase/admin.ts`) — contourne les RLS pour les opérations cross-utilisateur

### Algorithme de profil gustatif
Implémenté dans `src/lib/sensoriel/scoring.ts`. Swipe like : `+2`, pass : `-1`. Les scores sont calculés en multipliant les poids des traits par les poids d'archétype. Le meilleur archétype est sélectionné par score maximal.

## Déploiement Docker

```bash
docker build -t michelin-smartguide .
docker run -p 3000:3000 michelin-smartguide
```

L'image utilise Bun comme runtime avec un build multi-stage (deps → build → runner). Output standalone Next.js pour une empreinte minimale. Tourne en utilisateur non-root `bun`.

## Documentation

La documentation technique complète est disponible dans `/docs/` (site Docusaurus) :
- Architecture et structure du projet
- Schéma de base de données
- Routes et pages
- Flux d'authentification
- Référence des Server Actions et endpoints API
