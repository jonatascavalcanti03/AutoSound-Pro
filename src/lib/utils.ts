// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Converte valor linear (0-1) para decibéis */
export function linearToDb(linear: number): number {
  if (linear <= 0) return -Infinity
  return 20 * Math.log10(linear)
}

/** Converte decibéis para valor linear (0-1) */
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20)
}

/** Clamp um valor entre min e max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Normaliza um valor de [min,max] para [0,1] */
export function normalize(value: number, min: number, max: number): number {
  return clamp((value - min) / (max - min), 0, 1)
}

/** Desnormaliza um valor de [0,1] para [min,max] */
export function denormalize(normalized: number, min: number, max: number): number {
  return min + clamp(normalized, 0, 1) * (max - min)
}

/** Formata frequência em Hz ou kHz */
export function formatFrequency(hz: number): string {
  if (hz >= 1000) return `${(hz / 1000).toFixed(hz % 1000 === 0 ? 0 : 1)}k`
  return `${hz}`
}

/** Formata ganho em dB */
export function formatGain(db: number): string {
  const sign = db >= 0 ? '+' : ''
  return `${sign}${db.toFixed(1)} dB`
}

/** Formata milissegundos */
export function formatMs(ms: number): string {
  return `${ms.toFixed(1)} ms`
}

/** Arredonda para N casas decimais */
export function round(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
