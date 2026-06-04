import type { Season, TimeOfDay, Weather } from './types';

/** How the light falls — drives the direction, length and colour of cast shadows. */
export interface Light {
  /** Horizontal offset of the shadow (plant-local units, before scaling). */
  dx: number;
  /** Length multiplier for the shadow. */
  len: number;
  /** Shadow colour (rgba). */
  shadow: string;
}

export interface TimeTheme {
  label: string;
  emoji: string;
  /** SVG canvas background gradient. */
  bg: string;
  /** Colour of the soft light pools on the grass. */
  dapple: string;
  dappleOpacity: number;
  /** Full-screen mood wash laid over the whole scene (alpha colour or 'transparent'). */
  tint: string;
  /** Edge vignette colour. */
  vignette: string;
  celestial: 'sun' | 'moon' | null;
  /** Warm/cool glow colour of the celestial body. */
  glow: string;
  stars: boolean;
  fireflies: boolean;
  fog: boolean;
  rays: boolean;
  light: Light;
}

export const TIME_THEMES: Record<TimeOfDay, TimeTheme> = {
  day: {
    label: 'Day',
    emoji: '☀️',
    bg: 'radial-gradient(125% 95% at 50% 25%, #eafaef 0%, #d6f0d8 45%, #bfe6c4 78%, #a9dcb2 100%)',
    dapple: '#fffdf0',
    dappleOpacity: 0.32,
    tint: 'transparent',
    vignette: 'rgba(60,85,55,0.22)',
    celestial: 'sun',
    glow: 'rgba(255,246,200,0.9)',
    stars: false,
    fireflies: false,
    fog: false,
    rays: true,
    light: { dx: 5, len: 1.05, shadow: 'rgba(90,70,50,0.18)' },
  },
  golden: {
    label: 'Golden',
    emoji: '🌅',
    bg: 'radial-gradient(125% 95% at 50% 18%, #fff0cf 0%, #ffe0b6 32%, #ecd2a3 62%, #bfd6a6 100%)',
    dapple: '#fff1c4',
    dappleOpacity: 0.45,
    tint: 'rgba(255,170,70,0.14)',
    vignette: 'rgba(140,90,40,0.26)',
    celestial: 'sun',
    glow: 'rgba(255,210,120,0.95)',
    stars: false,
    fireflies: false,
    fog: false,
    rays: true,
    light: { dx: 22, len: 1.95, shadow: 'rgba(125,85,45,0.22)' },
  },
  dusk: {
    label: 'Dusk',
    emoji: '🌆',
    bg: 'radial-gradient(125% 95% at 50% 16%, #ffd9c2 0%, #e7b6c4 34%, #b69ccb 64%, #8f9cc0 100%)',
    dapple: '#ffd9b0',
    dappleOpacity: 0.36,
    tint: 'rgba(110,70,150,0.24)',
    vignette: 'rgba(60,40,90,0.34)',
    celestial: 'moon',
    glow: 'rgba(255,220,180,0.85)',
    stars: true,
    fireflies: true,
    fog: true,
    rays: false,
    light: { dx: -18, len: 1.7, shadow: 'rgba(75,55,95,0.22)' },
  },
  night: {
    label: 'Night',
    emoji: '🌙',
    bg: 'radial-gradient(125% 95% at 50% 14%, #2b3f6b 0%, #243657 40%, #1f3b46 72%, #1c3a36 100%)',
    dapple: '#bcd0ff',
    dappleOpacity: 0.18,
    tint: 'rgba(18,28,70,0.46)',
    vignette: 'rgba(8,12,40,0.5)',
    celestial: 'moon',
    glow: 'rgba(220,232,255,0.9)',
    stars: true,
    fireflies: true,
    fog: true,
    rays: false,
    light: { dx: 6, len: 1.0, shadow: 'rgba(35,45,95,0.30)' },
  },
};

export interface WeatherTheme {
  label: string;
  emoji: string;
  /** Extra atmospheric wash for the weather (or 'transparent'). */
  tint: string;
}

export const WEATHER_THEMES: Record<Weather, WeatherTheme> = {
  clear: { label: 'Clear', emoji: '☀️', tint: 'transparent' },
  rain: { label: 'Rain', emoji: '🌧️', tint: 'rgba(90,120,150,0.18)' },
  snow: { label: 'Snow', emoji: '❄️', tint: 'rgba(200,220,240,0.16)' },
  petals: { label: 'Petals', emoji: '🌸', tint: 'rgba(255,200,215,0.10)' },
};

export const TIME_ORDER: TimeOfDay[] = ['day', 'golden', 'dusk', 'night'];
export const WEATHER_ORDER: Weather[] = ['clear', 'rain', 'snow', 'petals'];

export interface SeasonTheme {
  label: string;
  emoji: string;
  /** Tree canopy layers: [main, left, right, top]. */
  canopy: [string, string, string, string];
  highlight: string;
  /** Trunk colour. */
  trunk: string;
  /** Little decorations on the canopy. */
  accent?: { color: string; kind: 'blossom' | 'berry' };
  /** Winter: draw snow caps on canopy + a snowy ground wash. */
  snowy: boolean;
  /** Ambient falling drift across the whole scene. */
  drift: 'leaves' | 'blossom' | 'snow' | 'none';
  /** Soft colour wash over the ground for the season (or 'transparent'). */
  ground: string;
}

export const SEASON_THEMES: Record<Season, SeasonTheme> = {
  spring: {
    label: 'Spring',
    emoji: '🌷',
    canopy: ['#8fd6a6', '#9fdcb1', '#86cf9c', '#a6e0b8'],
    highlight: '#c6eed3',
    trunk: '#b78a63',
    accent: { color: '#ffc2d6', kind: 'blossom' },
    snowy: false,
    drift: 'blossom',
    ground: 'transparent',
  },
  summer: {
    label: 'Summer',
    emoji: '🌞',
    canopy: ['#62b985', '#71c293', '#57b07c', '#7ecb9b'],
    highlight: '#9bdcb1',
    trunk: '#a87c5a',
    accent: { color: '#e2536a', kind: 'berry' },
    snowy: false,
    drift: 'none',
    ground: 'transparent',
  },
  autumn: {
    label: 'Autumn',
    emoji: '🍂',
    canopy: ['#e89a4a', '#e07b43', '#d2603a', '#f0b85e'],
    highlight: '#f7cf8c',
    trunk: '#9c6b48',
    snowy: false,
    drift: 'leaves',
    ground: 'rgba(206,132,64,0.12)',
  },
  winter: {
    label: 'Winter',
    emoji: '❄️',
    canopy: ['#9fc2af', '#abccb8', '#94b9a4', '#b6d3c1'],
    highlight: '#e2efe8',
    trunk: '#8f6f57',
    snowy: true,
    drift: 'snow',
    ground: 'rgba(236,243,251,0.26)',
  },
};

export const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];
