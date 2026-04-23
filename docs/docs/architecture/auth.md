---
id: auth
title: Authentification
---

# Authentification

L'auth est gérée par **Supabase Auth** avec des clients cookie-based pour le SSR (`@supabase/ssr`).

## Contexte React — `useAuth()`

`src/context/AuthContext.tsx` expose via `useAuth()` :

```ts
{
  user: User | null,
  session: Session | null,
  profile: Profile | null,   // row de la table `profiles`
  role: 'client' | 'chef' | 'admin' | null,
  loading: boolean,
}
```

Le contexte s'abonne à `supabase.auth.onAuthStateChange` et appelle `router.refresh()` à chaque changement pour resynchroniser les Server Components.

## Flux d'authentification

### Client (utilisateur standard)

1. `/login/client` — email + mot de passe
2. Server Action `signInAction` — vérifie que le compte n'est pas un chef bloqué
3. Redirection vers `/` (ou `/parcours-sensoriel` si pas de profil gustatif)

### Chef (propriétaire de restaurant)

Le flux chef est en deux étapes :

1. **Création de compte** (`/login/restaurant`) — `signUpRestaurantAction` crée le compte avec `role = "chef"`
2. **Revendication** — le chef cherche son restaurant et soumet des documents justificatifs via `submitClaimAction`
3. **Vérification admin** — l'admin approuve ou refuse depuis `/admin/revendications`
4. **Connexion** — `signInAction` bloque les chefs dont la claim n'est pas `accepted`

### Réinitialisation de mot de passe

1. `/login/forgot` → `forgotPasswordAction` envoie un email Supabase
2. Lien email → `/auth/callback` (échange PKCE) → redirect `/auth/reset-password`

## Server Actions d'auth

Définies dans `src/lib/auth/actions.ts` :

| Action | Description |
|--------|-------------|
| `signInAction` | Connexion email/mot de passe, bloque les chefs non validés |
| `signUpAction` | Inscription client (nom, prénom, date_naissance) |
| `signUpRestaurantAction` | Inscription chef (nom, job_title) |
| `completeRestaurantRegistrationAction` | Création de compte + upload de documents en une seule soumission |
| `submitClaimAction` | Crée une `ownership_claims` + upload dans `official_docs` |
| `uploadMissingDocsAction` | Resoumission de documents refusés |
| `forgotPasswordAction` | Envoie un email de reset |
| `signOutAction` | Déconnecte et redirige vers `/login` |

## Validation — Zod

Tous les formulaires d'auth sont validés avec des schémas Zod définis dans `src/lib/auth/schemas.ts`. Chaque Server Action retourne un état typé (`SignInState`, `SignUpState`, etc.) avec les erreurs de validation.

## Protection des routes

| Mécanisme | Où | Ce qu'il protège |
|-----------|-----|-----------------|
| Middleware (`proxy.ts`) | Toutes les requêtes | Redirige vers `/parcours-sensoriel` si pas de profil gustatif |
| Layout `(admin)` | Server Component | Redirige les non-admins avant tout rendu |
| `signInAction` | Server Action | Bloque la connexion des chefs non validés |
