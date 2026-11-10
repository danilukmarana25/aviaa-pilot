/**
 * AviaaPilot theme — preset DARK_PREMIUM.
 * Only the two accent colours are overridden to the Aviator identity:
 * signal red #E63946 (primary action) + runway amber #F4A62A (progress / gold).
 */
export const THEME = {
  name: 'DARK_PREMIUM',

  colors: {
    bg: {
      primary: '#111114',
      secondary: '#18181C',
      tertiary: '#1F1F24',
      accent: '#252530',
    },
    accent: {
      primary: '#E63946', // override — signal red
      secondary: '#F4A62A', // override — runway amber
      warm: '#FD79A8',
      cool: '#74B9FF',
      success: '#55EFC4',
    },
    text: {
      primary: '#F5F5F7',
      secondary: '#C9C9D2',
      accent: '#F4A62A',
      muted: '#6E6E7A',
    },
    ui: {
      border: 'rgba(255,255,255,0.08)',
      borderStrong: 'rgba(255,255,255,0.14)',
      divider: '#222228',
      overlay: 'rgba(10,10,14,0.55)',
      glass: 'rgba(24,24,28,0.86)',
      glassLine: 'rgba(255,255,255,0.10)',
      track: 'rgba(255,255,255,0.08)',
    },
  },

  gradients: {
    primary: ['#E63946', '#B22C38'] as const,
    surface: ['#18181C', '#1F1F24'] as const,
    reward: ['#F4A62A', '#C9821B'] as const,
    header: ['#111114', '#18181C'] as const,
    loader: ['rgba(5,5,8,0.94)', 'rgba(17,17,20,0.88)', 'rgba(5,5,8,0.97)'] as const,
    menu: ['rgba(17,17,20,0.72)', 'rgba(31,31,36,0.58)', 'rgba(17,17,20,0.92)'] as const,
    game: ['rgba(10,10,14,0.55)', 'rgba(17,17,20,0.80)'] as const,
    result: ['rgba(17,17,20,0.92)', 'rgba(31,31,36,0.86)'] as const,
    panel: ['rgba(17,17,20,0.86)', 'rgba(31,31,36,0.82)'] as const,
    tile: ['#18181C', '#1F1F24'] as const,
    progress: ['#E63946', '#F4A62A'] as const,
  },

  typography: {
    hero: { fontSize: 38, fontWeight: '800' as const, letterSpacing: 5 },
    title: { fontSize: 26, fontWeight: '700' as const, letterSpacing: 2 },
    section: { fontSize: 18, fontWeight: '700' as const, letterSpacing: 1.5 },
    body: { fontSize: 15, fontWeight: '500' as const, lineHeight: 21 },
    caption: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 2 },
    button: { fontSize: 17, fontWeight: '800' as const, letterSpacing: 2.5 },
    score: {
      fontSize: 44,
      fontWeight: '800' as const,
      fontVariant: ['tabular-nums'] as const,
    },
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },

  radius: { sm: 8, md: 14, lg: 18, xl: 22, pill: 100 },

  shadows: {
    tile: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 8,
    },
    bar: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 18,
      elevation: 12,
    },
    cta: {
      shadowColor: '#E63946',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 12,
    },
    amber: {
      shadowColor: '#F4A62A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
  },

  animation: {
    press: { tension: 180, friction: 12 },
    lane: { tension: 150, friction: 11 },
    disc: { tension: 170, friction: 11 },
    fade: 180,
    fadeLoader: 220,
    fadeReduced: 90,
  },
};

export type Theme = typeof THEME;
export default THEME;
