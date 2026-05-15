'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useMixerStore, selectAllChannels, selectActiveChannelId } from '@/store/mixer.store'
import { AudioEngine } from '@/audio/AudioEngine'
import { useAudioEngineSync } from '@/hooks/useAudioEngineSync'
import { cn } from '@/lib/utils'

const MIN_FREQ = 20
const MAX_FREQ = 20000
const MIN_GAIN = -48
const MAX_GAIN = 12

function freqToX(freq: number): number {
  const logMin = Math.log10(MIN_FREQ)
  const logMax = Math.log10(MAX_FREQ)
  const logFreq = Math.log10(freq)
  return ((logFreq - logMin) / (logMax - logMin)) * 100
}

function gainToY(gain: number): number {
  return (1 - (gain - MIN_GAIN) / (MAX_GAIN - MIN_GAIN)) * 100
}

export function CrossoverGraph({ className }: { className?: string }) {
  const channels = useMixerStore(selectAllChannels)
  const activeChannelId = useMixerStore(selectActiveChannelId)
  const { isReady } = useAudioEngineSync()
  const [paths, setPaths] = useState<Record<string, string>>({})

  // Pre-calcula 300 pontos de frequência para maior precisão nos cortes abruptos
  const freqPoints = useMemo(() => {
    const points = 300
    const arr = new Float32Array(points)
    const logMin = Math.log10(MIN_FREQ)
    const logMax = Math.log10(MAX_FREQ)
    for (let i = 0; i < points; i++) {
      const logFreq = logMin + (i / (points - 1)) * (logMax - logMin)
      arr[i] = Math.pow(10, logFreq)
    }
    return arr
  }, [])

  useEffect(() => {
    if (!isReady) {
      // Se não está pronto, não temos a matemática exata, apenas um mock básico.
      return
    }

    let animationId: number

    const updatePaths = () => {
      const newPaths: Record<string, string> = {}
      
      channels.forEach(ch => {
        const dbResponse = AudioEngine.getChannelFrequencyResponse(ch.id, freqPoints)
        if (dbResponse) {
          let path = ''
          for (let i = 0; i < freqPoints.length; i++) {
            const x = freqToX(freqPoints[i])
            const y = gainToY(dbResponse[i])
            path += i === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `
          }
          newPaths[ch.id] = path
        }
      })
      
      setPaths(newPaths)
      animationId = requestAnimationFrame(updatePaths)
    }

    updatePaths()
    return () => cancelAnimationFrame(animationId)
  }, [channels, freqPoints])

  return (
    <div className={cn("relative w-full h-full bg-void rounded-lg border border-white/5 overflow-hidden select-none", className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {/* Grid Logarítmico */}
        <g className="opacity-10" stroke="currentColor" strokeWidth="0.1">
          {[20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].map(f => (
            <line key={`v-${f}`} x1={freqToX(f)} y1="0" x2={freqToX(f)} y2="100" />
          ))}
          {[-36, -24, -12, 0, 12].map(g => (
            <line key={`h-${g}`} x1="0" y1={gainToY(g)} x2="100" y2={gainToY(g)} strokeWidth={g === 0 ? 0.3 : 0.1} strokeDasharray={g === 0 ? "1 1" : ""} />
          ))}
        </g>

        {!isReady && (
          <text x="50" y="50" fill="currentColor" textAnchor="middle" className="text-[3px] font-mono opacity-50">
            ATIVE O DSP NO HEADER PARA CALCULAR A MATRIZ
          </text>
        )}

        {/* Curvas de Resposta de Crossover de todos os canais */}
        {channels.map(ch => {
          const path = paths[ch.id]
          if (!path) return null
          
          const isActive = activeChannelId === ch.id

          return (
            <g key={ch.id} className={isActive ? 'opacity-100' : 'opacity-40 hover:opacity-80 transition-opacity'}>
              <path
                d={path}
                fill="none"
                stroke={ch.color}
                strokeWidth={isActive ? "0.6" : "0.3"}
                className={isActive ? "drop-shadow-[0_0_3px_currentColor]" : ""}
              />
              <path
                d={`${path} L 100 100 L 0 100 Z`}
                fill={`url(#grad-cx-${ch.id})`}
                className="opacity-20"
              />
              <defs>
                <linearGradient id={`grad-cx-${ch.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ch.color} stopOpacity="1" />
                  <stop offset="100%" stopColor={ch.color} stopOpacity="0" />
                </linearGradient>
              </defs>
            </g>
          )
        })}
      </svg>
      
      {/* Legend / Y-Axis */}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-text-muted">
        CROSSOVER MATRIX OVERLAP (LR24)
      </div>
      <div className="absolute top-0 right-2 bottom-0 flex flex-col justify-between py-2 text-[8px] font-mono text-text-muted opacity-50 pointer-events-none">
        <span>+12dB</span>
        <span>0dB</span>
        <span>-12dB</span>
        <span>-24dB</span>
        <span>-36dB</span>
        <span>-48dB</span>
      </div>
    </div>
  )
}
