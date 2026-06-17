# Checklist de test — gpt-4o-mini pour l'IA cordage

Objectif : vérifier que `gpt-4o-mini` donne des résultats fiables avant de l'activer en Production. À faire sur l'environnement **Preview** uniquement.

## Configuration préalable

- [ ] Sur Vercel → Environment Variables → Preview :
  - `NEXT_PUBLIC_DEMO_MODE=false`
  - `NEXT_PUBLIC_AI_MODEL=gpt-4o-mini`
  - `NEXT_PUBLIC_AI_API_KEY=` ta vraie clé OpenAI
- [ ] Redéployer le Preview
- [ ] Vérifier que le badge passe bien sur "✅ IA réelle (production)" quand tu testes

## Test 1 — Cordages bien réels (le plus important)

Pour chaque recommandation reçue, vérifier que le nom existe **exactement** dans ta base :

- [ ] Ouvre `src/data/MonoCordage.json` et `src/data/HybrideCordage.json` côte à côte
- [ ] Lance le quiz avec un profil quelconque
- [ ] Pour chaque cordage recommandé : le nom (marque + modèle) correspond-il mot pour mot à une entrée du JSON ?
- [ ] Refais le test 3 fois avec des profils différents (débutant / confirmé / compétiteur)

**Si un nom inventé apparaît** → gpt-4o-mini n'est pas assez fiable pour cette contrainte, repasser à `gpt-4o`.

## Test 2 — Respect de la règle de tension (±3kg)

- [ ] Renseigne une tension actuelle précise (ex: 24kg)
- [ ] Vérifie que toutes les tensions recommandées sont entre 21 et 27kg
- [ ] Répète avec une tension basse (15kg) et une haute (28kg)

**Si une tension sort de la plage ±3kg** → règle non respectée, signal d'alerte sur la rigueur du modèle.

## Test 3 — Cohérence raquette / cordage

- [ ] Teste avec une raquette puissante (ex: Babolat Pure Drive) → attendu : orientation polyester/contrôle
- [ ] Teste avec une raquette contrôle (ex: Wilson Blade, Babolat Pure Strike) → attendu : multi ou hybride confort
- [ ] Vérifie que le texte de justification (`reasoning`) mentionne bien ce lien raquette-cordage, pas juste générique

## Test 4 — Format JSON valide

- [ ] Lance le quiz 5 fois de suite rapidement
- [ ] Vérifie dans la console navigateur (F12) qu'aucune erreur "Format de réponse OpenAI invalide" n'apparaît
- [ ] Si erreur de parsing JSON régulière → gpt-4o-mini structure parfois moins bien que gpt-4o, peut nécessiter d'ajouter `response_format: { type: "json_object" }` dans le code

## Test 5 — Analyse du setup actuel (2ème fonctionnalité IA)

- [ ] Va sur la page d'analyse de setup (`analyzeSetup`)
- [ ] Renseigne un setup avec un défaut volontaire (ex: raquette très rigide + cordage poly + plaintes de confort)
- [ ] Vérifie que l'analyse identifie bien la faiblesse de confort dans `weaknesses`
- [ ] Vérifie que les scores (power/control/spin/comfort/durability) semblent cohérents avec le setup décrit

## Test 6 — Coût réel observé

- [ ] Sur ton compte OpenAI → Usage (platform.openai.com/usage)
- [ ] Note le coût après ~10 tests complets
- [ ] Compare au calcul théorique (~0,002 $ par utilisateur avec gpt-4o-mini)

## Décision finale

| Résultat | Action |
|---|---|
| Tous les tests passent | Appliquer `NEXT_PUBLIC_AI_MODEL=gpt-4o-mini` en Production |
| Noms de cordages inventés ou tensions hors plage | Repasser `NEXT_PUBLIC_AI_MODEL=gpt-4o` en Production |
| Erreurs JSON fréquentes mais reste cohérent | Garder gpt-4o-mini mais demander d'ajouter `response_format: json_object` |

## Note sur le fallback existant

Le code bascule déjà automatiquement vers le mode simulation (`simulateAICall`) si l'appel API échoue ou si le JSON est invalide — donc même en cas de souci avec gpt-4o-mini, l'utilisateur final ne voit jamais d'erreur brute, juste une recommandation simulée à la place. Le risque réel n'est donc pas un crash, mais une recommandation de moins bonne qualité affichée comme si elle venait de l'IA réelle.
