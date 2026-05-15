// src/types/preset.types.ts
import type { AudioSystemConfig } from './audio.types'

export interface Preset {
  readonly id:  string
  name:         string
  description:  string
  vehicleName:  string
  config:       AudioSystemConfig
  createdAt:    string   // ISO 8601
  updatedAt:    string
  isFavorite:   boolean
  tags:         string[]
}

export interface PresetSlot {
  index:     number   // 1 – 20 (slots rápidos)
  presetId:  string | null
  label:     string
}
