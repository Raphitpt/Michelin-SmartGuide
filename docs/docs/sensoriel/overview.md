---
id: overview
title: Vue d'ensemble
---

# Parcours sensoriel

Le parcours sensoriel est le cœur de l'application. Il permet de construire un **profil gustatif** personnalisé à partir d'une série de swipes sur des restaurants.

## Étapes

```
intro → swipe → [chargement] → result → match
```

| Étape | Composant | Description |
|-------|-----------|-------------|
| `intro` | `IntroScreen` | Écran de bienvenue, CTA "Commencer" |
| `swipe` | `SwiperScreen` | Pile de cartes restaurant à swiper (like/dislike/pass) |
| `loading` | _(inline)_ | Spinner pendant l'analyse du profil |
| `result` | `ResultScreen` | Archétype détecté, score, top tags, scores par dimension |
| `match` | `MatchScreen` | Restaurant recommandé, géolocalisation optionnelle |

## Orchestration

Tout le state machine est géré dans `src/app/(sensoriel)/parcours-sensoriel/page.tsx`.

### `handleStart()`

Crée une `swipe_sessions` en base, passe en étape `swipe`.

### `handleComplete(swipes)`

Déclenché quand l'utilisateur a terminé tous les swipes.

1. Affiche l'écran de chargement (`isLoadingResult = true`)
2. `fetchArchetypesAndWeights()` — charge la matrice de poids depuis Supabase
3. `buildScoreVector(swipes)` — construit le vecteur de scores par trait
4. `computeArchetypeScores(vector, weights)` — calcule le score de chaque archétype
5. `pickBestArchetype(scores, archetypes)` — sélectionne le meilleur
6. `getTopTags(vector, traitLabels, 3)` — extrait les 3 meilleurs tags
7. Sauvegarde en base : swipes individuels + `user_taste_profiles`
8. Passe en étape `result`

### `handleGoToMatch()`

1. Tente la géolocalisation (timeout 3s)
2. `fetchMatchRestaurant(archetypeId, coords?)` — trouve le restaurant le plus adapté
3. Passe en étape `match`

## Données chargées au démarrage

Au montage du composant, `fetchRestaurantsForSwipe()` charge jusqu'à 15 restaurants publiés avec des traits, mélangés aléatoirement.
