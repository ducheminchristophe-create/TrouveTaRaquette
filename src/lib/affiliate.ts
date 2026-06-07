/**
 * affiliate.ts — Helper centralisé pour les liens sortants.
 *
 * Pour activer le tracking affilié :
 *   1. Ajoute les paramètres par marchand dans MERCHANT_PARAMS
 *   2. Configure les variables d'env correspondantes dans .env.local (jamais en dur ici)
 *
 * Usage :
 *   import { buildAffiliateUrl } from '@/src/lib/affiliate'
 *   <a href={buildAffiliateUrl(productUrl)} rel="sponsored noopener" target="_blank">
 */

/** Paramètres de tracking par domaine (injectés depuis les variables d'env) */
const MERCHANT_PARAMS: Record<string, Record<string, string>> = {
  'decathlon.fr': {
    ...(process.env.NEXT_PUBLIC_AFF_DECATHLON
      ? { affid: process.env.NEXT_PUBLIC_AFF_DECATHLON }
      : {}),
  },
  'decathlon.be': {
    ...(process.env.NEXT_PUBLIC_AFF_DECATHLON
      ? { affid: process.env.NEXT_PUBLIC_AFF_DECATHLON }
      : {}),
  },
  'amazon.fr': {
    ...(process.env.NEXT_PUBLIC_AFF_AMAZON
      ? { tag: process.env.NEXT_PUBLIC_AFF_AMAZON }
      : {}),
  },
  'tradeinn.com': {
    ...(process.env.NEXT_PUBLIC_AFF_TRADEINN
      ? { aid: process.env.NEXT_PUBLIC_AFF_TRADEINN }
      : {}),
  },
  'smashinn.com': {
    ...(process.env.NEXT_PUBLIC_AFF_TRADEINN
      ? { aid: process.env.NEXT_PUBLIC_AFF_TRADEINN }
      : {}),
  },
  'padelnuestro.com': {
    ...(process.env.NEXT_PUBLIC_AFF_PADELNUESTRO
      ? { affid: process.env.NEXT_PUBLIC_AFF_PADELNUESTRO }
      : {}),
  },
  'badmintonplanet.eu': {
    ...(process.env.NEXT_PUBLIC_AFF_BADMINTONPLANET
      ? { ref: process.env.NEXT_PUBLIC_AFF_BADMINTONPLANET }
      : {}),
  },
  'badminton-shop.com': {
    ...(process.env.NEXT_PUBLIC_AFF_BADMINTON_SHOP
      ? { ref: process.env.NEXT_PUBLIC_AFF_BADMINTON_SHOP }
      : {}),
  },
}

/**
 * Construit l'URL de sortie en injectant les paramètres d'affiliation
 * selon le domaine du vendeur.
 * Retourne l'URL d'origine sans modification si aucun paramètre n'est configuré.
 */
export function buildAffiliateUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null

  try {
    const url = new URL(rawUrl)
    const hostname = url.hostname.replace(/^www\./, '')

    const params = MERCHANT_PARAMS[hostname]
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value)
      })
    }

    return url.toString()
  } catch {
    // URL malformée — on retourne l'originale
    return rawUrl
  }
}

/** Attributs rel recommandés pour tous les liens sortants affiliés */
export const AFFILIATE_REL = 'sponsored noopener noreferrer' as const
