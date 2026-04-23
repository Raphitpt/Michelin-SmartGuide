---
id: restaurant
title: Composants restaurant
---

# Composants restaurant

Dans `src/components/restaurant/`.

## `HomeRestaurantList`

Liste de restaurants défilable horizontalement, utilisée sur la home.

- Fetch via `/api/restaurants/recommended` ou `/api/restaurants/nearby` selon le filtre actif
- Re-fetch à chaque changement de filtre
- Intègre `useGeolocation` pour le filtre `A_PROXIMITE`

**Props :** `filter: FiltreAccueil`, `userId: string`

## `RestaurantList`

Variante verticale de la liste. Utilisée sur la page recherche et favoris.

## `RestaurantDetailPage`

**Server Component.** Récupère en SSR :
- Données complètes du restaurant
- Traits associés
- Images
- Distinctions Michelin

Passe tout à `RestaurantDetailContent` pour le rendu client.

## `RestaurantDetailContent`

**Client Component.** Rendu complet d'une fiche restaurant :
- `ImageSlider` avec les photos
- Nom, ville, prix
- Distinctions Michelin
- Tags/traits
- Boutons Like et Visité (via `useRestaurantActions`)

## Hook `useRestaurantActions`

`src/hooks/useRestaurantActions.ts`

```ts
const { liked, visited, toggleLike, toggleVisited, rateVisit } =
  useRestaurantActions(userId, restaurantId)
```

- `toggleLike` : crée ou met à jour un `user_swipes`
- `toggleVisited` : crée ou met à jour un `user_visited_restaurants`
- `rateVisit` : appelle `updateTasteProfileFromSwipe` (mise à jour incrémentale du profil)
