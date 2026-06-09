import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/subscribe — inscription e-mail (optin résultats).
 *
 * L'ESP (fournisseur d'emailing) est abstrait derrière CE seul fichier : pour en
 * changer, remplace l'appel `subscribeToBrevo(...)` par un autre (voir l'alternative
 * Google Sheet en bas). La clé API reste 100 % côté serveur (variable d'env).
 *
 * Corps attendu : { email, sport, consent: true, rackets: string[], ts, website? }
 *   - `website` est un honeypot anti-bot (doit rester vide).
 *
 * Réponses : { ok: true } | { ok: false, error }
 * On ne logge JAMAIS l'e-mail en clair.
 */

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ---- Rate-limit basique en mémoire (best-effort par instance) ---- */
const HITS = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (HITS.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  arr.push(now)
  HITS.set(ip, arr)
  return arr.length > MAX_PER_WINDOW
}

/* ------------------------------------------------------------------ */
/* ESP : Brevo (implémentation par défaut)                            */
/* ------------------------------------------------------------------ */

async function subscribeToBrevo(opts: {
  email: string
  sport: string
  rackets: string[]
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.BREVO_API_KEY
  const listId = process.env.BREVO_LIST_ID
  if (!apiKey || !listId) {
    return { ok: false, error: 'service_not_configured' }
  }

  // Double opt-in : si un template DOI est configuré, Brevo envoie l'e-mail de
  // confirmation et n'ajoute le contact à la liste qu'après clic.
  const doiTemplateId = process.env.BREVO_DOI_TEMPLATE_ID
  const doiRedirect = process.env.BREVO_DOI_REDIRECT_URL

  const attributes = { SPORT: opts.sport, RACKETS: opts.rackets.join(', ') }

  const endpoint = doiTemplateId
    ? 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation'
    : 'https://api.brevo.com/v3/contacts'

  const body = doiTemplateId
    ? {
        email: opts.email,
        includeListIds: [Number(listId)],
        templateId: Number(doiTemplateId),
        redirectionUrl: doiRedirect || 'https://trouvetaraquette.com/?confirmed=1',
        attributes,
      }
    : {
        email: opts.email,
        listIds: [Number(listId)],
        updateEnabled: true,
        attributes,
      }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })

    // 201 créé, 204 mis à jour, 200 DOI accepté → succès.
    // Brevo renvoie 400 "Contact already exist" si déjà inscrit : on considère OK.
    if (res.ok) return { ok: true }
    const data = await res.json().catch(() => ({}))
    if (typeof data?.code === 'string' && data.code === 'duplicate_parameter') {
      return { ok: true }
    }
    // On logge le code d'erreur, jamais l'e-mail.
    console.error('Brevo error', res.status, data?.code)
    return { ok: false, error: 'esp_error' }
  } catch (e) {
    console.error('Brevo fetch failed', (e as Error).message)
    return { ok: false, error: 'esp_unreachable' }
  }
}

/* ------------------------------------------------------------------
 * ALTERNATIVE — Google Sheet (si on bascule plus tard) :
 * remplace l'appel `subscribeToBrevo(...)` ci-dessous par un POST vers un
 * Google Apps Script Web App (déployé "Anyone with the link"), ex. :
 *
 *   await fetch(process.env.SHEET_WEBHOOK_URL!, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ email, sport, rackets, ts: Date.now() }),
 *   })
 *
 * Le script Apps Script fait sheet.appendRow([...]). Aucune autre modif côté front.
 * ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  // Honeypot : un bot remplit ce champ caché → on simule un succès sans rien faire.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const sport = String(body.sport ?? 'inconnu').slice(0, 40)
  const consent = body.consent === true
  const rackets = Array.isArray(body.rackets)
    ? body.rackets.slice(0, 3).map(r => String(r).slice(0, 120))
    : []

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }
  if (!consent) {
    return NextResponse.json({ ok: false, error: 'consent_required' }, { status: 400 })
  }

  const result = await subscribeToBrevo({ email, sport, rackets })
  if (!result.ok) {
    return NextResponse.json(result, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}

/** Toute autre méthode → 405. */
export function GET() {
  return NextResponse.json({ ok: false, error: 'method_not_allowed' }, { status: 405 })
}
