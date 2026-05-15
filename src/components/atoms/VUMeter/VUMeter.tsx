'use client'
// src/components/atoms/VUMeter/VUMeter.tsx
import React, { useRef, useEffect, useCallback } from 'react'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { cn } from '@/lib/utils'
import type { VUMeterProps } from './VUMeter.types'

import { AudioEngine } from '@/audio/AudioEngine'

// ─── Segmentos de cor por zona ────────────────────────────────────────────────
const SEGMENTS = [
  { threshold: 0.85, color: '#FF3B5C' },   // Clip  (>-3dB)
  { threshold: 0.70, color: '#FF9500' },   // Hot   (-6 a -3dB)
  { threshold: 0.00, color: '#00FF88' },   // Good  (<-6dB)
] as const

function getSegmentColor(normalized: number): string {
  for (const seg of SEGMENTS) {
    if (normalized >= seg.threshold) return seg.color
  }
  return SEGMENTS[SEGMENTS.length - 1]?.color ?? '#00FF88'
}

export function VUMeter({
  level = 0,
  channelId,
  isMaster,
  peakLevel,
  orientation = 'vertical',
  width,
  height,
  showPeak = true,
  showScale = false,
  label,
  active = true,
  className,
}: VUMeterProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const peakRef    = useRef<number>(0)
  const peakHoldRef= useRef<number>(0)  // timestamp em ms


  // ─── Render imperativo ────────────────────────────────────────────────────
  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const isVert = orientation === 'vertical'
    const BAR_W  = isVert ? W : H
    const BAR_H  = isVert ? H : W

    // Busca nível real se configurado
    let currentLevel = level
    if (isMaster) currentLevel = AudioEngine.getMasterLevel()
    else if (channelId) currentLevel = AudioEngine.getChannelLevel(channelId)

    // Lida com Peak no próprio rAF para ser preciso
    if (currentLevel > peakRef.current) {
      peakRef.current = currentLevel
      peakHoldRef.current = timestamp
    }

    // Decay do peak (1.5s hold, depois cai)
    const PEAK_HOLD_MS  = 1500
    const PEAK_DECAY_RATE = 0.003  // normalized/ms
    const peakAge = timestamp - peakHoldRef.current
    if (peakAge > PEAK_HOLD_MS) {
      peakRef.current = Math.max(0, peakRef.current - PEAK_DECAY_RATE * (peakAge - PEAK_HOLD_MS) * 0.016)
    }

    const segCount = 24
    const gap = 2
    const segH = (BAR_H - gap * (segCount - 1)) / segCount

    // Background
    ctx.fillStyle = '#0A0A0F'
    ctx.fillRect(0, 0, W, H)

    // Desenha segmentos
    for (let i = 0; i < segCount; i++) {
      const segNorm = 1 - (i / segCount)  // topo = 1, base = 0
      const isActive = currentLevel >= segNorm

      const x = isVert ? 0 : BAR_H - (i + 1) * (segH + gap) + gap
      const y = isVert ? i * (segH + gap) : 0
      const sW = isVert ? BAR_W : segH
      const sH = isVert ? segH : BAR_W

      if (isActive) {
        ctx.fillStyle = getSegmentColor(segNorm)
        ctx.globalAlpha = 1
      } else {
        ctx.fillStyle = '#1A1A26'
        ctx.globalAlpha = 0.8
      }

      ctx.beginPath()
      ctx.roundRect(
        isVert ? 0 : x,
        isVert ? y : 0,
        sW, sH,
        2
      )
      ctx.fill()
    }

    ctx.globalAlpha = 1

    // Peak indicator
    if (showPeak && peakRef.current > 0) {
      const peakY = isVert
        ? (1 - peakRef.current) * BAR_H
        : (1 - peakRef.current) * BAR_W
      ctx.fillStyle = peakRef.current > 0.85 ? '#FF3B5C' : '#FFFFFF'
      ctx.globalAlpha = 0.9
      if (isVert) {
        ctx.fillRect(2, peakY, BAR_W - 4, 2)
      } else {
        ctx.fillRect(peakY, 2, 2, BAR_W - 4)
      }
    }

    ctx.globalAlpha = 1
  }, [orientation, showPeak])

  useAnimationLoop(draw, active)

  const canvasWidth  = width  ?? (orientation === 'vertical' ? 20 : 200)
  const canvasHeight = height ?? (orientation === 'vertical' ? 120 : 20)

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="rounded-sm"
        aria-label={`VU Meter${label ? ` — ${label}` : ''}`}
        role="meter"
      />
      {label && (
        <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  )
}
