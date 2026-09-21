/** Tokens de design "Placar de academia" (docs/design-telas.md §2). Única fonte de valores visuais. */
export const colors = {
  bg: '#0E0F0C',
  surface: '#181A15',
  surfaceRaised: '#22251D',
  border: '#2E3227',
  text: '#F2F4EA',
  textSecondary: '#A9AD9A',
  textMuted: '#7C8070',
  accent: '#C6F24E',
  onAccent: '#0E0F0C',
  danger: '#FF6B5E',
  focus: '#F2F4EA',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 14, lg: 24 } as const;

export const sizes = { toggle: 44, touch: 48, row: 56, button: 56, maxContent: 600 } as const;

export const typography = {
  title: { fontSize: 28, lineHeight: 32, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '500' as const },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
} as const;

export const motion = { durationMs: 150 } as const;
