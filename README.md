# Tennis String Advisor - IA Enhanced

Application de conseil en cordage de tennis avec intelligence artificielle.

## 🚀 Configuration API

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_AI_API_KEY=your_api_key_here
VITE_AI_API_URL=https://your-api-endpoint.com/v1
```

### 2. Format API attendu

Votre API doit accepter une requête POST sur `/string-recommendations` avec ce format :

```json
{
  "player_profile": {
    "racket": { "model": "Babolat Pure Drive" },
    "playStyle": "Lift/Top Spin",
    "priority": "Contrôle",
    "level": "Confirmé",
    "injuries": "coude",
    "previousStrings": "Luxilon Big Banger",
    "budget": "30-50€",
    "playFrequency": "3-5h/semaine"
  },
  "request_type": "tennis_string_recommendation",
  "language": "fr",
  "max_recommendations": 3
}
```

### 3. Format de réponse attendu

```json
{
  "recommendations": [
    {
      "id": "rec-1",
      "name": "Luxilon ALU Power",
      "brand": "Luxilon",
      "type": "Co-polyester",
      "gauge": "1.25mm",
      "tension": "24kg",
      "description": "Cordage de contrôle premium",
      "pros": ["Contrôle exceptionnel", "Durabilité"],
      "cons": ["Confort réduit"],
      "duration": "25-40h",
      "budget": "18-28€",
      "confidence": 0.95,
      "reasoning": "Optimal pour votre profil",
      "marketPrice": 22,
      "availability": "high",
      "professionalRating": 4.8
    }
  ],
  "maintenance": {
    "frequency": "toutes les 4-6 semaines",
    "warning_signs": ["Perte de tension", "Usure visible"],
    "tips": ["Alternez les raquettes", "Stockage approprié"]
  },
  "ai_insights": [
    "Analyse basée sur 50 000+ profils similaires",
    "Recommandations personnalisées"
  ]
}
```

## 🔧 Développement

```bash
# Installation
npm install

# Développement
npm run dev

# Build
npm run build
```

## 📝 Notes

- En mode démo (sans API key), l'application utilise des données simulées
- Avec une vraie API key, elle bascule automatiquement en mode production
- Le système de fallback garantit le fonctionnement même en cas d'erreur API