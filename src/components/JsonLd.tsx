/**
 * JsonLd — injecte un bloc de données structurées (schema.org) dans le HTML
 * rendu côté serveur, lisible par Google et les crawlers d'IA.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
