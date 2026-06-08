/**
 * Configuration centrale du site pour le SEO.
 * L'URL peut être surchargée via NEXT_PUBLIC_SITE_URL (ex. sur Vercel) ;
 * par défaut on pointe sur le domaine de production.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://trouvetaraquette.com'
).replace(/\/$/, '')

export const SITE_NAME = 'TrouveTaRaquette'

export const SITE_DESCRIPTION =
  'Trouve ta raquette de padel, badminton, ping-pong et ton cordage tennis en 2 minutes. Moteur de recommandation à règles, 100 % transparent, indépendant et gratuit.'

/** Modules indexables (sert au sitemap et aux fils d'Ariane). */
export const MODULES = [
  { path: '/tennis',    name: 'Cordage Tennis' },
  { path: '/padel',     name: 'Raquette Padel' },
  { path: '/badminton', name: 'Raquette Badminton' },
  { path: '/ping-pong', name: 'Raquette Ping-Pong' },
] as const

export const absoluteUrl = (path = '') => `${SITE_URL}${path}`
