// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  ACCUEIL:      '/',
  RECHERCHE:    '/recherche',
  FAVORIS:      '/favoris',
  PROFIL:       '/profil',
  RESTAURANTS:  '/restaurants',
  CARTE:        '/carte',
  HISTORIQUE:   '/historique',
  PROFIL_GASTRO:        '/profil/gastronomique',
  PROFIL_NOTIFICATIONS: '/profil/notifications',
  PROFIL_PARAMETRES:    '/profil/parametres',
  LOGIN:            '/login',
  LOGIN_CLIENT:     '/login/client',
  LOGIN_RESTAURANT: '/login/restaurant',
  LOGIN_REGISTER:   '/login/register',
} as const

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_LABELS = {
  ACCUEIL:   'Accueil',
  RECHERCHE: 'Recherche',
  FAVORIS:   'Favoris',
  PROFIL:    'Profil',
} as const

export const HEADER_NAV_LABELS = {
  RESTAURANTS:      'Restaurants',
  HEBERGEMENTS:     'Hébergements',
  GUIDES_DE_VOYAGE: 'Guides de voyage',
  MAGAZINE:         'Magazine',
  MES_LISTES:       'Mes listes',
} as const

// ─── Tags restaurant ──────────────────────────────────────────────────────────

export const TAG = {
  A_ESSAYER: 'À essayer',
  VISITE:    'Visité',
} as const

export type TagValue = typeof TAG[keyof typeof TAG]

// ─── Filtres ──────────────────────────────────────────────────────────────────

export const FILTRE_FAVORIS = {
  TOUS:      'Tous',
  A_ESSAYER: 'À essayer',
  VISITES:   'Visités',
} as const

export type FiltreFavoris = typeof FILTRE_FAVORIS[keyof typeof FILTRE_FAVORIS]

export const FILTRE_ACCUEIL = {
  A_PROXIMITE:  'À proximité',
  ETOILES:      '★ Étoilés',
  BIB_GOURMAND: 'Bib Gourmand',
  TERRASSE:     'Terrasse',
} as const

export type FiltreAccueil = typeof FILTRE_ACCUEIL[keyof typeof FILTRE_ACCUEIL]

// ─── Profil utilisateur ───────────────────────────────────────────────────────

export const UTILISATEUR = {
  NOM:           'Raphaël Tiphonet',
  INITIALES:     'RT',
  TYPE_PROFIL:   "L'Explorateur Sensoriel",
  MEMBRE_DEPUIS: 'Membre depuis avril 2026',
  MATCH:         94,
} as const

// ─── Recherches populaires ────────────────────────────────────────────────────

export const RECHERCHES_POPULAIRES = [
  'Omakase',
  'Bistrot parisien',
  'Pâtisserie',
  'Végétarien',
  'Brunch',
  'Terrasse',
] as const
