// src/types/audio.types.ts

// ─── Branded primitives ───────────────────────────────────────────────────────
export type Decibels        = number
export type Hertz           = number
export type Milliseconds    = number
export type NormalizedValue = number  // 0.0 → 1.0

// ─── Filter ──────────────────────────────────────────────────────────────────
export type FilterType =
  | 'peaking'
  | 'lowshelf'
  | 'highshelf'
  | 'lowpass'
  | 'highpass'
  | 'notch'
  | 'allpass'

export type CrossoverSlope = 12 | 24 | 48  // dB/octave (LR2, LR4, LR8)

// ─── EQ ──────────────────────────────────────────────────────────────────────
export interface EQBand {
  readonly id: string
  frequency:   Hertz       // 20 – 20000
  gain:        Decibels    // -24 → +24
  q:           number      // 0.1 → 10.0
  type:        FilterType
  enabled:     boolean
}

// ─── Crossover ───────────────────────────────────────────────────────────────
export interface CrossoverConfig {
  highpassEnabled: boolean
  highpassFreq:    Hertz
  highpassSlope:   CrossoverSlope
  lowpassEnabled:  boolean
  lowpassFreq:     Hertz
  lowpassSlope:    CrossoverSlope
}

// ─── Channel ─────────────────────────────────────────────────────────────────
export interface Channel {
  readonly id: string
  name:        string
  gainDb:      Decibels      // -60 → +12
  muted:       boolean
  soloed:      boolean
  phase:       boolean       // false = 0°, true = 180°
  delayMs:     Milliseconds  // 0 → 30
  panLR:       number        // -1 (L) → +1 (R)
  eq:          EQBand[]
  crossover:   CrossoverConfig
  color:       string        // hex, para identificação visual
}

// ─── Routing ─────────────────────────────────────────────────────────────────
export type RoutingMatrix = Record<string, string[]>  // inputId → outputId[]

// ─── System Config ───────────────────────────────────────────────────────────
export type SampleRate = 44100 | 48000 | 96000

export interface AudioSystemConfig {
  channels:    Channel[]
  masterGainDb: Decibels
  routing:     RoutingMatrix
  sampleRate:  SampleRate
}

// ─── Engine State ─────────────────────────────────────────────────────────────
export type AudioEngineStatus =
  | 'idle'
  | 'activating'
  | 'running'
  | 'suspended'
  | 'error'

export interface AudioEngineState {
  status:     AudioEngineStatus
  sampleRate: SampleRate
  latencyMs:  Milliseconds
  cpuLoad:    NormalizedValue  // 0 → 1
  errorMessage?: string
}
