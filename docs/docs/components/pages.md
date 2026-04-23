---
id: pages
title: Composants de page
---

# Composants de page

Dans `src/components/pages/`. Ce sont des Client Components qui encapsulent la logique de chaque page principale.

## `HomePage`

Page d'accueil principale.

**Affiche :**
- Message de bienvenue avec le prénom de l'utilisateur
- Carte de profil archétype avec cercle de progression
- Filtres horizontaux : À proximité, Étoilés, Bib Gourmand, Terrasse
- Liste de restaurants horizontale (`HomeRestaurantList`)

**Logique :** le filtre actif est passé à `HomeRestaurantList` qui fetchera l'endpoint correspondant.

## `SearchPage`

Interface de recherche. Champ texte + résultats en liste.

## `FavoritesPage`

Restaurants likés et visités par l'utilisateur. Deux onglets filtrables (Likés / Visités). Données issues de `user_swipes` et `user_visited_restaurants`.

## `ProfilePage`

Vue synthétique du profil utilisateur :
- Nom, prénom
- Archétype gustatif (lien vers `/profil/gastronomique`)
- Actions : paramètres, déconnexion
