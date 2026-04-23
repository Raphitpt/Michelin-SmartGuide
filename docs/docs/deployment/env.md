---
id: env
title: Variables d'environnement
---

# Variables d'environnement

Créer un fichier `.env.local` à la racine du projet.

## Supabase

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé anon/public Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (backend uniquement, bypass RLS) |

## Stockage S3 (Supabase Storage)

Utilisé pour générer des URLs présignées pour les documents justificatifs (accès admin).

| Variable | Description |
|----------|-------------|
| `S3_ACCESS_KEY_ID` | Access key ID compatible S3 |
| `S3_SECRET_ACCESS_KEY` | Secret access key |

## IA

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Clé OpenAI (GPT-4o-mini pour l'analyse de restaurant) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Chemin vers le fichier JSON de service account GCP |
| `VERTEX_PROJECT_ID` | ID du projet Google Cloud |
| `VERTEX_ENGINE_ID` | ID du moteur Vertex AI Search |

## Application

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | URL publique de l'application (ex. `https://smartguide.michelin.com`) |

:::caution
Ne jamais commiter `.env.local`. `SUPABASE_SERVICE_ROLE_KEY` et `OPENAI_API_KEY` sont des secrets serveur — ne pas les préfixer avec `NEXT_PUBLIC_`.
:::
