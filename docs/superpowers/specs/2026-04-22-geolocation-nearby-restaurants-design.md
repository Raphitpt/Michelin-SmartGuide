# Géolocalisation et restaurants à proximité

**Date:** 2026-04-22  
**Scope:** Page d'accueil — filtre "À proximité"

## Contexte

La page d'accueil (`/`) affiche un carousel de restaurants (`HomeRestaurantList`). Le filtre "À proximité" est déjà présent dans l'UI mais non fonctionnel. La table `restaurants` Supabase possède une colonne `location` (geography PostGIS) ainsi que `lat` et `lng`.

## Comportement attendu

- Au chargement, si le filtre actif est "À proximité" (défaut), on demande la géolocalisation au navigateur.
- La position est stockée dans `localStorage` et mise à jour à chaque visite.
- Si la géoloc est refusée ou indisponible : afficher un message d'invitation à activer la géoloc, puis basculer automatiquement sur le filtre "★ Étoilés".
- Les autres filtres (Étoilés, Bib Gourmand, Terrasse) ne dépendent pas de la géoloc — ils sont filtrés selon l'archétype utilisateur (logique existante ou future).
- Rayon : 50 km.

## Architecture

### 1. Route API — `GET /api/restaurants/nearby`

Paramètres query : `lat`, `lng`, `radius` (défaut 50000 mètres).

Exécute une requête PostGIS via `createAdminClient` :

```sql
SELECT *, ST_Distance(location, ST_MakePoint(lng, lat)::geography) AS distance
FROM restaurants
WHERE is_published = true
  AND main_image IS NOT NULL
  AND ST_DWithin(location, ST_MakePoint(lng, lat)::geography, radius)
ORDER BY distance
LIMIT 20
```

Retourne un JSON `{ restaurants: Restaurant[] }`.

### 2. Hook `useGeolocation`

Client-side hook responsable de :
- Lire la position depuis `localStorage` au montage
- Déclencher `navigator.geolocation.getCurrentPosition` pour obtenir une position fraîche
- Mettre à jour `localStorage` avec la nouvelle position
- Exposer `{ coords, status }` où `status` est `'idle' | 'loading' | 'success' | 'denied' | 'unavailable'`

### 3. `HomeRestaurantList` → Client Component

Refactoré en Client Component. Reçoit `activeFilter` en prop depuis `HomePage`.

Quand `activeFilter === 'À proximité'` :
- Utilise `useGeolocation`
- Si `status === 'success'` : appelle `/api/restaurants/nearby?lat=&lng=&radius=50000`
- Si `status === 'denied' | 'unavailable'` : affiche un message + callback `onFilterFallback` vers `HomePage` pour basculer sur "★ Étoilés"
- Si `status === 'loading'` : affiche un skeleton

Quand `activeFilter !== 'À proximité'` : affiche les restaurants selon le filtre actif (logique existante, non modifiée dans ce scope).

### 4. `HomePage` — ajout du callback

Passe `activeFilter` à `HomeRestaurantList` et gère le `onFilterFallback` pour changer le filtre actif.

## Gestion des erreurs

- Timeout géoloc (>10s) → traité comme `denied`
- Erreur fetch API → afficher message d'erreur discret, ne pas crasher

## Ce qui n'est pas dans le scope

- Filtres Étoilés / Bib Gourmand / Terrasse (archétype)
- Paramètre de rayon configurable par l'utilisateur
