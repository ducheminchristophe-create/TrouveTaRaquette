import type { MetadataRoute } from 'next'
import { SITE_URL, MODULES } from '@/src/lib/site'

/** sitemap.xml — pages publiques indexables (accueil + 4 modules). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...MODULES.map(m => ({
      url: `${SITE_URL}${m.path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]
}
