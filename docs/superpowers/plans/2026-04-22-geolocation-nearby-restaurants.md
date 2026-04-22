# Géolocalisation — Restaurants à proximité — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher les restaurants dans un rayon de 50 km autour de l'utilisateur quand le filtre "À proximité" est actif sur la page d'accueil.

**Architecture:** Une route API Next.js `/api/restaurants/nearby` exécute une requête PostGIS `ST_DWithin` côté serveur. Un hook `useGeolocation` gère la permission navigateur et la persistance `localStorage`. `HomeRestaurantList` est refactoré en Client Component et reçoit `activeFilter` depuis `HomePage`.

**Tech Stack:** Next.js 16 App Router, Supabase (PostGIS), TypeScript, React 19, `navigator.geolocation`

---

## File Map

| Action | Fichier | Rôle |
|--------|---------|------|
| Create | `src/app/api/restaurants/nearby/route.ts` | Route API GET — requête PostGIS |
| Create | `src/hooks/useGeolocation.ts` | Hook géolocalisation + localStorage |
| Modify | `src/components/HomeRestaurantList.tsx` | Client Component avec filtre géo |
| Modify | `src/components/HomePage.tsx` | Passe `activeFilter` + `onFilterFallback` |
| Modify | `src/app/(main)/page.tsx` | Supprime le prop SSR `restaurantList` |

---

## Task 1 : Route API `/api/restaurants/nearby`

**Files:**
- Create: `src/app/api/restaurants/nearby/route.ts`

- [ ] **Step 1 : Créer la route**

Créer `src/app/api/restaurants/nearby/route.ts` :

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const radius = parseInt(searchParams.get('radius') ?? '50000', 10)

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('restaurants_nearby', {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radius,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ restaurants: data ?? [] })
}
```

- [ ] **Step 2 : Créer la fonction SQL Supabase**

Dans le dashboard Supabase, aller dans **SQL Editor** et exécuter :

```sql
CREATE OR REPLACE FUNCTION restaurants_nearby(
  user_lat float8,
  user_lng float8,
  radius_meters int DEFAULT 50000
)
RETURNS SETOF restaurants
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM restaurants
  WHERE is_published = true
    AND main_image IS NOT NULL
    AND location IS NOT NULL
    AND ST_DWithin(
      location::geography,
      ST_MakePoint(user_lng, user_lat)::geography,
      radius_meters
    )
  ORDER BY ST_Distance(
    location::geography,
    ST_MakePoint(user_lng, user_lat)::geography
  )
  LIMIT 20;
$$;
```

- [ ] **Step 3 : Tester manuellement la route**

Lancer le serveur dev (`pnpm dev`) et appeler dans le navigateur ou curl :

```
http://localhost:3000/api/restaurants/nearby?lat=48.8566&lng=2.3522
```

Résultat attendu : `{ "restaurants": [...] }` avec les restaurants à moins de 50 km de Paris, ou tableau vide si aucun.

- [ ] **Step 4 : Commit**

```bash
git add src/app/api/restaurants/nearby/route.ts
git commit -m "feat(api): add /api/restaurants/nearby PostGIS endpoint"
```

---

## Task 2 : Hook `useGeolocation`

**Files:**
- Create: `src/hooks/useGeolocation.ts`

- [ ] **Step 1 : Créer le dossier et le hook**

Créer `src/hooks/useGeolocation.ts` :

```typescript
'use client'

import { useEffect, useState } from 'react'

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'denied' | 'unavailable'

export interface GeolocationCoords {
  lat: number
  lng: number
}

const STORAGE_KEY = 'michelin_user_location'

function readCached(): GeolocationCoords | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as GeolocationCoords
  } catch {
    return null
  }
}

function writeCache(coords: GeolocationCoords) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coords))
  } catch {
    // localStorage unavailable
  }
}

export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [coords, setCoords] = useState<GeolocationCoords | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      return
    }

    // Load cached position immediately so UI isn't blocked
    const cached = readCached()
    if (cached) {
      setCoords(cached)
      setStatus('success')
    } else {
      setStatus('loading')
    }

    // Always request a fresh position
    const timeoutId = setTimeout(() => {
      // If still loading after 10s, treat as denied
      setStatus((prev) => (prev === 'loading' ? 'denied' : prev))
    }, 10_000)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId)
        const fresh: GeolocationCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        writeCache(fresh)
        setCoords(fresh)
        setStatus('success')
      },
      (err) => {
        clearTimeout(timeoutId)
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setStatus('denied')
        } else {
          setStatus('unavailable')
        }
      },
      { timeout: 10_000, maximumAge: 300_000 }
    )

    return () => clearTimeout(timeoutId)
  }, [])

  return { coords, status }
}
```

- [ ] **Step 2 : Vérifier que TypeScript compile**

```bash
pnpm tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/hooks/useGeolocation.ts
git commit -m "feat(hook): add useGeolocation with localStorage cache"
```

---

## Task 3 : Refactorer `HomeRestaurantList` en Client Component

**Files:**
- Modify: `src/components/HomeRestaurantList.tsx`

- [ ] **Step 1 : Réécrire le composant**

Remplacer entièrement `src/components/HomeRestaurantList.tsx` :

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import { FILTRE_ACCUEIL, FiltreAccueil } from '@/constants'
import { useGeolocation } from '@/hooks/useGeolocation'
import MichelinStar from '@/components/MichelinStar'
import { Database } from '@/types/supabase'

type MichelinAward = Database['public']['Tables']['michelin_awards']['Row']
type Restaurant = Database['public']['Tables']['restaurants']['Row'] & {
  michelin_awards: MichelinAward | null
}

function StarRating({ count }: Readonly<{ count: number }>) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <MichelinStar key={`star-${i}`} />
      ))}
    </div>
  )
}

function HomeRestaurantCard({ restaurant }: Readonly<{ restaurant: Restaurant }>) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="shrink-0 w-44 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative w-full h-40 bg-gray-100">
        {restaurant.main_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={restaurant.main_image} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
          <Heart size={14} strokeWidth={1.5} className="stroke-michelin-black" />
        </div>
      </div>
      <div className="p-3">
        <div className="mb-1">
          <StarRating count={restaurant.michelin_awards?.stars ?? 0} />
        </div>
        <p className="font-semibold text-michelin-black text-sm leading-snug">{restaurant.name}</p>
        <p className="text-michelin-gray text-xs mt-0.5">{restaurant.city}</p>
        {restaurant.price_avg_eur && (
          <p className="text-michelin-black text-xs font-medium mt-0.5">{restaurant.price_avg_eur}€ moy.</p>
        )}
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-44 rounded-xl overflow-hidden bg-white shadow-sm animate-pulse">
      <div className="w-full h-40 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}

interface HomeRestaurantListProps {
  activeFilter: FiltreAccueil
  onFilterFallback: () => void
}

export default function HomeRestaurantList({ activeFilter, onFilterFallback }: HomeRestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [fetchError, setFetchError] = useState(false)
  const { coords, status } = useGeolocation()

  const isProximity = activeFilter === FILTRE_ACCUEIL.A_PROXIMITE

  useEffect(() => {
    if (!isProximity || !coords) return

    setFetchError(false)
    fetch(`/api/restaurants/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=50000`)
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json() as Promise<{ restaurants: Restaurant[] }>
      })
      .then(({ restaurants }) => setRestaurants(restaurants))
      .catch(() => setFetchError(true))
  }, [isProximity, coords])

  // Géoloc denied/unavailable → fallback
  useEffect(() => {
    if (isProximity && (status === 'denied' || status === 'unavailable')) {
      onFilterFallback()
    }
  }, [isProximity, status, onFilterFallback])

  if (isProximity && (status === 'idle' || status === 'loading') && restaurants.length === 0) {
    return (
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
        {Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (isProximity && (status === 'denied' || status === 'unavailable')) {
    return (
      <div className="px-4 py-6 flex flex-col items-center gap-2 text-center">
        <MapPin size={28} className="text-michelin-gray" />
        <p className="text-michelin-black text-sm font-medium">Activez la géolocalisation</p>
        <p className="text-michelin-gray text-xs max-w-xs">
          Pour voir les restaurants à proximité, autorisez l'accès à votre position dans les paramètres du navigateur.
        </p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="px-4 py-4 text-michelin-gray text-xs text-center">
        Impossible de charger les restaurants à proximité.
      </div>
    )
  }

  if (!restaurants.length) return null

  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
      {restaurants.map((r) => (
        <HomeRestaurantCard key={r.id} restaurant={r} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
pnpm tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/components/HomeRestaurantList.tsx
git commit -m "feat(home): refactor HomeRestaurantList as client component with geolocation"
```

---

## Task 4 : Connecter `HomePage` et `page.tsx`

**Files:**
- Modify: `src/components/HomePage.tsx`
- Modify: `src/app/(main)/page.tsx`

- [ ] **Step 1 : Modifier `HomePage.tsx`**

Dans `src/components/HomePage.tsx` :

1. Supprimer la prop `restaurantList: React.ReactNode` de l'interface.
2. Importer `HomeRestaurantList` directement.
3. Passer `activeFilter` et `onFilterFallback` au composant.

Remplacer le début du fichier (imports + signature) :

```typescript
'use client'

import React, { useCallback, useState } from 'react'
import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import HomeRestaurantList from '@/components/HomeRestaurantList'
import { FILTRE_ACCUEIL, FiltreAccueil, ROUTES, UTILISATEUR } from '@/constants'
import { useAuth } from '@/context/AuthContext'

const FILTERS = Object.values(FILTRE_ACCUEIL)

// ... CircularProgress inchangé ...

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FiltreAccueil>(FILTRE_ACCUEIL.A_PROXIMITE)
  const { user, profile } = useAuth()

  const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? null
  const prenom = fullName?.split(' ')[0] ?? null

  const handleFilterFallback = useCallback(() => {
    setActiveFilter(FILTRE_ACCUEIL.ETOILES)
  }, [])
```

Remplacer la section `{/* Restaurant cards horizontal scroll */}` :

```tsx
{/* Restaurant cards horizontal scroll */}
<section className="mb-5">
  <HomeRestaurantList activeFilter={activeFilter} onFilterFallback={handleFilterFallback} />
</section>
```

Le composant complet final de `src/components/HomePage.tsx` :

```typescript
'use client'

import React, { useCallback, useState } from 'react'
import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import HomeRestaurantList from '@/components/HomeRestaurantList'
import { FILTRE_ACCUEIL, FiltreAccueil, ROUTES, UTILISATEUR } from '@/constants'
import { useAuth } from '@/context/AuthContext'

const FILTERS = Object.values(FILTRE_ACCUEIL)

function CircularProgress({ value }: Readonly<{ value: number }>) {
  const r = 26
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - value / 100)

  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg className="-rotate-90" width="64" height="64">
        <circle cx="32" cy="32" r={r} stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
        <circle
          cx="32" cy="32" r={r}
          stroke="white" strokeWidth="3" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-white text-xs font-bold">{value}%</span>
    </div>
  )
}

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FiltreAccueil>(FILTRE_ACCUEIL.A_PROXIMITE)
  const { user, profile } = useAuth()

  const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? null
  const prenom = fullName?.split(' ')[0] ?? null

  const handleFilterFallback = useCallback(() => {
    setActiveFilter(FILTRE_ACCUEIL.ETOILES)
  }, [])

  return (
    <div className="flex flex-col pb-20">
      <AppHeader />

      {/* Greeting */}
      <section className="px-4 pt-5 pb-4">
        <p className="text-michelin-gray text-sm">{prenom ? `Bonjour, ${prenom}` : 'Bonjour'}</p>
        <h1 className="text-michelin-black font-bold text-2xl leading-tight mt-0.5">
          Où dîne-t-on ce soir&nbsp;?
        </h1>
      </section>

      {/* Profile card */}
      <section className="px-4 mb-5">
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: '#1C0907' }}>
          <div>
            <p className="text-white/50 text-[10px] font-semibold tracking-widest uppercase mb-1">
              Votre profil
            </p>
            <p className="text-white font-bold text-base leading-tight">
              {UTILISATEUR.TYPE_PROFIL}
            </p>
            <Link href={ROUTES.PROFIL} className="text-white/60 text-xs mt-1 flex items-center gap-1 hover:text-white transition-colors">
              Affiner mon profil <ArrowRight size={11} />
            </Link>
          </div>
          <CircularProgress value={UTILISATEUR.MATCH} />
        </div>
      </section>

      {/* Filters */}
      <section className="mb-5">
        <div className="flex gap-2 overflow-x-auto px-4 scrollbar-none pb-1">
          {FILTERS.map((filter) => {
            const active = filter === activeFilter
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-michelin-black text-white border-michelin-black'
                    : 'bg-white text-michelin-black border-michelin-black/20 hover:border-michelin-black/50'
                }`}
              >
                {filter}
              </button>
            )
          })}
        </div>
      </section>

      {/* Section header */}
      <section className="px-4 mb-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-michelin-black font-bold text-base">Pour vous ce soir</h2>
          <Link href={ROUTES.RESTAURANTS} className="text-michelin-red text-sm font-medium hover:opacity-80">
            Tout voir
          </Link>
        </div>
        <p className="text-michelin-gray text-xs mt-0.5">12 restaurants qui vous correspondent</p>
      </section>

      {/* Restaurant cards horizontal scroll */}
      <section className="mb-5">
        <HomeRestaurantList activeFilter={activeFilter} onFilterFallback={handleFilterFallback} />
      </section>

      {/* Michelin selection banner */}
      <section className="mx-4">
        <Link
          href={ROUTES.RESTAURANTS}
          className="flex items-center justify-between rounded-xl px-4 py-4 bg-michelin-black text-white hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <Star size={14} fill="white" stroke="none" />
            <span className="text-sm font-medium">Sélection Michelin</span>
            <span className="text-white/50 text-sm">·</span>
            <span className="text-sm text-white/70">8 étoilés autour de vous</span>
          </div>
          <ArrowRight size={16} className="shrink-0" />
        </Link>
      </section>
    </div>
  )
}
```

- [ ] **Step 2 : Simplifier `src/app/(main)/page.tsx`**

Remplacer le contenu de `src/app/(main)/page.tsx` :

```typescript
import HomePage from '@/components/HomePage'
import PageTransition from '@/components/PageTransition'

export default function Home() {
  return (
    <PageTransition>
      <HomePage />
    </PageTransition>
  )
}
```

- [ ] **Step 3 : Vérifier TypeScript**

```bash
pnpm tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 4 : Tester manuellement**

Lancer `pnpm dev`, ouvrir `http://localhost:3000`.

Scénario A — géoloc accordée :
- Le filtre "À proximité" est actif par défaut
- Des skeletons apparaissent brièvement
- Les restaurants dans un rayon de 50 km s'affichent en carousel

Scénario B — géoloc refusée :
- Le message "Activez la géolocalisation" s'affiche brièvement
- Le filtre bascule automatiquement sur "★ Étoilés"

- [ ] **Step 5 : Commit**

```bash
git add src/components/HomePage.tsx src/app/'(main)'/page.tsx
git commit -m "feat(home): wire activeFilter and geolocation fallback into HomePage"
```

---

## Self-Review Checklist

- [x] Route API créée avec validation `lat/lng`
- [x] Fonction SQL `restaurants_nearby` définie avec `ST_DWithin`
- [x] Hook `useGeolocation` : cache localStorage + timeout 10s + fallback `denied`/`unavailable`
- [x] Skeleton pendant le chargement
- [x] Message géoloc refusée + fallback automatique vers Étoilés
- [x] Erreur fetch API gérée discrètement
- [x] `page.tsx` simplifié (plus de prop SSR)
- [x] Tous les types cohérents entre tasks (`GeolocationCoords`, `FiltreAccueil`, `Restaurant`)
