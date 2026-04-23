---
id: scoring
title: Algorithme de scoring
---

# Algorithme de scoring

Le scoring est entièrement côté client, dans `src/lib/sensoriel/scoring.ts`. Aucun appel réseau.

## 1. Vecteur de scores — `buildScoreVector(swipes)`

Chaque restaurant possède des `traitCodes`. Pour chaque swipe :
- **Like** → `+1` sur chaque trait du restaurant
- **Dislike** → `-0.5` sur chaque trait

```ts
// Résultat : Record<traitCode, number>
{ "IODE": 2, "EPICE": 1.5, "NATUREL": -0.5, ... }
```

## 2. Scores par archétype — `computeArchetypeScores(vector, weights)`

La matrice `weights` associe chaque archétype à un poids par trait (`reco_archetype_weights`).

```
score(archétype) = Σ vector[trait] × weight[archétype][trait]
```

## 3. Sélection du meilleur archétype — `pickBestArchetype(scores, archetypes)`

Sélectionne l'archétype avec le score le plus élevé. Normalise en pourcentage (0–100%) par rapport au score maximal théorique.

Retourne `{ archetype, scorePct }`.

## 4. Top tags — `getTopTags(vector, traitLabels, topN)`

Filtre les traits avec un score positif, les trie par valeur décroissante, retourne les `topN` libellés.

## 5. Scores par dimension

Pour l'affichage dans `ResultScreen`, les scores de traits sont agrégés par dimension (`reco_dimensions`) :

```ts
rawDimScores[dimId] += score   // pour chaque trait positif
```

Puis normalisés 0–100 par rapport au score de dimension maximum.

## Mise à jour incrémentale du profil

À chaque interaction (like/visite dans l'app principale), `updateTasteProfileFromSwipe` est appelé :
- Like → `+2` sur les traits du restaurant
- Dislike → `-1` sur les traits

Cela recalcule l'archétype dominant en temps réel sans refaire le parcours complet.
