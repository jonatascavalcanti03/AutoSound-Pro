// src/lib/constants.ts

// ─── Frequências ISO 31-bandas ─────────────────────────────────────────────
export const ISO_FREQUENCIES_31: number[] = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160,
  200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600,
  2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000,
]

// ─── Frequências para EQ paramétrico (10 bandas) ──────────────────────────
export const PARAMETRIC_EQ_DEFAULT_FREQUENCIES: number[] = [
  32, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
]

// ─── Crossover slopes disponíveis ─────────────────────────────────────────
export const CROSSOVER_SLOPES = [12, 24, 48] as const

// ─── Limites de canal ─────────────────────────────────────────────────────
export const CHANNEL_GAIN_MIN_DB = -60
export const CHANNEL_GAIN_MAX_DB = 12
export const CHANNEL_DELAY_MIN_MS = 0
export const CHANNEL_DELAY_MAX_MS = 30

// ─── EQ limits ────────────────────────────────────────────────────────────
export const EQ_GAIN_MIN_DB = -24
export const EQ_GAIN_MAX_DB = 24
export const EQ_Q_MIN = 0.1
export const EQ_Q_MAX = 10.0
export const EQ_FREQ_MIN_HZ = 20
export const EQ_FREQ_MAX_HZ = 20000

// ─── Canvas / Rendering ───────────────────────────────────────────────────
export const SPECTRUM_FFT_SIZE = 2048
export const SPECTRUM_SMOOTHING = 0.8
export const ANIMATION_FPS = 60

// ─── Cores de canal (palette) ─────────────────────────────────────────────
export const CHANNEL_COLORS: string[] = [
  '#00D4FF',  // Electric Blue
  '#00FF88',  // Signal Green
  '#FF9500',  // Amber
  '#FF3B5C',  // Red
  '#BF5AF2',  // Purple
  '#FF6B35',  // Orange
  '#FFD60A',  // Yellow
  '#30D158',  // Green
]

// ─── Canais default (MVP: 4 in + 2 out) ──────────────────────────────────
export const DEFAULT_CHANNEL_COUNT = 4
export const DEFAULT_OUTPUT_COUNT  = 2

// ─── App ──────────────────────────────────────────────────────────────────
export const APP_NAME    = 'AutoSound Pro'
export const APP_VERSION = '0.1.0'
