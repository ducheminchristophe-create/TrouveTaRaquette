import { useEffect, useState } from 'react';
import themeConfig from '../theme.json';

export interface ThemeConfig {
  name?: string;
  version?: string;
  tokens?: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    fontSizes?: Record<string, string>;
    lineHeights?: Record<string, number>;
    radii?: Record<string, string>;
    spacing?: Record<string, string>;
    shadows?: Record<string, string>;
    container?: Record<string, string>;
  };
  colors?: {
    primary?: Record<string, string>;
    secondary?: Record<string, string>;
    accent?: Record<string, string>;
  };
  typography?: {
    fontFamily?: Record<string, string[]>;
    fontSize?: Record<string, string>;
  };
  spacing?: Record<string, string>;
  borderRadius?: Record<string, string>;
  shadows?: Record<string, string>;
}

const generateColorShades = (baseColor: string) => {
  return {
    50: baseColor,
    100: baseColor,
    200: baseColor,
    300: baseColor,
    400: baseColor,
    500: baseColor,
    600: baseColor,
    700: baseColor,
    800: baseColor,
    900: baseColor,
  };
};

export const useTheme = () => {
  const [theme] = useState<ThemeConfig>(themeConfig as ThemeConfig);

  useEffect(() => {
    const root = document.documentElement;

    // Vérifier si c'est le nouveau format (avec tokens)
    if (theme.tokens?.colors) {
      // Nouveau format - appliquer les couleurs simples à toutes les nuances
      Object.entries(theme.tokens.colors).forEach(([key, value]) => {
        const shades = generateColorShades(value);
        Object.entries(shades).forEach(([shade, color]) => {
          if (key === 'primary' || key === 'secondary' || key === 'accent') {
            root.style.setProperty(`--color-${key}-${shade}`, color);
          }
        });
        root.style.setProperty(`--color-${key}`, value);
      });

      // Polices
      if (theme.tokens.fonts) {
        Object.entries(theme.tokens.fonts).forEach(([key, value]) => {
          root.style.setProperty(`--font-${key}`, value);
        });
        root.style.setProperty('--font-sans', theme.tokens.fonts.body || theme.tokens.fonts.ui || 'system-ui');
        root.style.setProperty('--font-heading', theme.tokens.fonts.heading || 'system-ui');
      }

      // Border radius
      if (theme.tokens.radii) {
        Object.entries(theme.tokens.radii).forEach(([key, value]) => {
          root.style.setProperty(`--radius-${key}`, value);
        });
      }

      // Espacements
      if (theme.tokens.spacing) {
        Object.entries(theme.tokens.spacing).forEach(([key, value]) => {
          root.style.setProperty(`--spacing-${key}`, value);
        });
      }

      // Ombres
      if (theme.tokens.shadows) {
        Object.entries(theme.tokens.shadows).forEach(([key, value]) => {
          root.style.setProperty(`--shadow-${key}`, value);
        });
      }
    }
    // Ancien format (avec colors.primary comme objet)
    else if (theme.colors?.primary) {
      Object.entries(theme.colors.primary).forEach(([key, value]) => {
        root.style.setProperty(`--color-primary-${key}`, value);
      });

      if (theme.colors.secondary) {
        Object.entries(theme.colors.secondary).forEach(([key, value]) => {
          root.style.setProperty(`--color-secondary-${key}`, value);
        });
      }

      if (theme.colors.accent) {
        Object.entries(theme.colors.accent).forEach(([key, value]) => {
          root.style.setProperty(`--color-accent-${key}`, value);
        });
      }

      if (theme.typography?.fontFamily) {
        if (theme.typography.fontFamily.sans) {
          root.style.setProperty('--font-sans', theme.typography.fontFamily.sans.join(', '));
        }
        if (theme.typography.fontFamily.heading) {
          root.style.setProperty('--font-heading', theme.typography.fontFamily.heading.join(', '));
        }
      }

      if (theme.spacing) {
        Object.entries(theme.spacing).forEach(([key, value]) => {
          root.style.setProperty(`--spacing-${key}`, value);
        });
      }

      if (theme.borderRadius) {
        Object.entries(theme.borderRadius).forEach(([key, value]) => {
          root.style.setProperty(`--radius-${key}`, value);
        });
      }
    }
  }, [theme]);

  return { theme };
};
