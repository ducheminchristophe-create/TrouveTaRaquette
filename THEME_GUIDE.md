# Guide de Personnalisation du Thème

Ce projet utilise un système de thème personnalisable via JSON. Vous pouvez modifier l'apparence complète de l'application en éditant le fichier `src/theme.json`.

## 📁 Fichier de Configuration

Le fichier `src/theme.json` contient toute la configuration du thème.

## 🎨 Sections Configurables

### 1. Couleurs

Définissez vos palettes de couleurs avec 10 nuances (50-900) :

```json
{
  "colors": {
    "primary": {
      "50": "#f0f9ff",
      "100": "#e0f2fe",
      // ... jusqu'à 900
    },
    "secondary": { /* ... */ },
    "accent": { /* ... */ }
  }
}
```

**Utilisation dans le code :**
- `bg-primary-500` : Fond avec la couleur primaire
- `text-secondary-700` : Texte avec la couleur secondaire
- `border-accent-300` : Bordure avec la couleur accent

### 2. Typographie

Configurez les polices et tailles de texte :

```json
{
  "typography": {
    "fontFamily": {
      "sans": ["Inter", "system-ui", "sans-serif"],
      "heading": ["Poppins", "sans-serif"],
      "mono": ["Fira Code", "monospace"]
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      // ...
    }
  }
}
```

**Utilisation dans le code :**
- `font-sans` : Police par défaut
- `font-heading` : Police pour les titres
- `text-xl` : Taille de texte

### 3. Espacements

Définissez les espacements personnalisés :

```json
{
  "spacing": {
    "containerPadding": "1.5rem",
    "sectionGap": "4rem",
    "cardGap": "1.5rem"
  }
}
```

### 4. Border Radius

Contrôlez l'arrondi des coins :

```json
{
  "borderRadius": {
    "sm": "0.375rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "2xl": "1.5rem"
  }
}
```

**Utilisation dans le code :**
- `rounded-lg` : Coins arrondis
- `rounded-xl` : Coins très arrondis

### 5. Ombres

Définissez les ombres portées :

```json
{
  "shadows": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)"
  }
}
```

## 🚀 Exemples de Thèmes Prêts à l'Emploi

### Thème Tennis Classique (Vert/Blanc)

```json
{
  "colors": {
    "primary": {
      "50": "#f0fdf4",
      "100": "#dcfce7",
      "200": "#bbf7d0",
      "300": "#86efac",
      "400": "#4ade80",
      "500": "#22c55e",
      "600": "#16a34a",
      "700": "#15803d",
      "800": "#166534",
      "900": "#14532d"
    }
  }
}
```

### Thème Moderne (Bleu/Orange)

```json
{
  "colors": {
    "primary": {
      "500": "#3b82f6",
      "600": "#2563eb",
      "700": "#1d4ed8"
    },
    "accent": {
      "500": "#f97316",
      "600": "#ea580c",
      "700": "#c2410c"
    }
  }
}
```

### Thème Élégant (Noir/Or)

```json
{
  "colors": {
    "primary": {
      "50": "#fafaf9",
      "500": "#78716c",
      "900": "#1c1917"
    },
    "accent": {
      "500": "#fbbf24",
      "600": "#f59e0b",
      "700": "#d97706"
    }
  }
}
```

## 🔄 Changement de Thème en Temps Réel

Le hook `useTheme()` permet de changer le thème dynamiquement :

```typescript
import { useTheme } from './hooks/useTheme';

function MonComposant() {
  const { theme, updateTheme } = useTheme();

  const changerEnModeSombre = () => {
    updateTheme({
      colors: {
        primary: {
          500: '#1e293b',
          600: '#0f172a',
          // ...
        }
      }
    });
  };

  return <button onClick={changerEnModeSombre}>Mode Sombre</button>;
}
```

## 📝 Notes Importantes

1. **Variables CSS** : Le système utilise des variables CSS (`--color-primary-500`) qui sont appliquées automatiquement
2. **Valeurs par défaut** : Si une valeur n'est pas définie, Tailwind utilisera sa valeur par défaut
3. **Rechargement** : Après modification du `theme.json`, le navigateur rechargera automatiquement
4. **Build** : Les changements sont pris en compte lors du build de production

## 🎯 Pour Appliquer un Nouveau Thème

1. Éditez `src/theme.json`
2. Modifiez les valeurs souhaitées
3. Sauvegardez le fichier
4. Le thème est appliqué automatiquement !

## 🛠️ Outils Utiles

- [Coolors.co](https://coolors.co/) : Générateur de palettes de couleurs
- [Realtime Colors](https://www.realtimecolors.com/) : Visualiser les couleurs en temps réel
- [Google Fonts](https://fonts.google.com/) : Bibliothèque de polices gratuites
