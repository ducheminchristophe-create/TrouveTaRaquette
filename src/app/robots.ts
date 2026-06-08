import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/src/lib/site'

/**
 * robots.txt — autorise TOUS les crawlers, y compris les robots d'IA
 * (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, anthropic-ai,
 * PerplexityBot, Google-Extended, Applebot-Extended, CCBot…).
 * Les pages légales sont exclues de l'indexation.
 */
export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
    'Bytespider',
    'Amazonbot',
    'Meta-ExternalAgent',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/mentions-legales', '/politique-confidentialite', '/cgu', '/cookies'],
      },
      // Autorisation explicite des crawlers d'IA (rassurant + à l'épreuve du futur)
      ...aiBots.map(userAgent => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
