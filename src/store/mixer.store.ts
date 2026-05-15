'use client'
// src/store/mixer.store.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist, createJSONStorage } from 'zustand/middleware'
import { idbStorage } from '@/lib/idb'
import type { Channel, Decibels, Milliseconds } from '@/types/audio.types'
import { AudioEventBus, AudioEventType } from '@/audio/AudioEventBus'
import {
  CHANNEL_COLORS,
  CHANNEL_GAIN_MIN_DB,
  CHANNEL_GAIN_MAX_DB,
  CHANNEL_DELAY_MIN_MS,
  CHANNEL_DELAY_MAX_MS,
  PARAMETRIC_EQ_DEFAULT_FREQUENCIES,
} from '@/lib/constants'
import { clamp } from '@/lib/utils'
import { nanoid } from '@/lib/nanoid'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function createDefaultChannel(index: number): Channel {
  return {
    id:      nanoid(),
    name:    `CH ${index + 1}`,
    gainDb:  0,
    muted:   false,
    soloed:  false,
    phase:   false,
    delayMs: 0,
    panLR:   0,
    color:   CHANNEL_COLORS[index % CHANNEL_COLORS.length] ?? '#00D4FF',
    eq:      PARAMETRIC_EQ_DEFAULT_FREQUENCIES.map((freq, i) => ({
      id:        nanoid(),
      frequency: freq,
      gain:      0,
      q:         1.0,
      type:      i === 0 ? 'highshelf' : i === PARAMETRIC_EQ_DEFAULT_FREQUENCIES.length - 1 ? 'lowshelf' : 'peaking',
      enabled:   true,
    })),
    crossover: {
      highpassEnabled: false,
      highpassFreq:    80,
      highpassSlope:   24,
      lowpassEnabled:  false,
      lowpassFreq:     20000,
      lowpassSlope:    24,
    },
  }
}

// ─── State ───────────────────────────────────────────────────────────────────
interface MixerState {
  channels:      Channel[]
  masterGainDb:  Decibels
  soloActive:    boolean
  activeChannelId: string | null
}

// ─── Actions ─────────────────────────────────────────────────────────────────
interface MixerActions {
  setChannelGain:    (id: string, db: Decibels) => void
  setChannelDelay:   (id: string, ms: Milliseconds) => void
  setChannelPan:     (id: string, pan: number) => void
  setChannelName:    (id: string, name: string) => void
  toggleMute:        (id: string) => void
  toggleSolo:        (id: string) => void
  togglePhase:       (id: string) => void
  setMasterGain:     (db: Decibels) => void
  setActiveChannel:  (id: string | null) => void
  resetChannel:      (id: string) => void
  addChannel:        () => void
  removeChannel:     (id: string) => void
  setEQBandGain:     (channelId: string, bandId: string, gain: Decibels) => void
  setEQBandFreq:     (channelId: string, bandId: string, freq: number) => void
  setEQBandQ:        (channelId: string, bandId: string, q: number) => void
  toggleEQBand:      (channelId: string, bandId: string) => void
  setCrossoverHP:    (channelId: string, freq: number, enabled: boolean) => void
  setCrossoverLP:    (channelId: string, freq: number, enabled: boolean) => void
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useMixerStore = create<MixerState & MixerActions>()(
  persist(
    immer((set) => ({
    // State
    channels:        Array.from({ length: 4 }, (_, i) => createDefaultChannel(i)),
    masterGainDb:    0,
    soloActive:      false,
    activeChannelId: null,

    // Actions
    setChannelGain: (id, db) => set((s) => {
      const ch = s.channels.find(c => c.id === id)
      if (ch) {
        ch.gainDb = clamp(db, CHANNEL_GAIN_MIN_DB, CHANNEL_GAIN_MAX_DB)
        AudioEventBus.emit(AudioEventType.CHANNEL_GAIN, { channelId: id, value: ch.gainDb })
      }
    }),

    setChannelDelay: (id, ms) => set((s) => {
      const ch = s.channels.find(c => c.id === id)
      if (ch) ch.delayMs = clamp(ms, CHANNEL_DELAY_MIN_MS, CHANNEL_DELAY_MAX_MS)
    }),

    setChannelPan: (id, pan) => set((s) => {
      const ch = s.channels.find(c => c.id === id)
      if (ch) ch.panLR = clamp(pan, -1, 1)
    }),

    setChannelName: (id, name) => set((s) => {
      const ch = s.channels.find(c => c.id === id)
      if (ch) ch.name = name
    }),

    toggleMute: (id) => set((s) => {
      const ch = s.channels.find(c => c.id === id)
      if (ch) {
        ch.muted = !ch.muted
        AudioEventBus.emit(AudioEventType.CHANNEL_MUTE, { channelId: id, value: ch.muted })
      }
    }),

    toggleSolo: (id) => set((s) => {
      const ch = s.channels.find(c => c.id === id)
      if (ch) {
        ch.soloed = !ch.soloed
        s.soloActive = s.channels.some(c => c.soloed)
        AudioEventBus.emit(AudioEventType.CHANNEL_SOLO, { channelId: id, value: ch.soloed })
      }
    }),

    togglePhase: (id) => set((s) => {
      const ch = s.channels.find(c => c.id === id)
      if (ch) {
        ch.phase = !ch.phase
        AudioEventBus.emit(AudioEventType.CHANNEL_PHASE, { channelId: id, value: ch.phase })
      }
    }),

    setMasterGain: (db) => set((s) => {
      s.masterGainDb = clamp(db, CHANNEL_GAIN_MIN_DB, CHANNEL_GAIN_MAX_DB)
      AudioEventBus.emit(AudioEventType.MASTER_GAIN, { value: s.masterGainDb })
    }),

    setActiveChannel: (id) => set((s) => {
      s.activeChannelId = id
    }),

    resetChannel: (id) => set((s) => {
      const idx = s.channels.findIndex(c => c.id === id)
      if (idx !== -1) s.channels[idx] = createDefaultChannel(idx)
    }),

    addChannel: () => set((s) => {
      if (s.channels.length < 8) {
        s.channels.push(createDefaultChannel(s.channels.length))
      }
    }),

    removeChannel: (id) => set((s) => {
      s.channels = s.channels.filter(c => c.id !== id)
      if (s.activeChannelId === id) s.activeChannelId = null
    }),

    setEQBandGain: (channelId, bandId, gain) => set((s) => {
      const band = s.channels.find(c => c.id === channelId)?.eq.find(b => b.id === bandId)
      if (band) {
        band.gain = clamp(gain, -24, 24)
        AudioEventBus.emit(AudioEventType.EQ_GAIN, { channelId, bandId, value: band.gain })
      }
    }),

    setEQBandFreq: (channelId, bandId, freq) => set((s) => {
      const band = s.channels.find(c => c.id === channelId)?.eq.find(b => b.id === bandId)
      if (band) {
        band.frequency = clamp(freq, 20, 20000)
        AudioEventBus.emit(AudioEventType.EQ_FREQ, { channelId, bandId, value: band.frequency })
      }
    }),

    setEQBandQ: (channelId, bandId, q) => set((s) => {
      const band = s.channels.find(c => c.id === channelId)?.eq.find(b => b.id === bandId)
      if (band) {
        band.q = clamp(q, 0.1, 10)
        AudioEventBus.emit(AudioEventType.EQ_Q, { channelId, bandId, value: band.q })
      }
    }),

    toggleEQBand: (channelId, bandId) => set((s) => {
      const band = s.channels.find(c => c.id === channelId)?.eq.find(b => b.id === bandId)
      if (band) {
        band.enabled = !band.enabled
        AudioEventBus.emit(AudioEventType.EQ_TOGGLE, { channelId, bandId, value: band.enabled })
      }
    }),

    setCrossoverHP: (channelId, freq, enabled) => set((s) => {
      const ch = s.channels.find(c => c.id === channelId)
      if (ch) {
        ch.crossover.highpassFreq    = freq
        ch.crossover.highpassEnabled = enabled
        AudioEventBus.emit(AudioEventType.CROSSOVER_HP_FREQ, { channelId, value: freq })
        AudioEventBus.emit(AudioEventType.CROSSOVER_HP_TOGGLE, { channelId, value: enabled })
      }
    }),

    setCrossoverLP: (channelId, freq, enabled) => set((s) => {
      const ch = s.channels.find(c => c.id === channelId)
      if (ch) {
        ch.crossover.lowpassFreq    = freq
        ch.crossover.lowpassEnabled = enabled
        AudioEventBus.emit(AudioEventType.CROSSOVER_LP_FREQ, { channelId, value: freq })
        AudioEventBus.emit(AudioEventType.CROSSOVER_LP_TOGGLE, { channelId, value: enabled })
      }
    })
  })),
  {
      name: 'autosound-pro-state', // Cofre no IndexedDB
      version: 1, // Para futuras State Migrations
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ 
        channels: state.channels, 
        masterGainDb: state.masterGainDb 
      }), // Persiste apenas dados estruturais
    }
  )
)

// ─── Selectors atômicos (use estes, não desestruture o store inteiro) ─────────
export const selectChannel         = (id: string) => (s: MixerState) => s.channels.find(c => c.id === id)
export const selectChannelGain     = (id: string) => (s: MixerState) => s.channels.find(c => c.id === id)?.gainDb ?? 0
export const selectChannelMuted    = (id: string) => (s: MixerState) => s.channels.find(c => c.id === id)?.muted ?? false
export const selectChannelSoloed   = (id: string) => (s: MixerState) => s.channels.find(c => c.id === id)?.soloed ?? false
export const selectActiveChannelId = (s: MixerState) => s.activeChannelId
export const selectAllChannels     = (s: MixerState) => s.channels
export const selectMasterGain      = (s: MixerState) => s.masterGainDb
