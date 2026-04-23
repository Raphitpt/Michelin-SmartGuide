---
id: intro
title: Introduction
slug: /
---

# Michelin SmartGuide

Application mobile-first de découverte gastronomique construite avec **Next.js 16 App Router**, **Supabase** et **Tailwind CSS v4**.

## Concept

Michelin SmartGuide propose une expérience de recommandation personnalisée basée sur un **parcours sensoriel** — une série de swipes sur des restaurants permettant de construire un profil gustatif (archétype). À partir de ce profil, l'application recommande des restaurants adaptés à l'utilisateur.

## Stack technique

| Couche | Technologie |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Animations | Framer Motion 12 |
| Base de données | Supabase (PostgreSQL + Auth + Storage) |
| IA | OpenAI GPT-4o-mini + Google Vertex AI Search |
| Déploiement | Docker (standalone Next.js) |
| Langage | TypeScript 5 |

## Rôles utilisateurs

Il existe trois rôles dans l'application :

- **client** — utilisateur standard, accède aux recommandations et au parcours sensoriel
- **chef** — propriétaire de restaurant, gère sa fiche et ses articles
- **admin** — modère les demandes de revendication de restaurant

## Onboarding obligatoire

Tout utilisateur `client` sans profil gustatif est automatiquement redirigé vers le **parcours sensoriel** avant de pouvoir accéder à l'application. Cette logique est gérée dans le middleware (`src/proxy.ts`).
