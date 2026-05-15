'use client'
// src/components/atoms/RotaryKnob/RotaryKnob.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { RotaryKnobProps } from './RotaryKnob.types'

const MIN_ANGLE = -135  // graus (posição mínima)
const MAX_ANGLE =  135  // graus (posição máxima)
const DRAG_SENSITIVITY = 0.4  // px por grau

export function RotaryKnob({
  value,
  min = 0,
  max = 100,
  step = 1,
  size = 56,
  label,
  unit,
  color = '#00D4FF',
  disabled = false,
  formatValue,
  onChange,
  onChangeEnd,
  className,
}: RotaryKnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ y: number; value: number } | null>(null)
  const knobRef = useRef<SVGSVGElement>(null)

  // Normaliza value → ângulo
  const normalized = max === min ? 0 : (value - min) / (max - min)
  const angle = MIN_ANGLE + normalized * (MAX_ANGLE - MIN_ANGLE)

  // Converte posição de drag → novo value
  const computeValue = useCallback((deltaY: number): number => {
    if (!dragStartRef.current) return value
    const deltaAngle = -deltaY * DRAG_SENSITIVITY
    const deltaNorm  = deltaAngle / (MAX_ANGLE - MIN_ANGLE)
    const raw        = dragStartRef.current.value + deltaNorm * (max - min)
    const stepped    = Math.round(raw / step) * step
    return Math.max(min, Math.min(max, stepped))
  }, [value, min, max, step])

  // ─── Mouse handlers ───────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = { y: e.clientY, value }
  }, [disabled, value])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return
      const newValue = computeValue(e.clientY - dragStartRef.current.y)
      onChange?.(newValue)
    }

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false)
      if (dragStartRef.current) {
        const finalValue = computeValue(e.clientY - dragStartRef.current.y)
        onChangeEnd?.(finalValue)
        dragStartRef.current = null
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, computeValue, onChange, onChangeEnd])

  // ─── Touch handlers ───────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    e.preventDefault()
    const touch = e.touches[0]
    if (!touch) return
    setIsDragging(true)
    dragStartRef.current = { y: touch.clientY, value }
  }, [disabled, value])

  useEffect(() => {
    if (!isDragging) return
    const el = knobRef.current
    if (!el) return

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (!touch || !dragStartRef.current) return
      const newValue = computeValue(touch.clientY - dragStartRef.current.y)
      onChange?.(newValue)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      setIsDragging(false)
      const touch = e.changedTouches[0]
      if (touch && dragStartRef.current) {
        onChangeEnd?.(computeValue(touch.clientY - dragStartRef.current.y))
        dragStartRef.current = null
      }
    }

    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd)
    return () => {
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, computeValue, onChange, onChangeEnd])

  // ─── Keyboard handler ─────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return
    let delta = 0
    if (e.key === 'ArrowUp'   || e.key === 'ArrowRight') delta =  step
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft')  delta = -step
    if (e.key === 'PageUp')   delta =  step * 10
    if (e.key === 'PageDown') delta = -step * 10
    if (e.key === 'Home')  { onChange?.(min); return }
    if (e.key === 'End')   { onChange?.(max); return }
    if (delta === 0) return
    e.preventDefault()
    const newValue = Math.max(min, Math.min(max, value + delta))
    onChange?.(newValue)
    onChangeEnd?.(newValue)
  }, [disabled, step, value, min, max, onChange, onChangeEnd])

  // ─── SVG geometry ──────────────────────────────────────────────────────────
  const center  = size / 2
  const radius  = (size / 2) - 4
  const trackR  = radius - 3
  const indicatorLength = radius * 0.45

  // Arc de fundo e de valor
  const angleToRad = (deg: number) => (deg - 90) * (Math.PI / 180)
  const arcStart = angleToRad(MIN_ANGLE)
  const arcEnd   = angleToRad(angle)

  const arcX1 = center + trackR * Math.cos(arcStart)
  const arcY1 = center + trackR * Math.sin(arcStart)
  const arcX2 = center + trackR * Math.cos(arcEnd)
  const arcY2 = center + trackR * Math.sin(arcEnd)

  const fullArcX = center + trackR * Math.cos(angleToRad(MAX_ANGLE))
  const fullArcY = center + trackR * Math.sin(angleToRad(MAX_ANGLE))

  const largeArc      = (MAX_ANGLE - MIN_ANGLE) > 180 ? 1 : 0
  const valueArcLarge = Math.abs(angle - MIN_ANGLE) > 180 ? 1 : 0

  const indicatorX = center + indicatorLength * Math.cos(angleToRad(angle))
  const indicatorY = center + indicatorLength * Math.sin(angleToRad(angle))

  const displayValue = typeof value === 'number'
    ? (Number.isInteger(step) ? value.toFixed(0) : value.toFixed(1))
    : value

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 select-none',
        disabled && 'opacity-40',
        className
      )}
    >
      {/* SVG Knob */}
      <svg
        ref={knobRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'cursor-pointer transition-transform duration-100',
          isDragging ? 'scale-105 cursor-grabbing' : 'hover:scale-[1.03]',
          'focus:outline-none'
        )}
        style={{ filter: isDragging ? `drop-shadow(0 0 8px ${color}66)` : undefined }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
      >
        {/* Glow definition */}
        <defs>
          <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle
          cx={center} cy={center} r={radius}
          fill="url(#knob-gradient)"
          className="fill-elevated"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />

        {/* Inner body */}
        <circle
          cx={center} cy={center} r={radius - 6}
          className="fill-surface"
          style={{ boxShadow: 'var(--shadow-knob)' }}
        />

        {/* Track background */}
        <path
          d={`M ${arcX1} ${arcY1} A ${trackR} ${trackR} 0 ${largeArc} 1 ${fullArcX} ${fullArcY}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Track value */}
        {normalized > 0 && (
          <path
            d={`M ${arcX1} ${arcY1} A ${trackR} ${trackR} 0 ${valueArcLarge} 1 ${arcX2} ${arcY2}`}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            filter={`url(#glow-${label})`}
          />
        )}

        {/* Indicator line */}
        <line
          x1={center} y1={center}
          x2={indicatorX} y2={indicatorY}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.9}
        />

        {/* Center dot */}
        <circle cx={center} cy={center} r={2.5} fill={color} opacity={0.7} />
      </svg>

      {/* Value display */}
      <span
        className="font-mono text-[10px] leading-none tabular-nums"
        style={{ color }}
      >
        {displayValue}{unit}
      </span>

      {/* Label */}
      {label && (
        <span className="text-[10px] text-text-secondary leading-none text-center max-w-[64px] truncate">
          {label}
        </span>
      )}
    </div>
  )
}
