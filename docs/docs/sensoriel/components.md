---
id: components
title: Composants
---

# Composants du parcours sensoriel

Tous dans `src/components/sensoriel/`.

## `IntroScreen`

Écran d'accueil plein écran. Fond rouge foncé dégradé vers `#191919`. Affiche le titre "Quel gastronome êtes-vous ?" et un bouton CTA.

**Props :** `onStart: () => void`

## `SwiperScreen`

Pile de cartes swipables (style Tinder).

**Props :**
```ts
{
  restaurants: RestaurantForSwipe[],
  onComplete: (swipes: SwipeRecord[]) => void,
}
```

**Comportement :**
- Affiche jusqu'à 3 cartes empilées (effet de profondeur via `scale` et `y` framer-motion)
- Drag horizontal pour swiper : seuil à ±80px
- Boutons Like / Dislike / Pass
- Barre de progression en haut
- Appelle `onComplete` quand toutes les cartes sont épuisées

## `SwipeCard`

Carte individuelle dans la pile. Draggable via `useDragControls` framer-motion.

**Props :** `restaurant: RestaurantForSwipe`, position dans la pile (`index`)

Affiche : image principale, nom, cuisine, distinctions Michelin.

## `ResultScreen`

Affiche l'archétype détecté après le parcours.

**Props :**
```ts
{
  archetypeName: string,
  archetypeDescription: string,
  scorePct: number,
  topTags: string[],
  dimensionScores: DimensionScore[],
  onContinue: () => void,
  hasMatch: boolean,
}
```

Affiche :
- Nom et description de l'archétype
- Score en pourcentage
- Top 3 tags
- Barres animées de scores par dimension
- Bouton "Voir mon restaurant" (si `hasMatch`)

## `MatchScreen`

Affiche le restaurant recommandé.

**Props :**
```ts
{
  archetypeName: string,
  restaurant: MatchRestaurant | null,
  hasGeoloc: boolean,
  onRequestGeoloc: () => void,
}
```

Affiche :
- Image du restaurant
- Nom, ville, distinctions
- Distance (si géoloc disponible)
- Bouton pour activer la géolocalisation si non accordée
