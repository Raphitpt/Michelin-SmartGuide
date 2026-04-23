---
id: admin
title: Composants admin
---

# Composants admin

Dans `src/components/admin/`.

## Accès

Le layout `src/app/(admin)/layout.tsx` vérifie côté serveur que `role === "admin"`. Tout non-admin est redirigé avant tout rendu de composant enfant.

## `AdminNav`

Barre de navigation du back-office. Liens : Dashboard, Revendications.

## `ClaimsClient`

Interface principale de modération des revendications de restaurant.

**Fonctionnalités :**
- Filtre par statut (`pending` / `accepted` / `refused`)
- Affichage des informations du chef demandeur
- Visionneuse de documents justificatifs (URLs présignées via `getDocumentPresignedUrlAction`)
- Boutons Approuver / Refuser

**Quand une claim est approuvée :**
1. `updateClaimStatusAction` passe le statut à `accepted`
2. Le `chef_id` est lié au restaurant
3. Une notification est créée pour le chef

## Dashboard admin (`/admin`)

KPIs récupérés via `getAdminKpisAction` :
- Nombre d'utilisateurs total
- Nombre de chefs
- Nombre d'articles publiés
- Nombre de restaurants
- Nombre de claims en attente

## Formulaire restaurant avec IA (`/form-restaurant`)

Dans `src/components/formRestaurant/`.

Le pipeline d'analyse (`analyse.ts`) enchaîne :
1. **Google Vertex AI Search** — récupère du contexte sur le restaurant
2. **OpenAI GPT-4o-mini** — rank les traits sensoriels par dimension à partir du contexte

Le résultat pré-remplit les tags du formulaire de création de fiche restaurant.
