import { SITE_URL, SITE_NAME } from './site'

/**
 * Données structurées pour une page « module sport » :
 * - WebApplication : décrit l'outil de recommandation (utile aux IA et à Google).
 * - BreadcrumbList : fil d'Ariane Accueil > Module.
 */
export function buildSportJsonLd(opts: {
  name: string
  path: string
  description: string
}): Record<string, unknown>[] {
  const url = `${SITE_URL}${opts.path}`
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: opts.name,
      url,
      description: opts.description,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      inLanguage: 'fr-FR',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: opts.name, item: url },
      ],
    },
  ]
}
