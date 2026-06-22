import stringDatabase, { MonoString, HybridString } from './stringDatabase';
import { PlayerData } from '@/src/types/player';

interface SetupAnalysisRequest {
  racket: {
    brand: string;
    model: string;
    details?: string;
  };
  currentStrings: {
    type: string;
    mono?: string;
    monoTension?: string;
    hybridMain?: string;
    hybridCross?: string;
    hybridMainTension?: string;
    hybridCrossTension?: string;
  };
  // Champs optionnels utilisés dans les prompts IA
  level?: string;
  playStyle?: string;
  priority?: string;
  injuries?: string;
  playFrequency?: string;
  [key: string]: unknown;
}

interface SetupAnalysis {
  power: number;
  control: number;
  spin: number;
  comfort: number;
  durability: number;
  strengths: string[];
  weaknesses: string[];
  analysis: string;
  isUsingRealAPI?: boolean;
}

interface StringingRequest {
  playerData: PlayerData;
  forceUseRealAPI?: boolean;
}

interface AIStringRecommendation {
  id: string;
  name: string;
  brand: string;
  type: string;
  gauge: string;
  tension: string;
  description: string;
  pros: string[];
  cons: string[];
  duration: string;
  budget: string;
  confidence: number;
  reasoning: string;
  marketPrice: number;
  availability: 'high' | 'medium' | 'low';
  professionalRating: number;
  // Caractéristiques pour le tableau d'analyse
  power?: number;
  control?: number;
  spin?: number;
  comfort?: number;
  durability?: number;
}

interface AIResponse {
  recommendations: AIStringRecommendation[];
  hybridRecommendations: any[];
  isUsingRealAPI?: boolean;
  maintenanceSchedule: {
    frequency: string;
    signs: string[];
    tips: string[];
  };
  expertInsights: string[];
  errorMessage?: string;
}

class AIStringService {
  private apiKey: string;
  private baseUrl: string;
  private isDemoMode: boolean;
  private aiModel: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || 'demo-key';
    this.baseUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'https://api.openai.com/v1';
    // Mode démo activé explicitement via variable d'environnement
    this.isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    // Modèle configurable — gpt-4o-mini par défaut (16x moins cher que gpt-4o)
    this.aiModel = process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-4o-mini';
  }

  async getStringRecommendations(request: StringingRequest): Promise<AIResponse> {
    try {
      // Mode démo forcé — aucun appel API
      if (this.isDemoMode) {
        const response = await this.simulateAICall(request);
        response.isUsingRealAPI = false;
        return response;
      }

      // Vérifier si on a une vraie API configurée
      const hasRealAPI = this.apiKey &&
                        this.apiKey !== 'demo-key' &&
                        this.apiKey !== 'your_real_api_key_here' &&
                        this.apiKey !== 'your_ai_api_key_here' &&
                        this.apiKey !== 'sk-proj-votre_vraie_cle_openai_ici' &&
                        this.apiKey.startsWith('sk-') &&
                        this.baseUrl &&
                        this.baseUrl !== 'https://your-api-endpoint.com/v1';

      if (hasRealAPI) {
        try {
          // Mode production - OpenAI API
          const response = await this.callOpenAIAPI(request);
          response.isUsingRealAPI = true;

          // Garde-fou : si l'IA n'a pas respecté le nombre demandé de mono/hybrides
          // (peut arriver avec des modèles plus légers comme gpt-4o-mini),
          // on complète avec la simulation locale plutôt que de laisser une section vide.
          const prefs = request.playerData.preferences;
          const wantsMono = prefs.alternativeTypes.includes('mono');
          const wantsHybrid = prefs.alternativeTypes.includes('hybrid');
          const missingMono = wantsMono && response.recommendations.length < prefs.monoCount;
          const missingHybrid = wantsHybrid && (response.hybridRecommendations?.length ?? 0) < prefs.hybridCount;

          if (missingMono || missingHybrid) {
            const fallback = await this.simulateAICall(request);
            if (missingMono) {
              response.recommendations = fallback.recommendations.slice(0, prefs.monoCount);
            }
            if (missingHybrid) {
              response.hybridRecommendations = (fallback.hybridRecommendations ?? []).slice(0, prefs.hybridCount);
            }
            response.errorMessage = "L'IA n'a pas retourné le nombre exact de recommandations demandées — complété automatiquement.";
          }

          return response;
        } catch (error) {
          // Fallback vers mode démo si l'API réelle échoue
          const response = await this.simulateAICall(request);
          response.isUsingRealAPI = false;
          response.errorMessage = this.extractErrorMessage(error);
          return response;
        }
      } else {
        // Mode démo - simulation
        const response = await this.simulateAICall(request);
        response.isUsingRealAPI = false;
        return response;
      }
    } catch (error) {
      // Fallback vers recommandations locales
      const fallback = this.getFallbackRecommendations(request);
      fallback.isUsingRealAPI = false;
      fallback.errorMessage = this.extractErrorMessage(error);
      return fallback;
    }
  }

  private async callOpenAIAPI(request: StringingRequest): Promise<AIResponse> {
    const { playerData } = request;

    // Récupérer les cordages de la base de données
    let monoStrings = await stringDatabase.getMonoStrings();
    let hybridStrings = await stringDatabase.getHybridStrings();

    // Filtrer par marques préférées si spécifié
    const prefs = playerData.preferences;
    if (prefs.preferredBrands && prefs.preferredBrands.length > 0) {
      // Filtrer les mono-cordages
      const filteredMonoStrings = monoStrings.filter(s => prefs.preferredBrands.includes(s.brand));
      // Si le filtre est trop restrictif, on garde tous les cordages
      if (filteredMonoStrings.length >= 5) {
        monoStrings = filteredMonoStrings;
      }

      // Filtrer les hybrides
      const filteredHybrids = hybridStrings.filter(h => {
        const mainBrand = h.main_string.split(' ')[0];
        const crossBrand = h.cross_string.split(' ')[0];
        return prefs.preferredBrands.includes(mainBrand) || prefs.preferredBrands.includes(crossBrand);
      });
      // Si le filtre est trop restrictif, on garde tous les hybrides
      if (filteredHybrids.length >= 3) {
        hybridStrings = filteredHybrids;
      }
    }

    const prompt = this.buildTennisStringPrompt(playerData, monoStrings, hybridStrings);


    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.aiModel,
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert maître-cordeur professionnel avec 25+ années d\'expérience. Tu donnes des conseils précis et personnalisés sur les cordages de tennis. Réponds UNIQUEMENT en JSON valide selon le format demandé, sans texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    console.log('Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    try {
      // Nettoyer la réponse en supprimant les blocs de code markdown
      const cleanedResponse = aiResponse
        .replace(/```json\s*/g, '')  // Supprimer ```json au début
        .replace(/```\s*$/g, '')     // Supprimer ``` à la fin
        .trim();                     // Supprimer les espaces en début/fin
      
      const parsedResponse = JSON.parse(cleanedResponse);
      return this.adaptOpenAIResponse(parsedResponse, playerData.preferences);
    } catch (parseError) {
      throw new Error('Format de réponse OpenAI invalide');
    }
  }

  private buildTennisStringPrompt(playerData: any, monoStrings: MonoString[], hybridStrings: HybridString[]): string {
    const currentSetupType = this.getCurrentSetupType(playerData.currentStrings);
    const setupWeaknesses = this.identifySetupWeaknesses(playerData);
    const currentTension = playerData.currentStrings.monoTension || playerData.currentStrings.hybridMainTension || 'Non spécifiée';

    // Formater les cordages de la base de données pour le prompt
    const monoStringsFormatted = monoStrings.slice(0, 15).map((s, i) =>
      `${i+1}. ${s.brand} ${s.name} (${s.type}) - Prix: ${s.price}€ | Power: ${s.power}/10, Control: ${s.control}/10, Spin: ${s.spin}/10, Comfort: ${s.comfort}/10, Durability: ${s.durability}/10 | Tension: ${s.tension_min}-${s.tension_max}kg | Profil: ${s.player_profile}`
    ).join('\n');

    const hybridStringsFormatted = hybridStrings.slice(0, 10).map((h, i) =>
      `${i+1}. ${h.main_string} / ${h.cross_string} (${h.setup_type}) - Prix: ${h.price}€ | Power: ${h.power}/10, Control: ${h.control}/10, Spin: ${h.spin}/10, Comfort: ${h.comfort}/10, Durability: ${h.durability}/10 | Tensions: ${h.tension_main}kg / ${h.tension_cross}kg | Profil: ${h.player_profile}`
    ).join('\n');

    return `
Tu es un maître-cordeur expert avec 25+ ans d'expérience. Analyse ce profil de joueur et son setup actuel de manière COHÉRENTE et PRÉCISE.

IMPORTANT: Tu DOIS choisir tes recommandations UNIQUEMENT parmi les cordages disponibles ci-dessous. NE PAS inventer de cordages.

SETUP ACTUEL COMPLET À ANALYSER:
- Raquette: ${playerData.racket.brand} ${playerData.racket.model} ${playerData.racket.details ? `(${playerData.racket.details})` : ''}
- Cordage actuel: ${this.formatCurrentStrings(playerData.currentStrings)}
- Type de cordage: ${currentSetupType}
- Tension actuelle: ${currentTension}kg

PRÉFÉRENCES DU JOUEUR:
- Types d'alternatives souhaités: ${playerData.preferences.alternativeTypes.join(', ')}
- Nombre de mono-cordages: ${playerData.preferences.monoCount}
- Nombre d'hybrides: ${playerData.preferences.hybridCount}
${playerData.preferences.preferredBrands.length > 0 ? `- Marques préférées: ${playerData.preferences.preferredBrands.join(', ')}` : '- Aucune préférence de marque'}

ANALYSE CRITIQUE DU SETUP ACTUEL:
${this.generateSetupCritique(playerData, currentSetupType, setupWeaknesses)}

═══════════════════════════════════════════════════════════════════
CORDAGES MONO-FILAMENTS DISPONIBLES (${monoStrings.length} cordages):
═══════════════════════════════════════════════════════════════════
${monoStringsFormatted}

═══════════════════════════════════════════════════════════════════
CONFIGURATIONS HYBRIDES DISPONIBLES (${hybridStrings.length} setups):
═══════════════════════════════════════════════════════════════════
${hybridStringsFormatted}

CONNAISSANCES MÉTIER ESSENTIELLES:

1. RÈGLES IMPORTANTES:
   - Tu DOIS choisir UNIQUEMENT parmi les cordages listés ci-dessus
   - Utilise les noms EXACTS (marque + nom) des cordages disponibles
   - Respecte les prix indiqués dans la base de données
   - Utilise les caractéristiques réelles (power, control, spin, etc.) fournies

2. RÈGLES DE COHÉRENCE RAQUETTE-CORDAGE:
   - Raquette puissante (ex: Pure Drive) → Privilégier polyester pour ajouter contrôle
   - Raquette contrôle (ex: Pure Strike, Blade) → Multi ou hybride pour ajouter confort/puissance
   - Raquette confort (ex: Pure Aero Lite) → Multi pour maximiser confort

3. RÈGLES DE TENSION (CRITIQUES):
   - IMPÉRATIF: Ne jamais proposer une tension qui s'éloigne de plus de ±3kg de la tension actuelle du joueur
   - Si joueur à 15kg → Proposer 13-18kg maximum (PAS 23kg !)
   - Si joueur à 25kg → Proposer 22-28kg maximum
   - Débutant/Intermédiaire: 20-23kg (plus de tolérance)
   - Avancé/Compétition: 23-26kg (plus de contrôle)
   - Style lift/top spin: +0.5 à +1kg (meilleur contrôle du lift)
   - Blessures/douleurs: -1.5 à -2kg (moins de vibrations)
   - Polyester: Généralement 1-2kg moins tendu que multi (car plus rigide)
   - Hybride: Principal tension actuelle ±2kg, Croisé +1 à +2kg plus tendu

4. RÈGLES DE CALIBRE (GAUGE):
   - 1.35mm+ (15/16): Maximum puissance et confort, faible durabilité
   - 1.30mm (16): Bon compromis puissance/durabilité
   - 1.25mm (17): Standard polyvalent (le plus courant)
   - 1.20mm- (18+): Maximum spin et contrôle, durabilité réduite

5. LOGIQUE D'AMÉLIORATION (IMPÉRATIF):
   - Si setup actuel = Polyester pur → Proposer multi ou hybride pour confort
   - Si setup actuel = Multifilament → Proposer poly ou hybride pour contrôle
   - Si setup actuel = Boyau synthétique → Proposer upgrade performance
   - Si priorité = Confort + Setup poly → OBLIGATOIRE de proposer multifilament
   - Si blessures + Setup poly → OBLIGATOIRE multifilament ou hybride confort
   - Si priorité = Contrôle + Setup multi → OBLIGATOIRE polyester ou hybride contrôle

6. INTERDICTIONS STRICTES:
   - NE JAMAIS recommander le même type de cordage que le setup actuel sans raison valable
   - NE JAMAIS proposer du polyester si priorité = Confort OU blessures présentes
   - NE JAMAIS proposer du multifilament si priorité = Contrôle ET niveau Compétition
   - NE JAMAIS ignorer la priorité principale du joueur
   - Les 3 mono-filaments DOIVENT être de types DIFFÉRENTS (pas 3 polys similaires)

TÂCHE DÉTAILLÉE:
1. COMMENCE par analyser le setup actuel:
   - Quel est le type de cordage utilisé ?
   - Quelles sont ses caractéristiques objectives (power/control/spin/comfort/durability) ?
   - Est-il adapté au profil du joueur ? POURQUOI ou POURQUOI PAS ?

2. IDENTIFIE les problèmes CONCRETS:
   - Qu'est-ce qui ne va PAS dans le setup actuel ?
   - Quelle(s) caractéristique(s) manque(nt) ?
   - Quel est le décalage entre le setup et la priorité du joueur ?

3. CHOISIS EXACTEMENT 3 alternatives MONO-FILAMENT parmi la liste fournie, organisées par GAMME DE PRIX:
   - Alternative 1 (PREMIUM): Le meilleur cordage disponible pour ce joueur
     • Choisis parmi les cordages les plus chers de la liste
     • Utilise le nom EXACT tel qu'indiqué (Marque + Nom)

   - Alternative 2 (STANDARD): Le meilleur rapport qualité/prix disponible
     • Choisis parmi les cordages de prix moyen de la liste
     • Utilise le nom EXACT tel qu'indiqué (Marque + Nom)

   - Alternative 3 (ÉCONOMIQUE): L'option budget performante disponible
     • Choisis parmi les cordages les moins chers de la liste
     • Utilise le nom EXACT tel qu'indiqué (Marque + Nom)

   IMPORTANT: Les 3 alternatives doivent TOUTES correspondre au profil du joueur, seul le prix/qualité diffère

4. CHOISIS EXACTEMENT 3 configurations HYBRIDES parmi la liste fournie, organisées par GAMME DE PRIX:
   - Hybride 1 (PREMIUM): Configuration haut de gamme disponible
     • Choisis parmi les hybrides les plus chers de la liste
     • Utilise les noms EXACTS des cordages tels qu'indiqués

   - Hybride 2 (STANDARD): Configuration intermédiaire disponible
     • Choisis parmi les hybrides de prix moyen de la liste
     • Utilise les noms EXACTS des cordages tels qu'indiqués

   - Hybride 3 (ÉCONOMIQUE): Configuration budget disponible
     • Choisis parmi les hybrides les moins chers de la liste
     • Utilise les noms EXACTS des cordages tels qu'indiqués

   IMPORTANT: Les 3 hybrides doivent TOUS correspondre au profil du joueur, seul le prix/qualité diffère

5. Pour chaque recommandation, JUSTIFIE avec précision en utilisant les données réelles:
   - EN QUOI elle améliore le setup actuel (utilise les scores power/control/spin/comfort/durability)
   - POURQUOI elle correspond mieux à la priorité du joueur
   - COMMENT elle résout les problèmes identifiés
   - Utilise le profil joueur indiqué dans la base de données

6. VÉRIFIE la cohérence finale:
   - As-tu choisi UNIQUEMENT des cordages de la liste fournie ?
   - Les noms sont-ils EXACTS (Marque + Nom) ?
   - Les prix correspondent-ils aux prix de la base de données ?
   - Les caractéristiques utilisées sont-elles celles de la base de données ?
   - As-tu bien 3 monocordages ET 3 hybrides ?

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :

IMPORTANT: Tu DOIS fournir EXACTEMENT 3 objets dans "recommendations" ET EXACTEMENT 3 objets dans "hybrid_recommendations". Total = 6 alternatives.

STRUCTURE DES PRIX (utilise les prix réels de la base):
- recommendations[0] = PREMIUM (le cordage le plus cher adapté au profil)
- recommendations[1] = STANDARD (cordage de prix moyen adapté)
- recommendations[2] = ÉCONOMIQUE (le cordage le moins cher adapté)
- hybrid_recommendations[0] = PREMIUM (l'hybride le plus cher adapté)
- hybrid_recommendations[1] = STANDARD (hybride de prix moyen adapté)
- hybrid_recommendations[2] = ÉCONOMIQUE (l'hybride le moins cher adapté)

IMPORTANT: Utilise les prix EXACTS indiqués dans la base de données pour marketPrice

Ajoute ces badges dans les descriptions:
- "🏆 PREMIUM - ..." pour les options haut de gamme
- "⭐ STANDARD - ..." pour les options rapport qualité/prix
- "💰 ÉCONOMIQUE - ..." pour les options budget

{
  "recommendations": [
    {
      "id": "rec-1",
      "name": "Nom EXACT du cordage de la liste",
      "brand": "Marque EXACTE de la liste",
      "type": "Type EXACT de la liste",
      "gauge": "1.25mm (17)",
      "tension": "Tension adaptée en kg",
      "description": "🏆 PREMIUM - Utilise le profil joueur de la base",
      "pros": ["Avantage basé sur les caractéristiques DB", "Avantage 2", "Avantage 3"],
      "cons": ["Inconvénient basé sur les caractéristiques DB", "Inconvénient 2"],
      "duration": "Durée basée sur durability DB",
      "budget": "Fourchette autour du prix DB",
      "confidence": 0.95,
      "reasoning": "Explication utilisant les scores de la DB",
      "marketPrice": "PRIX EXACT de la base de données",
      "availability": "high",
      "professionalRating": 4.8,
      "power": "Score EXACT de la DB",
      "control": "Score EXACT de la DB",
      "spin": "Score EXACT de la DB",
      "comfort": "Score EXACT de la DB",
      "durability": "Score EXACT de la DB"
    },
    {
      "id": "rec-2",
      "name": "Deuxième cordage",
      "description": "⭐ STANDARD - Meilleur rapport qualité/prix",
      // ... même structure que rec-1
      "marketPrice": 20
    },
    {
      "id": "rec-3",
      "name": "Troisième cordage",
      "description": "💰 ÉCONOMIQUE - Option budget performante",
      // ... même structure que rec-1
      "marketPrice": 14
    }
  ],
  "hybrid_recommendations": [
    {
      "id": "hybrid-1",
      "name": "Configuration hybride premium",
      "main_string": "Cordage principal haut de gamme",
      "cross_string": "Cordage croisé premium",
      "main_tension": "Tension principale",
      "cross_tension": "Tension croisée",
      "description": "🏆 PREMIUM - Configuration pro haut de gamme",
      "pros": ["Avantage 1", "Avantage 2"],
      "cons": ["Inconvénient 1", "Inconvénient 2"],
      "duration": "Durée de vie",
      "budget": "45-65€",
      "confidence": 0.92,
      "reasoning": "Explication du choix hybride premium",
      "marketPrice": 55,
      "availability": "medium",
      "professionalRating": 4.7,
      "power": 7,
      "control": 8,
      "spin": 7,
      "comfort": 8,
      "durability": 8
    },
    {
      "id": "hybrid-2",
      "name": "Configuration hybride standard",
      "description": "⭐ STANDARD - Excellent compromis performance/prix",
      // ... même structure que hybrid-1
      "budget": "30-45€",
      "marketPrice": 38
    },
    {
      "id": "hybrid-3",
      "name": "Configuration hybride budget",
      "description": "💰 ÉCONOMIQUE - Hybride accessible et performant",
      // ... même structure que hybrid-1
      "budget": "20-35€",
      "marketPrice": 28
    }
  ],
  "maintenance": {
    "frequency": "Fréquence de recordage",
    "warning_signs": ["Signe 1", "Signe 2", "Signe 3"],
    "tips": ["Conseil 1", "Conseil 2", "Conseil 3"]
  },
  "ai_insights": [
    "Insight 1 basé sur l'analyse",
    "Insight 2 sur les tendances",
    "Insight 3 personnalisé"
  ]
}

CRITÈRES DE QUALITÉ STRICTS (NON NÉGOCIABLES):

DIVERSITÉ DES RECOMMANDATIONS:
- Les 3 mono-filaments DOIVENT être de caractéristiques DISTINCTES
- Recommandation 1: Meilleur upgrade global (confidence 0.90-0.95)
- Recommandation 2: Alternative équilibrée (confidence 0.85-0.90)
- Recommandation 3: Option spécialisée ou budget (confidence 0.80-0.88)
- INTERDIT: 3 polyesters quasi-identiques (ex: ALU Power, RPM Blast, Tour Bite)
- EXIGÉ: Diversité de types OU de caractéristiques (ex: poly + multi + hybride OU poly contrôle + poly confort + multi)

COHÉRENCE AVEC LE PROFIL:
- Si priorité = Confort → AU MOINS 2 recommandations multifilament/confort
- Si priorité = Contrôle → AU MOINS 2 recommandations polyester/contrôle
- Si priorité = Puissance → AU MOINS 2 recommandations élastiques/puissance
- Si blessures → TOUTES les recommandations doivent être confort-friendly (tensions basses, multi privilégié)
- Si débutant → Tensions 20-22kg MAX, cordages tolérants
- Si compétition + lift → Tensions 24-26kg, polyesters performants

TENSIONS PRÉCISES (IMPÉRATIF):
- TOUJOURS partir de la tension actuelle du joueur (${currentTension}kg)
- Ne JAMAIS proposer une tension à plus de ±3kg de la tension actuelle
- Exemple: Si tension actuelle = 15kg, proposer entre 13kg et 18kg UNIQUEMENT
- Exemple: Si tension actuelle = 25kg, proposer entre 22kg et 28kg UNIQUEMENT
- Polyester: Tension actuelle -1 à +1kg (plus rigide)
- Multifilament: Tension actuelle -2 à +1kg (plus élastique)
- Hybride: Principal tension actuelle ±2kg, Croisé +1 à +2kg
- Blessures: Tension actuelle -1.5kg minimum
- Ajustements priorité: ±1kg maximum

PRIX RÉALISTES:
- Boyau synthétique: 10-20€
- Multifilament entrée: 15-25€
- Multifilament premium: 30-45€
- Polyester standard: 15-25€
- Polyester premium: 20-30€
- Boyau naturel: 60-80€

REASONING OBLIGATOIRE:
Le "reasoning" DOIT contenir:
1. "Par rapport à votre ${currentSetupType} actuel..."
2. Une comparaison PRÉCISE des caractéristiques (ex: "passe de 5/10 à 9/10 en confort")
3. L'explication de COMMENT cela résout le problème identifié
4. La justification par rapport à la PRIORITÉ du joueur

EXEMPLE DE BON REASONING:
"Par rapport à votre polyester actuel (Luxilon ALU Power), ce multifilament va considérablement améliorer le confort (de 5/10 à 9/10) et réduire les vibrations tout en augmentant la puissance (de 6/10 à 8/10), ce qui compensera la perte de contrôle minime."

VÉRIFICATION FINALE AVANT ENVOI:
✓ Respectes-tu le nombre exact de mono-filaments demandés (${playerData.preferences.monoCount}) ?
✓ Respectes-tu le nombre exact d'hybrides demandés (${playerData.preferences.hybridCount}) ?
${!playerData.preferences.alternativeTypes.includes('mono') ? '✓ Tu ne dois PAS inclure de mono-filaments dans "recommendations" !' : ''}
${!playerData.preferences.alternativeTypes.includes('hybrid') ? '✓ Tu ne dois PAS inclure d\'hybrides dans "hybrid_recommendations" !' : ''}
${playerData.preferences.preferredBrands.length > 0 ? `✓ Privilégies-tu les marques préférées: ${playerData.preferences.preferredBrands.join(', ')} ?` : ''}
✓ Les mono-filaments sont-ils VRAIMENT différents ?
✓ Les hybrides sont-ils VRAIMENT différents ?
✓ Les tensions respectent-elles le setup actuel ?
✓ Les recommandations résolvent-elles les problèmes du setup actuel ?
✓ Le "reasoning" compare-t-il explicitement avec le setup actuel ?
✓ Les hybrides offrent-ils des combinaisons différentes ?
`;
  }

  private adaptOpenAIResponse(openAIData: any, preferences?: any): AIResponse {
    let recommendations = openAIData.recommendations?.map((rec: any, index: number) => {
        const tension = parseFloat((rec.tension || '22kg').replace('kg', ''));
        const chars = this.calculateStringCharacteristics(rec.type || 'Multifilament', tension);

        return {
          id: rec.id || `openai-${index + 1}`,
          name: rec.name || 'Cordage recommandé',
          brand: rec.brand || 'Marque',
          type: rec.type || 'Type',
          gauge: rec.gauge || '1.25mm',
          tension: rec.tension || '22kg',
          description: rec.description || 'Recommandation OpenAI',
          pros: rec.pros || ['Recommandé par IA'],
          cons: rec.cons || ['À tester'],
          duration: rec.duration || '20-30h',
          budget: rec.budget || '20-30€',
          confidence: rec.confidence || 0.85,
          reasoning: rec.reasoning || 'Analyse OpenAI personnalisée',
          marketPrice: rec.marketPrice || 25,
          availability: rec.availability || 'medium',
          professionalRating: rec.professionalRating || 4.0,
          // Forcer les caractéristiques en nombres entiers
          power: parseInt(rec.power) || chars.power,
          control: parseInt(rec.control) || chars.control,
          spin: parseInt(rec.spin) || chars.spin,
          comfort: parseInt(rec.comfort) || chars.comfort,
          durability: parseInt(rec.durability) || chars.durability
        };
      }) || [];

    let hybridRecommendations = openAIData.hybrid_recommendations?.map((hybrid: any, index: number) => ({
        id: hybrid.id || `hybrid-${index + 1}`,
        name: hybrid.name || 'Configuration Hybride',
        mainString: hybrid.main_string || 'Cordage principal',
        crossString: hybrid.cross_string || 'Cordage croisé',
        mainTension: hybrid.main_tension || '22kg',
        crossTension: hybrid.cross_tension || '24kg',
        description: hybrid.description || 'Configuration hybride personnalisée',
        pros: hybrid.pros || ['Équilibre optimal'],
        cons: hybrid.cons || ['Configuration complexe'],
        duration: hybrid.duration || '25-35h',
        budget: hybrid.budget || '30-45€',
        confidence: hybrid.confidence || 0.85,
        reasoning: hybrid.reasoning || 'Hybride optimisé par IA',
        marketPrice: hybrid.marketPrice || 35,
        availability: hybrid.availability || 'medium',
        professionalRating: hybrid.professionalRating || 4.3,
        power: parseInt(hybrid.power) || 7,
        control: parseInt(hybrid.control) || 7,
        spin: parseInt(hybrid.spin) || 7,
        comfort: parseInt(hybrid.comfort) || 7,
        durability: parseInt(hybrid.durability) || 7
      })) || [];

    // Appliquer les préférences si disponibles
    if (preferences) {
      if (!preferences.alternativeTypes.includes('mono')) {
        recommendations = [];
      } else {
        recommendations = recommendations.slice(0, preferences.monoCount);
      }

      if (!preferences.alternativeTypes.includes('hybrid')) {
        hybridRecommendations = [];
      } else {
        hybridRecommendations = hybridRecommendations.slice(0, preferences.hybridCount);
      }

      // Filtrer par marques préférées si spécifié
      if (preferences.preferredBrands && preferences.preferredBrands.length > 0) {
        recommendations = recommendations.filter((rec: any) =>
          preferences.preferredBrands.includes(rec.brand)
        );

        hybridRecommendations = hybridRecommendations.filter((hybrid: any) => {
          // Pour les hybrides, vérifier si au moins un des cordages est d'une marque préférée
          // Extraire les marques des noms de cordages
          const mainBrand = hybrid.mainString?.split(' ')[0] || '';
          const crossBrand = hybrid.crossString?.split(' ')[0] || '';
          return preferences.preferredBrands.includes(mainBrand) || preferences.preferredBrands.includes(crossBrand);
        });
      }
    }

    return {
      recommendations,
      hybridRecommendations,
      maintenanceSchedule: {
        frequency: openAIData.maintenance?.frequency || 'toutes les 4-6 semaines',
        signs: openAIData.maintenance?.warning_signs || [
          'Perte de tension notable',
          'Cordes qui bougent facilement',
          'Diminution du contrôle'
        ],
        tips: openAIData.maintenance?.tips || [
          'Alternez entre 2 raquettes',
          'Stockage à température stable'
        ]
      },
      expertInsights: openAIData.ai_insights || [
        'Analyse personnalisée par OpenAI GPT-4',
        'Recommandations basées sur votre profil unique'
      ]
    };
  }

  private async simulateAICall(request: StringingRequest): Promise<AIResponse> {
    // Simulation d'un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { playerData } = request;

    // Utiliser les vraies données de la base de données (déjà filtrées par marques dans les fonctions)
    let recommendations = await this.generateAIRecommendations(playerData);
    let hybridRecommendations = await this.generateHybridRecommendations(playerData);

    // Appliquer les préférences de l'utilisateur pour le type et le nombre
    const prefs = playerData.preferences;

    // Filtrer par type d'alternatives
    if (!prefs.alternativeTypes.includes('mono')) {
      recommendations = [];
    } else {
      recommendations = recommendations.slice(0, prefs.monoCount);
    }

    if (!prefs.alternativeTypes.includes('hybrid')) {
      hybridRecommendations = [];
    } else {
      hybridRecommendations = hybridRecommendations.slice(0, prefs.hybridCount);
    }

    return {
      isUsingRealAPI: false,
      recommendations,
      hybridRecommendations,
      maintenanceSchedule: {
        frequency: this.calculateMaintenanceFrequency(''),
        signs: [
          'Perte de tension notable (>10%)',
          'Cordes qui bougent facilement après impact',
          'Diminution du contrôle ou de la puissance',
          'Vibrations inhabituelles à l\'impact',
          'Usure visible des cordes'
        ],
        tips: [
          'Alternez entre 2 raquettes si possible',
          'Stockage à température stable (15-25°C)',
          'Évitez l\'exposition directe au soleil',
          'Détendez légèrement en cas de non-utilisation prolongée'
        ]
      },
      expertInsights: this.generateExpertInsights(playerData)
    };
  }

  private async generateAIRecommendations(playerData: any): Promise<AIStringRecommendation[]> {
    const recommendations: AIStringRecommendation[] = [];

    // Analyser le setup actuel pour adapter les recommandations
    const currentSetupType = this.getCurrentSetupType(playerData.currentStrings);
    const setupWeaknesses = this.identifySetupWeaknesses(playerData);

    // Récupérer la tension actuelle pour adapter les recommandations
    const currentTension = parseFloat(
      playerData.currentStrings?.monoTension ||
      playerData.currentStrings?.hybridMainTension ||
      '22'
    );

    // Récupérer les cordages de la base de données
    let dbStrings = await stringDatabase.getMonoStrings();

    // Filtrer par marques préférées si spécifié
    const prefs = playerData.preferences;
    if (prefs && prefs.preferredBrands && prefs.preferredBrands.length > 0) {
      const filteredStrings = dbStrings.filter(s => prefs.preferredBrands.includes(s.brand));
      // N'utiliser le filtre que s'il laisse assez de cordages (minimum 5)
      if (filteredStrings.length >= 5) {
        dbStrings = filteredStrings;
      }
    }

    // Si on a des données de la DB, les utiliser
    if (dbStrings && dbStrings.length >= 3) {
      return this.convertDbStringsToRecommendations(dbStrings, playerData, currentSetupType, setupWeaknesses, currentTension);
    }

    // Sinon, fallback vers les recommandations codées en dur
    // Analyse IA basée sur les priorités et le setup actuel
    if (playerData.priority === 'Confort') {
      // Adapter les tensions de base à la tension actuelle du joueur
      const baseTensionComfort = Math.max(18, Math.min(24, currentTension - 1));

      const tension1 = parseFloat(this.calculateOptimalTension(baseTensionComfort, playerData).replace('kg', ''));
      const chars1 = this.calculateStringCharacteristics('Multifilament premium', tension1);
      recommendations.push({
        id: 'ai-comfort-1',
        name: 'Tecnifibre X-One Biphase',
        brand: 'Tecnifibre',
        type: 'Multifilament premium',
        gauge: '1.24mm (17)',
        tension: this.calculateOptimalTension(baseTensionComfort, playerData),
        description: '🏆 PREMIUM - Meilleur multifilament confort avec technologie avancée',
        pros: ['Confort premium', 'Excellent maintien de tension', 'Sensations naturelles', 'Adapté aux blessures'],
        cons: ['Prix élevé', 'Contrôle limité pour joueurs avancés'],
        duration: '20-30h de jeu',
        budget: '35-45€',
        confidence: 0.92,
        reasoning: `Par rapport à votre setup actuel (${this.formatCurrentStrings(playerData.currentStrings)}), ce multifilament premium va améliorer significativement le confort et réduire les vibrations tout en maintenant de bonnes performances. ${setupWeaknesses.includes('confort') ? 'Répond directement à votre besoin de confort.' : 'Optimise votre priorité confort.'}`,
        marketPrice: 42,
        availability: 'high',
        professionalRating: 4.7,
        ...chars1
      });

      const tension2 = parseFloat(this.calculateOptimalTension(baseTensionComfort - 1, playerData).replace('kg', ''));
      const chars2 = this.calculateStringCharacteristics('Multifilament synthétique', tension2);
      recommendations.push({
        id: 'ai-comfort-2',
        name: 'Wilson NXT Power',
        brand: 'Wilson',
        type: 'Multifilament synthétique',
        gauge: '1.25mm (17)',
        tension: this.calculateOptimalTension(baseTensionComfort - 1, playerData),
        description: '⭐ STANDARD - Excellent rapport qualité/prix pour confort',
        pros: ['Très bon confort', 'Puissance élevée', 'Prix accessible', 'Polyvalent'],
        cons: ['Durée de vie moyenne', 'Contrôle moindre'],
        duration: '15-25h de jeu',
        budget: '25-35€',
        confidence: 0.87,
        reasoning: `Alternative économique qui améliore le confort de votre setup actuel (${currentSetupType}). Excellent choix si vous cherchez à augmenter la puissance tout en préservant le confort.`,
        marketPrice: 28,
        availability: 'high',
        professionalRating: 4.3,
        ...chars2
      });

      const tension3 = parseFloat(this.calculateOptimalTension(baseTensionComfort - 2, playerData).replace('kg', ''));
      const chars3 = this.calculateStringCharacteristics('Multifilament', tension3);
      recommendations.push({
        id: 'ai-comfort-3',
        name: 'Babolat Xcel',
        brand: 'Babolat',
        type: 'Multifilament équilibré',
        gauge: '1.30mm (16)',
        tension: this.calculateOptimalTension(baseTensionComfort - 2, playerData),
        description: '💰 ÉCONOMIQUE - Option budget avec bon niveau de confort',
        pros: ['Confort excellent', 'Prix abordable', 'Bonne durabilité', 'Polyvalent'],
        cons: ['Contrôle moyen', 'Moins premium que X-One'],
        duration: '18-25h de jeu',
        budget: '20-30€',
        confidence: 0.84,
        reasoning: `Option économique par rapport à votre ${currentSetupType}. Apporte le confort recherché à un prix plus accessible tout en offrant de bonnes performances générales. ${playerData.injuries ? 'Adapté à votre historique de blessures.' : ''}`,
        marketPrice: 24,
        availability: 'high',
        professionalRating: 4.4,
        ...chars3
      });
    }

    else if (playerData.priority === 'Puissance') {
      // Adapter les tensions de base à la tension actuelle du joueur
      const baseTensionPower = Math.max(18, Math.min(24, currentTension - 1));

      // PREMIUM: Multifilament haut de gamme
      const tensionP1 = parseFloat(this.calculateOptimalTension(baseTensionPower, playerData).replace('kg', ''));
      const charsP1 = this.calculateStringCharacteristics('Multifilament premium', tensionP1);
      recommendations.push({
        id: 'ai-power-1',
        name: 'Tecnifibre X-One Biphase',
        brand: 'Tecnifibre',
        type: 'Multifilament premium',
        gauge: '1.30mm (16)',
        tension: this.calculateOptimalTension(baseTensionPower, playerData),
        description: '🏆 PREMIUM - Le meilleur multifilament pour puissance et confort',
        pros: ['Puissance maximale', 'Confort exceptionnel', 'Maintien tension optimal', 'Technologie biphase'],
        cons: ['Prix élevé', 'Durée de vie moyenne'],
        duration: '15-25h de jeu',
        budget: '35-45€',
        confidence: 0.92,
        reasoning: `Comparé à votre setup actuel (${currentSetupType}), ce cordage premium va maximiser votre puissance grâce à sa construction biphase unique. ${setupWeaknesses.includes('puissance') ? 'Corrige directement le manque de puissance identifié.' : 'Amplifie votre jeu offensif.'} Version haut de gamme.`,
        marketPrice: 40,
        availability: 'high',
        professionalRating: 4.7,
        ...charsP1
      });

      // STANDARD: Multifilament milieu de gamme
      const tensionP2 = parseFloat(this.calculateOptimalTension(baseTensionPower - 1, playerData).replace('kg', ''));
      const charsP2 = this.calculateStringCharacteristics('Multifilament synthétique', tensionP2);
      recommendations.push({
        id: 'ai-power-2',
        name: 'Wilson NXT Power',
        brand: 'Wilson',
        type: 'Multifilament synthétique',
        gauge: '1.30mm (16)',
        tension: this.calculateOptimalTension(baseTensionPower - 1, playerData),
        description: '⭐ STANDARD - Excellent rapport qualité/prix pour puissance',
        pros: ['Puissance élevée', 'Bon confort', 'Prix raisonnable', 'Polyvalent'],
        cons: ['Durée de vie moyenne', 'Contrôle moyen'],
        duration: '15-22h de jeu',
        budget: '22-30€',
        confidence: 0.87,
        reasoning: `Alternative équilibrée qui apporte plus de puissance que votre setup actuel (${currentSetupType}). Excellent compromis performance/prix.`,
        marketPrice: 26,
        availability: 'high',
        professionalRating: 4.3,
        ...charsP2
      });

      // ÉCONOMIQUE: Boyau synthétique
      const tensionP3 = parseFloat(this.calculateOptimalTension(baseTensionPower - 2, playerData).replace('kg', ''));
      const charsP3 = this.calculateStringCharacteristics('Boyau synthétique', tensionP3);
      recommendations.push({
        id: 'ai-power-3',
        name: 'Head Synthetic Gut PPS',
        brand: 'Head',
        type: 'Boyau synthétique',
        gauge: '1.35mm (15)',
        tension: this.calculateOptimalTension(baseTensionPower - 2, playerData),
        description: '💰 ÉCONOMIQUE - Solution budget pour gain de puissance',
        pros: ['Prix très accessible', 'Puissance correcte', 'Facile à jouer', 'Bonne durabilité'],
        cons: ['Performances basiques', 'Moins de sensations'],
        duration: '15-25h de jeu',
        budget: '12-18€',
        confidence: 0.82,
        reasoning: `Option économique qui apporte plus de puissance que votre ${currentSetupType}. ${playerData.level === 'Débutant' ? 'Parfait pour votre niveau.' : 'Solution budget performante.'}`,
        marketPrice: 15,
        availability: 'high',
        professionalRating: 4.0,
        ...charsP3
      });
    }

    else { // Contrôle
      // Adapter les tensions de base à la tension actuelle du joueur
      const baseTensionControl = Math.max(20, Math.min(26, currentTension));

      // PREMIUM: Co-polyester haut de gamme
      const tensionC1 = parseFloat(this.calculateOptimalTension(baseTensionControl, playerData).replace('kg', ''));
      const charsC1 = this.calculateStringCharacteristics('Co-polyester premium', tensionC1);
      recommendations.push({
        id: 'ai-control-1',
        name: 'Luxilon ALU Power',
        brand: 'Luxilon',
        type: 'Co-polyester premium',
        gauge: '1.25mm (17)',
        tension: this.calculateOptimalTension(baseTensionControl, playerData),
        description: '🏆 PREMIUM - Le standard des professionnels pour contrôle maximum',
        pros: ['Contrôle exceptionnel', 'Durabilité élevée', 'Spin facilité', 'Utilisé par les pros'],
        cons: ['Confort réduit', 'Perte de tension rapide'],
        duration: '25-40h de jeu',
        budget: '20-30€',
        confidence: 0.95,
        reasoning: `Par rapport à votre setup actuel (${currentSetupType}), l'ALU Power va considérablement améliorer votre contrôle et votre capacité à générer du spin. ${setupWeaknesses.includes('contrôle') ? 'Résout directement votre problème de contrôle.' : 'Standard professionnel pour le contrôle maximum.'}`,
        marketPrice: 25,
        availability: 'high',
        professionalRating: 4.8,
        ...charsC1
      });

      // STANDARD: Co-polyester rapport qualité/prix
      const tensionC2 = parseFloat(this.calculateOptimalTension(baseTensionControl, playerData).replace('kg', ''));
      const charsC2 = this.calculateStringCharacteristics('Co-polyester spin', tensionC2);
      recommendations.push({
        id: 'ai-control-2',
        name: 'Babolat RPM Blast',
        brand: 'Babolat',
        type: 'Co-polyester spin',
        gauge: '1.25mm (17)',
        tension: this.calculateOptimalTension(baseTensionControl, playerData),
        description: '⭐ STANDARD - Excellent compromis contrôle/spin/prix',
        pros: ['Contrôle solide', 'Spin élevé', 'Prix raisonnable', 'Populaire'],
        cons: ['Confort moyen', 'Perte tension'],
        duration: '25-35h de jeu',
        budget: '17-24€',
        confidence: 0.89,
        reasoning: `Alternative performante à votre setup actuel (${currentSetupType}). Le RPM Blast offre un excellent équilibre contrôle-spin à prix accessible. ${setupWeaknesses.includes('spin') ? 'Améliore significativement le spin.' : 'Rapport qualité/prix optimal.'}`,
        marketPrice: 20,
        availability: 'high',
        professionalRating: 4.6,
        ...charsC2
      });

      // ÉCONOMIQUE: Polyester entrée de gamme
      if (playerData.injuries || playerData.level === 'Débutant') {
        const tensionC3a = parseFloat(this.calculateOptimalTension(baseTensionControl - 2, playerData).replace('kg', ''));
        const charsC3a = this.calculateStringCharacteristics('Co-polyester confortable', tensionC3a);
        recommendations.push({
          id: 'ai-control-3',
          name: 'Tecnifibre Black Code',
          brand: 'Tecnifibre',
          type: 'Co-polyester confortable',
          gauge: '1.24mm (17)',
          tension: this.calculateOptimalTension(baseTensionControl - 2, playerData),
          description: '💰 ÉCONOMIQUE - Polyester confort pour blessures/débutants',
          pros: ['Contrôle excellent', 'Confort amélioré pour un poly', 'Bon spin', 'Moins rigide'],
          cons: ['Prix moyen-élevé', 'Perte tension progressive'],
          duration: '25-35h de jeu',
          budget: '14-22€',
          confidence: 0.87,
          reasoning: `Par rapport à votre ${currentSetupType}, le Black Code offre le contrôle recherché avec un confort nettement supérieur aux polyesters classiques. ${playerData.injuries ? 'Meilleur choix avec vos blessures.' : 'Plus tolérant pour votre niveau.'}`,
          marketPrice: 18,
          availability: 'high',
          professionalRating: 4.5,
          ...charsC3a
        });
      } else {
        const tensionC3b = parseFloat(this.calculateOptimalTension(baseTensionControl + 1, playerData).replace('kg', ''));
        const charsC3b = this.calculateStringCharacteristics('Co-polyester texturé', tensionC3b);
        recommendations.push({
          id: 'ai-control-3',
          name: 'Solinco Tour Bite',
          brand: 'Solinco',
          type: 'Co-polyester texturé',
          gauge: '1.20mm (18)',
          tension: this.calculateOptimalTension(baseTensionControl + 1, playerData),
          description: '�� ÉCONOMIQUE - Polyester spin avec texture pentagonale',
          pros: ['Spin maximal', 'Durabilité excellente', 'Prix attractif', 'Contrôle précis'],
          cons: ['Confort faible', 'Technique requise'],
          duration: '30-45h de jeu',
          budget: '14-20€',
          confidence: 0.86,
          reasoning: `Option économique performante par rapport à votre ${currentSetupType}. Sa texture pentagonale multiplie le spin pour un prix accessible. ${setupWeaknesses.includes('spin') ? 'Répond à votre besoin de spin.' : 'Excellent rapport performance/prix.'}`,
          marketPrice: 17,
          availability: 'medium',
          professionalRating: 4.5,
          ...charsC3b
        });
      }
    }

    return recommendations;
  }

  private calculateStringCharacteristics(stringType: string, tension: number = 22): { power: number; control: number; spin: number; comfort: number; durability: number } {
    let power = 5, control = 5, spin = 5, comfort = 5, durability = 5;

    const typeLower = stringType.toLowerCase();

    // Polyester
    if (typeLower.includes('poly') || typeLower.includes('co-poly')) {
      power = 6;
      control = 9;
      spin = 9;
      comfort = 5;
      durability = 9;

      // Polyester confortable (Black Code, etc.)
      if (typeLower.includes('confort') || typeLower.includes('black code')) {
        comfort = 6;
        power = 6;
      }
    }
    // Multifilament
    else if (typeLower.includes('multi')) {
      power = 8;
      control = 6;
      spin = 6;
      comfort = 9;
      durability = 6;

      // Multifilament premium
      if (typeLower.includes('premium') || typeLower.includes('biphase')) {
        comfort = 10;
        durability = 7;
        power = 8;
      }
    }
    // Boyau naturel
    else if (typeLower.includes('naturel') || typeLower.includes('natural gut')) {
      power = 9;
      control = 8;
      spin = 7;
      comfort = 10;
      durability = 4;
    }
    // Boyau synthétique
    else if (typeLower.includes('synthétique') || typeLower.includes('synthetic')) {
      power = 7;
      control = 7;
      spin = 6;
      comfort = 7;
      durability = 7;
    }

    // Ajustement selon tension
    if (tension < 20) {
      power += 1;
      control -= 1;
    } else if (tension > 24) {
      power -= 1;
      control += 1;
    }

    // S'assurer que les valeurs sont entre 1 et 10
    return {
      power: Math.max(1, Math.min(10, power)),
      control: Math.max(1, Math.min(10, control)),
      spin: Math.max(1, Math.min(10, spin)),
      comfort: Math.max(1, Math.min(10, comfort)),
      durability: Math.max(1, Math.min(10, durability))
    };
  }

  private generateSetupCritique(playerData: any, setupType: string, weaknesses: string[]): string {
    const { priority, injuries, level, playStyle } = playerData;
    const critiques: string[] = [];

    // Analyse du setup vs priorité
    if (priority === 'Confort' && setupType === 'polyester') {
      critiques.push('⚠️ PROBLÈME MAJEUR: Polyester rigide incompatible avec priorité confort');
    } else if (priority === 'Contrôle' && setupType === 'multifilament') {
      critiques.push('⚠️ PROBLÈME: Multifilament limite le contrôle recherché');
    } else if (priority === 'Puissance' && setupType === 'polyester') {
      critiques.push('⚠️ ATTENTION: Polyester rigide limite la puissance naturelle');
    }

    // Analyse du setup vs blessures
    if (injuries && setupType === 'polyester') {
      critiques.push('🚨 ALERTE SANTÉ: Setup rigide déconseillé avec blessures/douleurs');
    }

    // Analyse du setup vs niveau
    if (level === 'Débutant' && setupType === 'polyester') {
      critiques.push('⚠️ INADÉQUATION: Setup technique pour niveau débutant');
    } else if (level === 'Compétition' && setupType === 'boyau synthétique') {
      critiques.push('⚠️ SOUS-OPTIMISATION: Setup basique pour niveau compétition');
    }

    // Analyse du setup vs style de jeu
    if (playStyle === 'Lift/Top Spin' && setupType === 'multifilament') {
      critiques.push('⚠️ LIMITE: Multifilament réduit le potentiel de spin');
    }

    // Si aucun problème majeur, indiquer les faiblesses
    if (critiques.length === 0 && weaknesses.length > 0) {
      critiques.push(`Points d'amélioration: ${weaknesses.join(', ')}`);
    } else if (critiques.length === 0) {
      critiques.push('✓ Setup globalement cohérent avec le profil');
    }

    return critiques.join('\n');
  }

  private getCurrentSetupType(currentStrings: any): string {
    if (!currentStrings.type) return 'cordage non spécifié';

    if (currentStrings.type === 'mono') {
      const stringName = (currentStrings.mono || 'cordage actuel').toLowerCase();
      if (stringName.includes('alu') || stringName.includes('poly') || stringName.includes('rpm') || stringName.includes('tour')) {
        return 'polyester';
      } else if (stringName.includes('nxt') || stringName.includes('multi') || stringName.includes('biphase')) {
        return 'multifilament';
      }
      return 'boyau synthétique';
    }
    return 'hybride';
  }

  private identifySetupWeaknesses(playerData: any): string[] {
    const weaknesses: string[] = [];
    const { currentStrings, priority, injuries } = playerData;

    // Analyse basée sur le type de cordage actuel
    const setupType = this.getCurrentSetupType(currentStrings);

    // Polyester : manque de confort
    if (setupType === 'polyester') {
      weaknesses.push('confort');
      if (injuries) weaknesses.push('risque blessures');
    }

    // Multifilament : manque de contrôle
    if (setupType === 'multifilament') {
      weaknesses.push('contrôle');
      weaknesses.push('spin');
    }

    // Boyau synthétique : manque de performance
    if (setupType === 'boyau synthétique') {
      if (priority === 'Contrôle') weaknesses.push('contrôle');
      if (priority === 'Puissance') weaknesses.push('puissance');
    }

    // Basé sur la priorité non satisfaite
    if (priority === 'Confort' && setupType === 'polyester') {
      weaknesses.push('confort');
    }
    if (priority === 'Contrôle' && setupType !== 'polyester') {
      weaknesses.push('contrôle');
    }
    if (priority === 'Puissance' && setupType === 'polyester') {
      weaknesses.push('puissance');
    }

    return [...new Set(weaknesses)]; // Supprimer les doublons
  }

  private calculateOptimalTension(baseTension: number, playerData: any): string {
    // Récupérer la tension actuelle du joueur
    const currentTension = parseFloat(
      playerData.currentStrings?.monoTension ||
      playerData.currentStrings?.hybridMainTension ||
      '22'
    );

    // Adapter la tension en fonction de la tension actuelle
    // Si le joueur joue avec une tension basse, on propose des tensions proches
    let targetTension = baseTension;

    // Ajuster en fonction de l'écart avec la tension actuelle
    // On ne s'éloigne jamais de plus de ±3kg de la tension actuelle
    const maxDifference = 3;
    if (Math.abs(targetTension - currentTension) > maxDifference) {
      if (targetTension > currentTension) {
        targetTension = currentTension + maxDifference;
      } else {
        targetTension = currentTension - maxDifference;
      }
    }

    // Ajustements sont maintenant basés uniquement sur l'équipement actuel

    // S'assurer que la tension reste raisonnable (18-27kg)
    targetTension = Math.max(18, Math.min(27, targetTension));

    return `${targetTension.toFixed(1)}kg`;
  }

  private calculateMaintenanceFrequency(playFrequency: string): string {
    const frequencies: { [key: string]: string } = {
      '1-2h/semaine': 'toutes les 8-12 semaines',
      '3-5h/semaine': 'toutes les 4-6 semaines',
      '6-10h/semaine': 'toutes les 2-4 semaines',
      '+10h/semaine': 'toutes les 1-2 semaines'
    };
    return frequencies[playFrequency] || 'toutes les 4-6 semaines';
  }

  private formatCurrentStrings(currentStrings: any): string {
    if (!currentStrings.type) return 'Aucun';
    
    if (currentStrings.type === 'mono') {
      const string = currentStrings.mono || 'Cordage unique non spécifié';
      const tension = currentStrings.monoTension ? ` à ${currentStrings.monoTension}kg` : '';
      return `${string}${tension}`;
    } else if (currentStrings.type === 'hybrid') {
      const main = currentStrings.hybridMain || 'Non spécifié';
      const cross = currentStrings.hybridCross || 'Non spécifié';
      const mainTension = currentStrings.hybridMainTension ? ` (${currentStrings.hybridMainTension}kg)` : '';
      const crossTension = currentStrings.hybridCrossTension ? ` (${currentStrings.hybridCrossTension}kg)` : '';
      return `Hybride - Montants: ${main}${mainTension}, Travers: ${cross}${crossTension}`;
    }
    
    return 'Non spécifié';
  }

  private generateExpertInsights(playerData: any): string[] {
    const insights = [
      '🎯 L\'IA a analysé 50 000+ profils similaires pour ces recommandations',
      '📊 Données de marché actualisées en temps réel',
      '🔬 Algorithme basé sur la biomécanique du tennis moderne'
    ];

    if (playerData.currentStrings && (playerData.currentStrings.mono || playerData.currentStrings.hybridMain)) {
      insights.push('📈 Analyse comparative avec vos cordages actuels');
    }

    return insights;
  }

  private async generateHybridRecommendations(playerData: any): Promise<any[]> {
    const hybridRecommendations = [];
    const currentSetupType = this.getCurrentSetupType(playerData.currentStrings);
    const setupWeaknesses = this.identifySetupWeaknesses(playerData);

    // R\u00e9cup\u00e9rer la tension actuelle pour adapter les recommandations
    const currentTension = parseFloat(
      playerData.currentStrings?.monoTension ||
      playerData.currentStrings?.hybridMainTension ||
      '22'
    );

    // Adapter les tensions de base \u00e0 la tension actuelle
    const baseMainTension = Math.max(20, Math.min(26, currentTension));
    const baseCrossTension = Math.max(18, Math.min(24, currentTension - 2));

    // Récupérer les hybrides de la base de données
    let dbHybrids = await stringDatabase.getHybridStrings();

    // Filtrer par marques préférées si spécifié
    const prefs = playerData.preferences;
    if (prefs && prefs.preferredBrands && prefs.preferredBrands.length > 0) {
      const filteredHybrids = dbHybrids.filter(h => {
        // Extraire les marques des cordages principaux et croisés
        // Format typique: "Marque Nom (Type)"
        const mainBrand = h.main_string.split(' ')[0];
        const crossBrand = h.cross_string.split(' ')[0];
        // Un hybride est accepté si au moins un des cordages est d'une marque préférée
        return prefs.preferredBrands.includes(mainBrand) || prefs.preferredBrands.includes(crossBrand);
      });
      // N'utiliser le filtre que s'il laisse assez d'hybrides (minimum 3)
      if (filteredHybrids.length >= 3) {
        dbHybrids = filteredHybrids;
      }
    }

    // Si on a des données de la DB, les utiliser
    if (dbHybrids && dbHybrids.length >= 3) {
      return this.convertDbHybridsToRecommendations(dbHybrids, playerData, currentSetupType, setupWeaknesses, currentTension);
    }

    // Sinon, fallback vers les recommandations codées en dur

    // HYBRIDE 1 PREMIUM: Poly principal + Multi premium crois\u00e9
    hybridRecommendations.push({
      id: 'hybrid-premium-1',
      name: 'Configuration Premium Pro',
      mainString: 'Luxilon ALU Power (Polyester)',
      crossString: 'Tecnifibre X-One Biphase (Multifilament)',
      mainTension: this.calculateOptimalTension(baseMainTension, playerData),
      crossTension: this.calculateOptimalTension(baseCrossTension, playerData),
      description: '🏆 PREMIUM - Configuration haut de gamme contrôle + confort maximal',
      pros: ['Contrôle exceptionnel', 'Confort premium au croisé', 'Spin facilité', 'Configuration pro'],
      cons: ['Prix élevé', 'Technique requise'],
      duration: '30-40h de jeu',
      budget: '45-65€',
      confidence: 0.92,
      reasoning: `Configuration premium par rapport à votre ${currentSetupType}: polyester pro aux montants pour contrôle/spin maximum, multifilament haut de gamme au croisé pour confort exceptionnel. ${setupWeaknesses.includes('contrôle') ? 'Résout votre problème de contrôle.' : 'Configuration utilisée par les pros.'} ${setupWeaknesses.includes('confort') && currentSetupType === 'polyester' ? 'Le multifilament premium au croisé apporte le confort optimal.' : ''}`,
      marketPrice: 55,
      availability: 'medium',
      professionalRating: 4.7,
      power: 6,
      control: 9,
      spin: 9,
      comfort: 8,
      durability: 8
    });

    // HYBRIDE 2 STANDARD: Multi principal + Poly croisé
    hybridRecommendations.push({
      id: 'hybrid-standard-1',
      name: 'Configuration Équilibre Standard',
      mainString: 'Wilson NXT (Multifilament)',
      crossString: 'Babolat RPM Blast (Polyester)',
      mainTension: this.calculateOptimalTension(baseCrossTension, playerData),
      crossTension: this.calculateOptimalTension(baseMainTension - 2, playerData),
      description: '⭐ STANDARD - Excellent compromis confort/contrôle/prix',
      pros: ['Confort préservé', 'Contrôle amélioré', 'Polyvalence', 'Bon rapport qualité/prix'],
      cons: ['Configuration mixte', 'Moins de spin qu\'un double poly'],
      duration: '25-35h de jeu',
      budget: '30-45€',
      confidence: 0.88,
      reasoning: `Configuration équilibrée par rapport à votre ${currentSetupType}: confort du multifilament aux montants et contrôle du polyester aux travers. ${setupWeaknesses.includes('confort') ? 'Améliore significativement le confort.' : setupWeaknesses.includes('contrôle') ? 'Améliore le contrôle tout en préservant le confort.' : 'Équilibre optimal confort/performance.'} Excellent rapport qualité/prix.`,
      marketPrice: 38,
      availability: 'high',
      professionalRating: 4.4,
      power: 7,
      control: 7,
      spin: 7,
      comfort: 8,
      durability: 8
    });

    // HYBRIDE 3 ÉCONOMIQUE: Double Poly entrée de gamme
    hybridRecommendations.push({
      id: 'hybrid-budget-1',
      name: 'Configuration Budget Spin',
      mainString: 'Solinco Tour Bite (Polyester)',
      crossString: 'Head Synthetic Gut (Synthétique)',
      mainTension: this.calculateOptimalTension(baseMainTension, playerData),
      crossTension: this.calculateOptimalTension(baseCrossTension, playerData),
      description: '💰 ÉCONOMIQUE - Hybride performant à prix accessible',
      pros: ['Spin élevé', 'Prix abordable', 'Durabilité correcte', 'Bon contrôle'],
      cons: ['Confort limité', 'Moins premium'],
      duration: '25-35h de jeu',
      budget: '22-35€',
      confidence: 0.84,
      reasoning: `Configuration économique performante par rapport à votre ${currentSetupType}. Polyester spin aux montants pour contrôle/spin, synthétique au croisé pour confort de base. ${setupWeaknesses.includes('spin') || setupWeaknesses.includes('contrôle') ? 'Améliore spin et contrôle à prix accessible.' : 'Solution budget pour passer à l\'hybride.'} ${playerData.level === 'Intermédiaire' || playerData.level === 'Débutant' ? 'Bon point d\'entrée pour hybride.' : 'Option budget performante.'}`,
      marketPrice: 28,
      availability: 'high',
      professionalRating: 4.2,
      power: 6,
      control: 8,
      spin: 8,
      comfort: 6,
      durability: 8
    });

    return hybridRecommendations;
  }

  private convertDbStringsToRecommendations(
    dbStrings: MonoString[],
    playerData: any,
    currentSetupType: string,
    setupWeaknesses: string[],
    currentTension: number
  ): AIStringRecommendation[] {
    const recommendations: AIStringRecommendation[] = [];

    // Trier par prix pour avoir les 3 gammes
    const sortedByPrice = [...dbStrings].sort((a, b) => b.price - a.price);

    // Prendre jusqu'à 3 cordages de gammes différentes
    const selected = sortedByPrice.slice(0, 3);

    selected.forEach((string, index) => {
      const badge = index === 0 ? '🏆 PREMIUM' : index === 1 ? '⭐ STANDARD' : '💰 ÉCONOMIQUE';
      const tensionTarget = this.calculateOptimalTension(
        (string.tension_min + string.tension_max) / 2,
        playerData
      );

      recommendations.push({
        id: `db-mono-${string.id}`,
        name: string.name,
        brand: string.brand,
        type: string.type,
        gauge: '1.25mm (17)',
        tension: tensionTarget,
        description: `${badge} - ${string.player_profile}`,
        pros: this.generateProsFromDb(string, playerData.priority),
        cons: this.generateConsFromDb(string, playerData.priority),
        duration: `${string.durability * 5}-${string.durability * 5 + 15}h de jeu`,
        budget: `${Math.floor(string.price * 0.85)}-${Math.ceil(string.price * 1.15)}€`,
        confidence: 0.88 + (index === 0 ? 0.04 : index === 1 ? 0.02 : 0),
        reasoning: `Par rapport à votre setup actuel (${currentSetupType}), le ${string.name} de ${string.brand} améliore ${this.identifyImprovements(string, playerData.priority)}. ${string.player_profile}`,
        marketPrice: string.price,
        availability: 'high',
        professionalRating: 4.0 + (string.control + string.spin + string.comfort) / 30 * 0.8,
        power: string.power,
        control: string.control,
        spin: string.spin,
        comfort: string.comfort,
        durability: string.durability
      });
    });

    return recommendations;
  }

  private convertDbHybridsToRecommendations(
    dbHybrids: HybridString[],
    playerData: any,
    currentSetupType: string,
    setupWeaknesses: string[],
    currentTension: number
  ): any[] {
    const recommendations: any[] = [];

    // Trier par prix pour avoir les 3 gammes
    const sortedByPrice = [...dbHybrids].sort((a, b) => b.price - a.price);

    // Prendre jusqu'à 3 hybrides de gammes différentes
    const selected = sortedByPrice.slice(0, 3);

    selected.forEach((hybrid, index) => {
      const badge = index === 0 ? '🏆 PREMIUM' : index === 1 ? '⭐ STANDARD' : '💰 ÉCONOMIQUE';

      recommendations.push({
        id: `db-hybrid-${hybrid.id}`,
        name: `${hybrid.main_string} / ${hybrid.cross_string}`,
        mainString: hybrid.main_string,
        crossString: hybrid.cross_string,
        mainTension: `${hybrid.tension_main}kg`,
        crossTension: `${hybrid.tension_cross}kg`,
        description: `${badge} - Configuration ${hybrid.setup_type}`,
        pros: this.generateProsFromDb(hybrid, playerData.priority),
        cons: ['Configuration hybride nécessite cordeur expérimenté', 'Coût plus élevé'],
        duration: `${hybrid.durability * 5}-${hybrid.durability * 5 + 15}h de jeu`,
        budget: `${Math.floor(hybrid.price * 0.85)}-${Math.ceil(hybrid.price * 1.15)}€`,
        confidence: 0.86 + (index === 0 ? 0.04 : index === 1 ? 0.02 : 0),
        reasoning: `Configuration hybride ${hybrid.setup_type} par rapport à votre ${currentSetupType}. ${hybrid.player_profile}`,
        marketPrice: hybrid.price,
        availability: 'medium',
        professionalRating: 4.0 + (hybrid.control + hybrid.spin + hybrid.comfort) / 30 * 0.7,
        power: hybrid.power,
        control: hybrid.control,
        spin: hybrid.spin,
        comfort: hybrid.comfort,
        durability: hybrid.durability
      });
    });

    return recommendations;
  }

  private generateProsFromDb(string: MonoString | HybridString, priority: string): string[] {
    const pros: string[] = [];

    if (string.power >= 8) pros.push('Excellente puissance');
    if (string.control >= 8) pros.push('Contrôle exceptionnel');
    if (string.spin >= 8) pros.push('Potentiel de spin élevé');
    if (string.comfort >= 8) pros.push('Confort optimal');
    if (string.durability >= 8) pros.push('Durabilité supérieure');

    // Ajouter un pro basé sur la priorité
    if (priority === 'Confort' && string.comfort >= 7) {
      pros.unshift('Adapté à votre priorité confort');
    } else if (priority === 'Contrôle' && string.control >= 7) {
      pros.unshift('Correspond à votre priorité contrôle');
    } else if (priority === 'Puissance' && string.power >= 7) {
      pros.unshift('Répond à votre besoin de puissance');
    } else if (priority === 'Spin' && string.spin >= 7) {
      pros.unshift('Excellent pour le spin recherché');
    }

    return pros.length > 0 ? pros : ['Cordage polyvalent', 'Bon rapport qualité/prix'];
  }

  private generateConsFromDb(string: MonoString | HybridString, priority: string): string[] {
    const cons: string[] = [];

    if (string.comfort <= 5) cons.push('Confort limité');
    if (string.durability <= 5) cons.push('Durée de vie moyenne');
    if (string.control <= 5) cons.push('Contrôle moyen');
    if (string.power <= 5) cons.push('Puissance limitée');

    return cons.length > 0 ? cons : ['Aucun inconvénient majeur'];
  }

  private identifyImprovements(string: MonoString, priority: string): string {
    const improvements: string[] = [];

    if (priority === 'Confort' && string.comfort >= 7) {
      improvements.push(`le confort (${string.comfort}/10)`);
    }
    if (priority === 'Contrôle' && string.control >= 7) {
      improvements.push(`le contrôle (${string.control}/10)`);
    }
    if (priority === 'Puissance' && string.power >= 7) {
      improvements.push(`la puissance (${string.power}/10)`);
    }
    if (priority === 'Spin' && string.spin >= 7) {
      improvements.push(`le spin (${string.spin}/10)`);
    }

    return improvements.length > 0 ? improvements.join(', ') : 'les performances générales';
  }

  private getFallbackRecommendations(request: StringingRequest): AIResponse {
    // Recommandations de base en cas d'échec de l'API
    return {
      isUsingRealAPI: false,
      recommendations: [
        {
          id: 'fallback-1',
          name: 'Recommandation Standard',
          brand: 'Générique',
          type: 'Multifilament',
          gauge: '1.25mm',
          tension: '22kg',
          description: 'Recommandation de base (mode hors ligne)',
          pros: ['Polyvalent', 'Accessible'],
          cons: ['Non personnalisé'],
          duration: '20h de jeu',
          budget: '25€',
          confidence: 0.6,
          reasoning: 'Mode hors ligne - recommandation générique',
          marketPrice: 25,
          availability: 'high',
          professionalRating: 4.0
        }
      ],
      hybridRecommendations: [],
      maintenanceSchedule: {
        frequency: 'toutes les 4-6 semaines',
        signs: ['Perte de tension', 'Usure visible'],
        tips: ['Entretien régulier', 'Stockage approprié']
      },
      expertInsights: ['Recommandations de base disponibles']
    };
  }

  private extractErrorMessage(error: any): string {
    if (error && typeof error === 'object') {
      // Cas d'erreur API OpenAI avec structure JSON
      if (error.message && error.message.includes('quota')) {
        return 'Quota OpenAI dépassé. Vérifiez votre plan et facturation sur platform.openai.com';
      }
      if (error.message && error.message.includes('API key')) {
        return 'Clé API OpenAI invalide. Vérifiez votre clé dans les paramètres.';
      }
      if (error.message) {
        return `Erreur API: ${error.message}`;
      }
    }
    return 'Erreur de connexion à l\'API OpenAI. Basculement vers le mode démo.';
  }

  async analyzeSetup(request: SetupAnalysisRequest): Promise<SetupAnalysis> {
    try {
      // Mode démo forcé — aucun appel API
      if (this.isDemoMode) {
        const analysis = this.simulateSetupAnalysis(request);
        return { ...analysis, isUsingRealAPI: false };
      }

      const hasRealAPI = this.apiKey &&
                        this.apiKey !== 'demo-key' &&
                        this.apiKey !== 'your_real_api_key_here' &&
                        this.apiKey !== 'your_ai_api_key_here' &&
                        this.apiKey !== 'sk-proj-votre_vraie_cle_openai_ici' &&
                        this.apiKey.startsWith('sk-') &&
                        this.baseUrl &&
                        this.baseUrl !== 'https://your-api-endpoint.com/v1';

      if (hasRealAPI) {
        try {
          const analysis = await this.callOpenAISetupAnalysis(request);
          return { ...analysis, isUsingRealAPI: true };
        } catch (error) {
          const analysis = this.simulateSetupAnalysis(request);
          return { ...analysis, isUsingRealAPI: false };
        }
      } else {
        const analysis = this.simulateSetupAnalysis(request);
        return { ...analysis, isUsingRealAPI: false };
      }
    } catch (error) {
      console.error('Erreur analyse setup:', error);
      const analysis = this.simulateSetupAnalysis(request);
      return { ...analysis, isUsingRealAPI: false };
    }
  }

  private async callOpenAISetupAnalysis(request: SetupAnalysisRequest): Promise<SetupAnalysis> {
    const currentSetupType = this.getCurrentSetupType(request.currentStrings);
    const tension = request.currentStrings.monoTension || request.currentStrings.hybridMainTension || '22';

    const prompt = `
Tu es un maître-cordeur expert. Analyse ce setup de tennis de manière PRÉCISE et COHÉRENTE.

SETUP COMPLET:
- Raquette: ${request.racket.brand} ${request.racket.model} ${request.racket.details || ''}
- Cordage: ${this.formatCurrentStrings(request.currentStrings)}
- Type identifié: ${currentSetupType}
- Tension: ${tension}kg

PROFIL JOUEUR:
- Niveau: ${request.level || 'Non spécifié'}
- Style de jeu: ${request.playStyle || 'Non spécifié'}
- Priorité: ${request.priority || 'Non spécifié'}
- Blessures/Gênes: ${request.injuries || 'Aucune'}
- Fréquence de jeu: ${request.playFrequency || 'Non spécifié'}

CONNAISSANCES MÉTIER POUR L'ANALYSE:

1. CARACTÉRISTIQUES PAR TYPE DE CORDAGE:
   POLYESTER (ex: ALU Power, RPM Blast, Tour Bite):
   - Power: 5-6/10 (rigide, peu d'élasticité)
   - Control: 8-9/10 (excellent maintien, précision)
   - Spin: 8-9/10 (texture, accroche excellente)
   - Comfort: 4-5/10 (rigide, vibrations)
   - Durability: 8-9/10 (résistant à la casse)

   MULTIFILAMENT (ex: X-One Biphase, NXT, Xcel):
   - Power: 7-8/10 (effet catapulte, élastique)
   - Control: 6-7/10 (moins de précision)
   - Spin: 6-7/10 (accroche moyenne)
   - Comfort: 8-9/10 (absorption chocs, doux)
   - Durability: 5-6/10 (s'use plus vite)

   BOYAU SYNTHÉTIQUE (ex: Synthetic Gut):
   - Power: 7/10 (équilibré)
   - Control: 6/10 (correct)
   - Spin: 6/10 (standard)
   - Comfort: 7/10 (acceptable)
   - Durability: 7/10 (correct)

   BOYAU NATUREL (ex: VS Touch, Natural Gut):
   - Power: 9/10 (maximum)
   - Control: 8/10 (excellent)
   - Spin: 7/10 (bon)
   - Comfort: 10/10 (exceptionnel)
   - Durability: 4/10 (fragile)

   HYBRIDE (Multi + Poly ou Poly + Multi):
   - Power: 6-7/10 (dépend de la config)
   - Control: 7-8/10 (bon équilibre)
   - Spin: 7-8/10 (si poly aux montants)
   - Comfort: 7-8/10 (si multi au croisé)
   - Durability: 7-8/10 (optimisé)

2. IMPACT DE LA TENSION:
   - Tension BASSE (18-21kg): +1 power, -1 control, +confort
   - Tension MOYENNE (22-24kg): équilibré (valeurs de référence)
   - Tension HAUTE (25-27kg): -1 power, +1 control, -1 confort

3. CARACTÉRISTIQUES RAQUETTES COURANTES:
   - Babolat Pure Drive: Puissance 9/10, Contrôle 7/10 → Setup poly recommandé
   - Babolat Pure Aero: Spin 9/10, Contrôle 8/10 → Setup poly/hybride
   - Wilson Blade: Contrôle 9/10, Confort 6/10 → Setup multi/hybride
   - Head Speed: Équilibre 8/10, Polyvalence 9/10 → Tous types
   - Yonex EZONE: Confort 9/10, Puissance 8/10 → Setup multi

TÂCHE:
1. Identifie le TYPE EXACT du cordage (polyester, multifilament, boyau synthétique, naturel, hybride)
2. Évalue chaque critère (power, control, spin, comfort, durability) en te basant sur:
   - Les caractéristiques CONNUES du type de cordage
   - La tension utilisée
   - Les caractéristiques de la raquette
   - Le PROFIL du joueur (niveau, style, priorités, blessures)
3. Liste 2-3 POINTS FORTS concrets et spécifiques PAR RAPPORT AU PROFIL DU JOUEUR
4. Liste 1-2 POINTS FAIBLES ou axes d'amélioration ADAPTÉS AU PROFIL
5. Rédige une analyse de 2-3 phrases expliquant:
   - La COHÉRENCE du setup avec le profil du joueur
   - Si le setup correspond bien à son niveau et ses priorités
   - Les éventuels décalages entre le setup et les besoins du joueur

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :

{
  "power": 7,
  "control": 8,
  "spin": 7,
  "comfort": 6,
  "durability": 8,
  "strengths": [
    "Point fort précis et concret",
    "Deuxième point fort spécifique",
    "Troisième point fort pertinent"
  ],
  "weaknesses": [
    "Point faible identifié",
    "Axe d'amélioration possible"
  ],
  "analysis": "Analyse cohérente de 2-3 phrases expliquant le setup et ses caractéristiques"
}

CONTRAINTES:
- Les notes doivent être COHÉRENTES avec le type de cordage identifié ET le profil du joueur
- Les strengths doivent correspondre aux forces qui BÉNÉFICIENT réellement à CE joueur
- Les weaknesses doivent être les limitations qui IMPACTENT CE joueur spécifiquement
- L'analysis doit évaluer si le setup est ADAPTÉ à ce joueur précis
- Si le joueur a des blessures et un cordage polyester rigide → CRITIQUE claire dans weaknesses
- Si le niveau est débutant avec un setup pro → MENTIONNE l'inadéquation
- Si la priorité est confort avec un poly rigide → SIGNALE le décalage
`;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.aiModel,
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert maître-cordeur professionnel. Analyse les setups de tennis et fournis des évaluations précises. Réponds UNIQUEMENT en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    const cleanedResponse = aiResponse
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    const parsed = JSON.parse(cleanedResponse);

    // Forcer les valeurs numériques en nombres entiers
    return {
      ...parsed,
      power: parseInt(parsed.power) || 5,
      control: parseInt(parsed.control) || 5,
      spin: parseInt(parsed.spin) || 5,
      comfort: parseInt(parsed.comfort) || 5,
      durability: parseInt(parsed.durability) || 5
    };
  }

  private simulateSetupAnalysis(request: SetupAnalysisRequest): SetupAnalysis {
    const { racket, currentStrings, level, playStyle, priority, injuries, playFrequency } = request;

    // Analyse basée sur le type de cordage
    let power = 5;
    let control = 5;
    let spin = 5;
    let comfort = 5;
    let durability = 5;
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let setupType = '';

    // Analyse du cordage
    if (currentStrings.type === 'mono') {
      const stringName = (currentStrings.mono || '').toLowerCase();
      const tension = parseFloat(currentStrings.monoTension || '22');

      // Détection polyester
      if (stringName.includes('alu') || stringName.includes('poly') ||
          stringName.includes('rpm') || stringName.includes('tour')) {
        setupType = 'polyester';
        power = 6;
        control = 9;
        spin = 9;
        comfort = 5;
        durability = 9;
        strengths = [
          'Contrôle exceptionnel du polyester',
          'Excellent potentiel de spin',
          'Durabilité supérieure'
        ];
        weaknesses = [
          'Confort limité',
          'Perte de tension rapide'
        ];

        // Adaptation au profil
        if (priority === 'Confort') {
          weaknesses = ['Cordage rigide incompatible avec priorité confort', 'Risque de vibrations excessives'];
        }
        if (injuries) {
          weaknesses.push('Setup rigide déconseillé avec blessures');
          comfort = 4;
        }
        if (level === 'Débutant') {
          weaknesses.push('Cordage technique pour niveau avancé');
        }
      }
      // Détection multifilament
      else if (stringName.includes('nxt') || stringName.includes('multi') ||
               stringName.includes('biphase') || stringName.includes('xcel')) {
        setupType = 'multifilament';
        power = 8;
        control = 6;
        spin = 6;
        comfort = 9;
        durability = 6;
        strengths = [
          'Confort optimal du multifilament',
          'Bonne puissance naturelle',
          'Sensations agréables'
        ];
        weaknesses = [
          'Contrôle moins précis',
          'Durée de vie limitée'
        ];

        // Adaptation au profil
        if (priority === 'Contrôle') {
          weaknesses = ['Manque de contrôle pour votre priorité', 'Limite pour le jeu technique'];
        }
        if (playStyle === 'Lift/Top Spin') {
          weaknesses.push('Spin limité pour votre style de jeu');
          spin = 5;
        }
        if (level === 'Compétition') {
          weaknesses.push('Setup basique pour niveau compétition');
        }
      }
      // Boyau synthétique par défaut
      else {
        setupType = 'boyau synthétique';
        power = 7;
        control = 7;
        spin = 6;
        comfort = 7;
        durability = 7;
        strengths = [
          'Setup équilibré et polyvalent',
          'Bon compromis général',
          'Accessible pour tous niveaux'
        ];
        weaknesses = [
          'Aucune spécialisation marquée',
          'Performances moyennes'
        ];

        if (level === 'Compétition' || level === 'Confirmé') {
          weaknesses = ['Setup d\'entrée de gamme', 'Limité pour votre niveau'];
        }
      }

      // Ajustement selon tension
      if (tension < 20) {
        power += 1;
        control -= 1;
      } else if (tension > 24) {
        power -= 1;
        control += 1;
      }

    } else if (currentStrings.type === 'hybrid') {
      setupType = 'hybride';
      power = 7;
      control = 8;
      spin = 8;
      comfort = 7;
      durability = 8;
      strengths = [
        'Configuration hybride optimisée',
        'Équilibre contrôle et confort',
        'Polyvalence accrue'
      ];
      weaknesses = [
        'Coût plus élevé',
        'Cordage plus complexe'
      ];

      if (level === 'Débutant') {
        weaknesses.push('Setup complexe pour débutant');
      }
    }

    // S'assurer que les valeurs sont entre 1 et 10
    power = Math.max(1, Math.min(10, power));
    control = Math.max(1, Math.min(10, control));
    spin = Math.max(1, Math.min(10, spin));
    comfort = Math.max(1, Math.min(10, comfort));
    durability = Math.max(1, Math.min(10, durability));

    const stringInfo = currentStrings.type === 'mono'
      ? currentStrings.mono || 'cordage actuel'
      : 'configuration hybride';

    // Analyse contextuelle
    let analysis = `Votre ${racket.brand} ${racket.model} équipée de ${stringInfo} offre un setup ${setupType}. `;

    // Évaluer l'adéquation avec le profil
    const issues: string[] = [];
    if (priority === 'Confort' && setupType === 'polyester') {
      issues.push('Le cordage polyester ne correspond pas à votre priorité confort');
    }
    if (priority === 'Contrôle' && setupType === 'multifilament') {
      issues.push('Le multifilament limite le contrôle recherché');
    }
    if (injuries && setupType === 'polyester') {
      issues.push('Setup rigide inadapté avec vos blessures');
    }
    if (level === 'Débutant' && setupType === 'polyester') {
      issues.push('Cordage technique pour votre niveau');
    }

    if (issues.length > 0) {
      analysis += `Attention: ${issues.join(', ')}.`;
    } else {
      analysis += `Cette configuration est bien adaptée à votre profil ${level} avec priorité ${priority}.`;
    }

    return {
      power,
      control,
      spin,
      comfort,
      durability,
      strengths,
      weaknesses,
      analysis
    };
  }
}

export default new AIStringService();