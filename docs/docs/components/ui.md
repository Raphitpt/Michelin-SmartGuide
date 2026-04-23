---
id: ui
title: Composants UI partagés
---

# Composants UI partagés

Dans `src/components/ui/`.

## `BottomNav`

Navigation fixe en bas de l'écran pour le groupe `(main)`. 5 onglets : Accueil, Articles, Recherche, Favoris, Profil.

- Utilise `framer-motion` `layoutId` pour animer l'indicateur d'onglet actif
- Affiche un 6ème item "Dashboard" pour les admins

## `AppHeader` / `Header`

Barre supérieure. `AppHeader` est utilisé sur les pages principales, `Header` sur certaines pages secondaires.

## `BackButton`

Bouton retour générique. Utilise `router.back()`.

## `RestaurantCard`

Carte de restaurant pour les listes :
- Image principale
- Nom, ville
- Étoiles Michelin (via `MichelinStar`)
- Bib Gourmand badge

## `MichelinStar`

Affiche les étoiles Michelin sous forme d'icônes. Prop : `count: number`.

## `ImageSlider`

Carousel d'images animé (framer-motion, transitions slide). Utilisé dans `RestaurantDetailContent`.

## `PageTransition`

Wrapper d'animation pour les transitions de pages. Utilise la variante `pageTransition` de `src/lib/motion.ts`.

## Variantes d'animation — `src/lib/motion.ts`

Presets framer-motion réutilisables dans toute l'app :

| Export | Usage |
|--------|-------|
| `pageTransition` | Transition fade/slide pour les changements de page |
| `fadeSlideUp` | Apparition de bas en haut (cards, textes) |
| `fadeSlideUpCard` | Variante card légèrement plus lente |
| `staggerContainer` | Conteneur avec enfants décalés dans le temps |
| `staggerContainerDetail` | Variante pour les pages de détail |
| `slideImageVariants` | Slide horizontal pour l'`ImageSlider` |
| `slideImageTransition` | Configuration de transition de l'`ImageSlider` |
