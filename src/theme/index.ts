/**
 * Theme Configuration
 * Material Design 3 inspired themes
 */

export const themes = {
  dark: {
    name: 'dark' as const,
    label: 'Dark',
    colors: {
      bg: '#0a0a0f',
      bgSecondary: '#12121a',
      bgTertiary: '#1a1a25',
      surface: '#1e1e2e',
      border: '#2a2a3a',
      text: '#ffffff',
      textSecondary: '#a0a0b0',
      textMuted: '#606070',
      primary: '#6366f1',
      primaryText: '#ffffff',
      secondary: '#8b5cf6',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
      accent: '#06b6d4',
    },
  },
  light: {
    name: 'light' as const,
    label: 'Light',
    colors: {
      bg: '#ffffff',
      bgSecondary: '#f8f9fa',
      bgTertiary: '#f0f1f3',
      surface: '#ffffff',
      border: '#e0e0e0',
      text: '#1a1a2e',
      textSecondary: '#4a4a5a',
      textMuted: '#8a8a9a',
      primary: '#6366f1',
      primaryText: '#ffffff',
      secondary: '#8b5cf6',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
      accent: '#06b6d4',
    },
  },
  system: {
    name: 'system' as const,
    label: 'System',
    colors: {
      bg: '#0a0a0f',
      bgSecondary: '#12121a',
      bgTertiary: '#1a1a25',
      surface: '#1e1e2e',
      border: '#2a2a3a',
      text: '#ffffff',
      textSecondary: '#a0a0b0',
      textMuted: '#606070',
      primary: '#6366f1',
      primaryText: '#ffffff',
      secondary: '#8b5cf6',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
      accent: '#06b6d4',
    },
  },
} as const;

export type ThemeName = keyof typeof themes;

export function getThemeColors(themeName: ThemeName) {
  return themes[themeName].colors;
}
