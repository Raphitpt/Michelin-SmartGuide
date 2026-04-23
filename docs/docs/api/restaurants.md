---
id: restaurants
title: API Restaurants
---

# API Restaurants

## `GET /api/restaurants/nearby`

Retourne les restaurants dans un rayon donné autour d'une position GPS.

### Paramètres

| Param | Type | Description |
|-------|------|-------------|
| `lat` | `number` | Latitude |
| `lng` | `number` | Longitude |
| `radius` | `number` | Rayon en mètres (défaut : 5000) |

### Réponse

```json
[
  {
    "id": "uuid",
    "nom": "Le Grand Véfour",
    "ville": "Paris",
    "distance_m": 1240,
    "images": [...],
    "michelin_awards": [...]
  }
]
```

Utilise la RPC Supabase `restaurants_nearby` via le client admin (bypass RLS).

---

## `GET /api/restaurants/recommended`

Retourne des restaurants scorés par l'archétype de l'utilisateur.

### Paramètres

| Param | Type | Description |
|-------|------|-------------|
| `userId` | `string` | ID de l'utilisateur (pour récupérer son archétype) |
| `filter` | `string` | `A_PROXIMITE` \| `ETOILES` \| `BIB_GOURMAND` \| `TERRASSE` |

### Comportement selon le filtre

| Filtre | Logique |
|--------|---------|
| `A_PROXIMITE` | Appelle `/api/restaurants/nearby` puis score par archétype |
| `ETOILES` | Filtre `michelin_awards.type = 'ETOILE'` |
| `BIB_GOURMAND` | Filtre `michelin_awards.type = 'BIB_GOURMAND'` |
| `TERRASSE` | Filtre sur le tag `TERRASSE` dans `restaurant_traits` |

### Réponse

```json
[
  {
    "id": "uuid",
    "nom": "Septime",
    "score": 87.4,
    "images": [...],
    "michelin_awards": [...]
  }
]
```

---

## `GET /auth/callback`

Handler de callback Supabase Auth (PKCE). Échange le code OAuth contre une session.

- Si `type = recovery` → redirige vers `/auth/reset-password`
- Sinon → redirige vers `/`
