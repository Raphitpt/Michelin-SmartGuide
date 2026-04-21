# Framer Motion Animations — Design Spec

**Date:** 2026-04-21  
**Style:** Fluide et élégant (premium Michelin)  
**Scope:** Page transitions + micro-animations composants

---

## 1. Installation

Ajouter `framer-motion` aux dépendances du projet.

---

## 2. Page Transitions (slide horizontal)

**Fichier modifié:** `src/app/(main)/layout.tsx`

Le layout doit devenir un Client Component pour accéder à `usePathname()`. On wrappe `{children}` dans un `AnimatePresence` + `motion.div` dont la clé change à chaque route.

**Variants:**
```
initial:  { x: 60, opacity: 0 }
animate:  { x: 0, opacity: 1 }
exit:     { x: -60, opacity: 0 }
duration: 0.3s, ease: easeInOut
```

`AnimatePresence mode="wait"` pour attendre la fin de l'exit avant d'animer l'entrée.

---

## 3. ImageSlider — Slide animé entre images

**Fichier modifié:** `src/components/ImageSlider.tsx`

Remplacer le changement d'index brut par `AnimatePresence` avec une direction calculée (next → slide depuis la droite, prev → slide depuis la gauche).

**Pattern:**
- State `direction: 1 | -1` mis à jour dans `next()` / `prev()`
- `variants` avec `custom={direction}` pour `initial`, `animate`, `exit`
- `initial: { x: direction * 100% }` → `animate: { x: 0 }` → `exit: { x: direction * -100% }`
- `duration: 0.25s, ease: easeInOut`

---

## 4. SearchPage — Stagger sur les résultats

**Fichier modifié:** `src/components/SearchPage.tsx`

Quand les résultats apparaissent, chaque item fait un fade + slide up en cascade.

**Pattern:**
- Wrapper `motion.div` avec `variants` de type `container` (`staggerChildren: 0.05s`)
- Chaque `Link` de résultat devient `motion(Link)` ou wrappé dans `motion.div` avec variant `item`
- `item: { hidden: { y: 12, opacity: 0 }, visible: { y: 0, opacity: 1 } }`
- Keyer la liste sur `query` pour re-déclencher l'animation à chaque nouvelle recherche

---

## 5. RestaurantDetailPage — Entrée en cascade

**Fichier modifié:** `src/components/RestaurantDetailPage.tsx`

Ce composant est un Server Component — on ne peut pas y utiliser Framer Motion directement. On crée un nouveau Client Component `RestaurantDetailContent.tsx` qui reçoit les données via props et gère les animations.

**Sections animées (stagger 0.08s entre chaque) :**
1. Badge Michelin (étoiles)
2. Titre + sous-titre
3. Description
4. Rows d'info (Clock, Shirt, Phone)

**Variant:** `{ hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 }, duration: 0.4s }`

---

## 6. BottomNav — Indicateur actif animé

**Fichier modifié:** `src/components/BottomNav.tsx`

Remplacer le `<div className="w-5 h-0.5 bg-michelin-black rounded-full" />` conditionnel par un `<motion.div layoutId="nav-indicator">` qui fait un spring transition entre les onglets actifs.

**Spring:** `stiffness: 300, damping: 30`

---

## 7. RestaurantCard — Fade + slide up à l'entrée

**Fichier modifié:** `src/components/RestaurantCard.tsx`

Wrapper la card dans `motion.div` avec `whileInView` pour animer à l'entrée dans le viewport (adapté aux listes scrollables).

**Variant:** `{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }, duration: 0.35s, once: true }`

---

## 8. Fichier de variants partagés

Créer `src/lib/motion.ts` avec les variants réutilisables :
- `fadeSlideUp` — utilisé par cards, sections de détail
- `staggerContainer` — utilisé par listes de résultats
- `pageTransition` — utilisé par le layout
- `slideImage` — utilisé par ImageSlider

---

## Ordre d'implémentation

1. Installer framer-motion
2. Créer `src/lib/motion.ts` (variants partagés)
3. Modifier `layout.tsx` (page transitions)
4. Modifier `ImageSlider.tsx`
5. Modifier `SearchPage.tsx`
6. Créer `RestaurantDetailContent.tsx` + adapter `RestaurantDetailPage.tsx`
7. Modifier `BottomNav.tsx`
8. Modifier `RestaurantCard.tsx`
