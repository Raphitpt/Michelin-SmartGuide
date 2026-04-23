---
id: routes
title: Routes & Pages
---

# Routes & Pages

## Groupe `(main)` — Shell principal

Layout : `bg-michelin-cream` + `BottomNav` fixe en bas.

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Accueil — profil archétype, filtres, liste de restaurants recommandés |
| `/recherche` | `SearchPage` | Recherche de restaurants |
| `/favoris` | `FavoritesPage` | Restaurants likés et visités, filtrables |
| `/profil` | `ProfilePage` | Profil utilisateur |
| `/profil/gastronomique` | _(inline)_ | Visualisation détaillée du profil gustatif avec barres animées par dimension |
| `/profil/parametres` | _(inline)_ | Paramètres du compte |
| `/restaurants/[id]` | `RestaurantDetailPage` | Détail d'un restaurant (Server Component) |
| `/articles` | _(inline)_ | Liste publique des articles |
| `/articles/[slug]` | _(inline)_ | Article en lecture |
| `/form-restaurant` | `formClient` | Soumission d'un restaurant (IA-assistée) |
| `/chef/restaurant` | _(inline)_ | Gestion de la fiche restaurant (chef) |
| `/chef/articles` | _(inline)_ | Liste des articles du chef |
| `/chef/articles/new` | `ArticleEditor` | Création d'article (TinyMCE) |
| `/chef/articles/[id]/edit` | `ArticleEditor` | Édition d'article |

## Groupe `(auth)` — Authentification

| Route | Description |
|-------|-------------|
| `/login` | Point d'entrée — choix client ou restaurant |
| `/login/client` | Connexion / inscription client |
| `/login/register` | Inscription client (nom, prénom, date de naissance) |
| `/login/forgot` | Demande de réinitialisation de mot de passe |
| `/login/restaurant` | Début du flux chef (création de compte + revendication) |
| `/login/restaurant/verify` | Attente de vérification email |
| `/login/restaurant/status` | Statut de la demande de revendication (pending/accepted/missing docs) |

## Groupe `(sensoriel)` — Parcours sensoriel

Layout : fond `#191919`, plein écran, sans navigation.

| Route | Description |
|-------|-------------|
| `/parcours-sensoriel` | Parcours complet : intro → swipe → résultat → match |

## Groupe `(admin)` — Back-office

Accès restreint aux utilisateurs avec `role = "admin"` (vérifié côté serveur dans le layout).

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard KPIs (users, chefs, articles, restaurants, claims en attente) |
| `/admin/revendications` | Gestion des revendications de propriété (review/approve/reject) |

## Routes API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/restaurants/nearby` | Restaurants à proximité via RPC Supabase. Params : `lat`, `lng`, `radius` |
| `GET` | `/api/restaurants/recommended` | Restaurants scorés par archétype. Params : `userId`, `filter` (`A_PROXIMITE` \| `ETOILES` \| `BIB_GOURMAND` \| `TERRASSE`) |
| `GET` | `/auth/callback` | Handler OAuth/email Supabase (PKCE) |
