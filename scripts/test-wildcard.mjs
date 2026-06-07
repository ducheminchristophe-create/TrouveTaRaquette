/**
 * Test des invariants topFits / wildcard pour padel et ping-pong.
 * Lancement : node scripts/test-wildcard.mjs
 */
import { readFileSync } from 'fs'
import { recommend as recommendPingPong, pickWildcard } from '../src/pingpong/scoring.js'

let pass = 0, fail = 0
function check(name, cond) {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ÉCHEC : ${name}`) }
}

const bats = JSON.parse(readFileSync(new URL('../src/pingpong/bats.json', import.meta.url)))
const q = JSON.parse(readFileSync(new URL('../src/pingpong/questionnaire.json', import.meta.url)))

console.log('\n=== PING-PONG : profil club / offensif / vitesse / ITTF ===')
const out = recommendPingPong(bats, {
  level: 'club', style: 'offensive', priority: 'speed', grip: 'classic', official: 'yes', budget: 'nolimit',
}, q)

console.log('  topFits :')
out.topFits.forEach((r, i) => console.log(`    ${i + 1}. ${r.bat.brand} ${r.bat.model} — ${r.score}% (${r.bat.price}€)`))
if (out.wildcard) {
  const w = out.wildcard
  console.log(`  wildcard : ${w.bat.brand} ${w.bat.model} — ${w.score}% (${w.bat.price}€) | value=${(w.score / Math.sqrt(w.bat.price)).toFixed(2)} | ${w.label}`)
}

check('topFits.length <= 3', out.topFits.length <= 3)
check('wildcard pas dans topFits', !out.wildcard || !out.topFits.some(t => t.bat.id === out.wildcard.bat.id))
check('wildcard.score >= 55 si non nul', !out.wildcard || out.wildcard.score >= 55)
check('wildcardType = "value"', !out.wildcard || out.wildcard.wildcardType === 'value')

// Vérifie que le wildcard a bien le meilleur value parmi les candidats restants
if (out.wildcard) {
  const all = recommendPingPong(bats, { level: 'club', style: 'offensive', priority: 'speed', grip: 'classic', official: 'yes', budget: 'nolimit' }, q, { limit: 99 })
  const topIds = new Set(out.topFits.map(t => t.bat.id))
  const candidates = all.topFits.filter(r => !topIds.has(r.bat.id) && r.score >= 55)
  const bestValue = Math.max(...candidates.map(r => r.score / Math.sqrt(r.bat.price)))
  const wcValue = out.wildcard.score / Math.sqrt(out.wildcard.bat.price)
  check('wildcard a le meilleur score/√prix', Math.abs(wcValue - bestValue) < 1e-9)
}

console.log('\n=== PING-PONG : cas wildcard null (porte-plume + budget ≤ 25 €) ===')
const out2 = recommendPingPong(bats, {
  level: 'beginner', style: 'defensive', priority: 'control', grip: 'penhold', budget: 'u25',
}, q)
console.log(`  topFits : ${out2.topFits.length} · wildcard : ${out2.wildcard}`)
check('topFits vide quand filtres trop stricts', out2.topFits.length === 0)
check('wildcard null quand aucun candidat', out2.wildcard === null)

console.log('\n=== pickWildcard unitaire : exige score >= 55 ===')
const fakeCandidates = [
  { bat: { id: 'a', price: 10 }, score: 54 },  // sous le seuil
  { bat: { id: 'b', price: 40 }, score: 70 },  // qualifie
]
const wc = pickWildcard(fakeCandidates, [], 'value')
check('ignore les candidats score < 55', wc && wc.bat.id === 'b')

const wcNull = pickWildcard([{ bat: { id: 'a', price: 10 }, score: 50 }], [], 'value')
check('null si tous sous 55', wcNull === null)

console.log(`\n${fail === 0 ? '✅ TOUS LES TESTS PASSENT' : '❌ ' + fail + ' échec(s)'} (${pass} ok, ${fail} ko)\n`)
process.exit(fail === 0 ? 0 : 1)
