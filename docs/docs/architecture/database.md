---
id: database
title: Base de données
---

# Base de données

L'application utilise **Supabase** (PostgreSQL) avec Row Level Security (RLS). Les types TypeScript sont auto-générés dans `src/types/supabase.ts`.

## Tables principales

### Utilisateurs

| Table | Description |
|-------|-------------|
| `profiles` | Profil étendu lié à `auth.users` — contient `nom`, `prenom`, `date_naissance`, `role` (`client` \| `chef` \| `admin`) |
| `notifications` | Notifications in-app pour les chefs (ex. statut de revendication) |

### Restaurants

| Table | Description |
|-------|-------------|
| `restaurants` | Fiche restaurant — nom, adresse, ville, description, `chef_id`, `published` |
| `restaurant_images` | Images associées à un restaurant (Supabase Storage) |
| `restaurant_traits` | Tags/traits associés à un restaurant (liaison `restaurant_id` + `trait_code`) |
| `michelin_awards` | Distinctions Michelin (étoiles, Bib Gourmand) par restaurant et année |
| `price_categories` | Catégorie de prix du restaurant |

### Revendications

| Table | Description |
|-------|-------------|
| `ownership_claims` | Demandes de propriété d'un restaurant — `chef_id`, `restaurant_id`, `status` (`pending` \| `accepted` \| `refused`) |
| `claim_documents` | Documents justificatifs uploadés dans `official_docs` (Supabase Storage) |
| `country_document_types` | Types de documents requis par pays |

### Contenu

| Table | Description |
|-------|-------------|
| `articles` | Articles rédigés par les chefs — `titre`, `contenu` (HTML TinyMCE), `slug`, `status` (`draft` \| `published`), `chef_id` |

### Parcours sensoriel

| Table | Description |
|-------|-------------|
| `reco_archetypes` | Archétypes gustatifs (ex. "L'Explorateur", "Le Gastronome") |
| `reco_archetype_weights` | Matrice de poids : `archetype_id` × `trait_code` → `weight` |
| `reco_traits` | Traits sensoriels avec leur libellé et dimension d'appartenance |
| `reco_dimensions` | Dimensions sensorielles (ex. D1 = diversité, D2 = produits...) |
| `swipe_sessions` | Sessions de swipe par utilisateur |
| `user_swipes` | Swipes individuels — `user_id`, `restaurant_id`, `liked` |
| `user_taste_profiles` | Profil gustatif final — `archetype_id`, `score_vector` (JSONB), `archetype_score` |
| `user_visited_restaurants` | Restaurants visités par un utilisateur |

### Vue

| Vue | Description |
|-----|-------------|
| `v_restaurant_reco` | Vue dénormalisée pour les recommandations — joint restaurants, traits, awards et images |

## RPCs Supabase

| Fonction | Description |
|----------|-------------|
| `restaurants_nearby(lat, lng, radius)` | Retourne les restaurants dans un rayon donné, triés par distance |

## Stockage (Supabase Storage)

| Bucket | Usage |
|--------|-------|
| `restaurant-images` | Photos des restaurants |
| `official_docs` | Documents justificatifs pour les revendications (accès privé, URLs présignées via AWS SDK S3) |
