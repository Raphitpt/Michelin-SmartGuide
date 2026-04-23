---
id: server-actions
title: Server Actions
---

# Server Actions

Les Server Actions Next.js remplacent les API routes pour toutes les mutations. Elles s'exécutent côté serveur, ont accès aux cookies de session, et retournent un état typé.

## Auth — `src/lib/auth/actions.ts`

| Action | Paramètres | Description |
|--------|-----------|-------------|
| `signInAction` | `email`, `password` | Connexion. Bloque les chefs avec claim non validée |
| `signUpAction` | `email`, `password`, `nom`, `prenom`, `date_naissance` | Inscription client |
| `signUpRestaurantAction` | `email`, `password`, `nom`, `job_title` | Inscription chef |
| `completeRestaurantRegistrationAction` | FormData (compte + documents) | Compte chef + upload justificatifs en une passe |
| `submitClaimAction` | `restaurantId`, documents | Crée une `ownership_claims` + upload dans `official_docs` |
| `uploadMissingDocsAction` | `claimId`, documents | Resoumission de documents refusés |
| `searchRestaurantsAction` | `query` | Autocomplete restaurant pour le formulaire de claim |
| `getClaimStatusAction` | — | Statut de la dernière claim du chef connecté |
| `markClaimNotificationReadAction` | `notificationId` | Marque une notification comme lue |
| `forgotPasswordAction` | `email` | Envoi d'email de reset |
| `signOutAction` | — | Déconnexion + redirect `/login` |

## Articles — `src/lib/articles/actions.ts`

Toutes ces actions vérifient que `role === "chef"`.

| Action | Description |
|--------|-------------|
| `createArticleAction` | Crée un article (slug auto-généré avec timestamp) |
| `updateArticleAction` | Met à jour titre, contenu, statut |
| `deleteArticleAction` | Supprime un article |
| `getMyArticles` | Liste les articles du chef connecté |
| `getArticleById` | Récupère un article pour l'édition |

## Admin — `src/lib/admin/actions.ts`

| Action | Description |
|--------|-------------|
| `listClaimsAction` | Liste toutes les claims (filtrables par status) |
| `getClaimDetailAction` | Détail d'une claim avec documents |
| `updateClaimStatusAction` | Approve/refuse une claim. Si acceptée : lie le `chef_id` au restaurant + envoie une notification |
| `getAdminKpisAction` | KPIs du dashboard (comptes, restaurants, claims en attente) |
| `updateDocumentStatusAction` | Valide ou refuse un document individuel |
| `getDocumentPresignedUrlAction` | Génère une URL présignée S3 pour visualiser un document privé |

## Parcours sensoriel — `src/lib/sensoriel/actions.ts`

| Action | Description |
|--------|-------------|
| `createSwipeSession` | Crée une `swipe_sessions` pour l'utilisateur |
| `saveSwipe` | Upsert d'un `user_swipes` |
| `saveTasteProfile` | Complète la session et upsert `user_taste_profiles` |
| `updateTasteProfileFromSwipe` | Mise à jour incrémentale du profil (like/visite dans l'app) |
