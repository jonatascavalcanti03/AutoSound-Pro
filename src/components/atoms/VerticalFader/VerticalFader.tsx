'use client'
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface VerticalFaderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (val: number) => void
  color?: string
  height?: number
  disabled?: boolean
}

export function VerticalFader({
  value,
  min,
  max,
  step = 0.5,
  onChange,
  color = '#4A90E2',
  height = 160,
  disabled = false
}: VerticalFaderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Otimização: manter valor local enquanto arrasta para evitar lag visual
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value)
    }
  }, [value, isDragging])

  const calculateValueFromY = useCallback(
    (clientY: number) => {
      if (!trackRef.current) return localValue

      const rect = trackRef.current.getBoundingClientRect()
      // Inverte o Y (topo é max, base é min)
      let percent = 1 - (clientY - rect.top) / rect.height
      percent = Math.max(0, Math.min(1, percent))

      let rawValue = min + percent * (max - min)
      
      // Snap to step
      if (step) {
        rawValue = Math.round(rawValue / step) * step
      }
      
      // Previne -0
      return rawValue === 0 ? 0 : rawValue
    },
    [min, max, step, localValue]
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    if (trackRef.current) {
      trackRef.current.setPointerCapture(e.pointerId)
    }
    const newVal = calculateValueFromY(e.clientY)
    setLocalValue(newVal)
    onChange(newVal)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return
    const newVal = calculateValueFromY(e.clientY)
    setLocalValue(newVal)
    onChange(newVal) // Dispara evento, o AudioEventBus cuida do Throttling!
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    if (trackRef.current) {
      trackRef.current.releasePointerCapture(e.pointerId)
    }
  }

  // Double click resets to 0dB (or close to default)
  const handleDoubleClick = () => {
    if (disabled) return
    const defaultVal = 0 >= min && 0 <= max ? 0 : min
    setLocalValue(defaultVal)
    onChange(defaultVal)
  }

  const percent = ((localValue - min) / (max - min)) * 100

  return (
    <div 
      className={cn("relative flex justify-center w-12 touch-none", disabled && "opacity-50")}
      style={{ height }}
    >
      {/* Marcadores de Escala */}
      <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-between py-2 text-[8px] font-mono text-text-muted select-none pointer-events-none text-right pr-1">
        <span>+12</span>
        <span>0</span>
        <span>-24</span>
        <span>-60</span>
      </div>

      {/* Fader Track */}
      <div
        ref={trackRef}
        className="relative w-8 h-full bg-void rounded-lg border border-white/5 cursor-pointer flex justify-center"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Sulco Central Escuro */}
        <div className="absolute top-2 bottom-2 w-1.5 bg-black/60 rounded-full inset-shadow-sm" />

        {/* Knob / Fader Cap */}
        <div
          className={cn(
            "absolute w-8 h-10 rounded-md border shadow-lg transition-transform flex items-center justify-center",
            isDragging ? "bg-elevated border-white/20 scale-105" : "bg-surface border-white/10"
          )}
          style={{
            bottom: `calc(${percent}% - 20px)`, // 20px is half height
            boxShadow: isDragging ? `0 0 15px ${color}40` : '0 4px 6px rgba(0,0,0,0.3)',
            zIndex: 10
          }}
        >
          {/* LED Mute/Signal no próprio knob ou detalhe visual */}
          <div className="w-4 h-0.5 rounded-full opacity-80" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }} />
          <div className="absolute top-1 left-1 right-1 h-px bg-white/5" />
          <div className="absolute bottom-1 left-1 right-1 h-px bg-white/5" />
        </div>
      </div>
    </div>
  )
}
