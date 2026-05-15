import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useMixerStore, selectChannel } from '@/store/mixer.store'
import { AudioEngine } from '@/audio/AudioEngine'
import { cn } from '@/lib/utils'


interface InteractiveEQGraphProps {
  channelId: string
  className?: string
  activeBandId?: string
  onBandSelect?: (bandId: string) => void
}

const MIN_FREQ = 20
const MAX_FREQ = 20000
const MIN_GAIN = -24
const MAX_GAIN = 24

function freqToX(freq: number): number {
  const logMin = Math.log10(MIN_FREQ)
  const logMax = Math.log10(MAX_FREQ)
  const logFreq = Math.log10(freq)
  return ((logFreq - logMin) / (logMax - logMin)) * 100
}

function xToFreq(xPercent: number): number {
  const logMin = Math.log10(MIN_FREQ)
  const logMax = Math.log10(MAX_FREQ)
  const logFreq = (xPercent / 100) * (logMax - logMin) + logMin
  return Math.pow(10, logFreq)
}

function gainToY(gain: number): number {
  return (1 - (gain - MIN_GAIN) / (MAX_GAIN - MIN_GAIN)) * 100
}

function yToGain(yPercent: number): number {
  return MIN_GAIN + (1 - yPercent / 100) * (MAX_GAIN - MIN_GAIN)
}

export function InteractiveEQGraph({ channelId, className, activeBandId, onBandSelect }: InteractiveEQGraphProps) {
  const channel = useMixerStore(selectChannel(channelId))
  const setEQBandGain = useMixerStore(s => s.setEQBandGain)
  const setEQBandFreq = useMixerStore(s => s.setEQBandFreq)
  
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [draggingBand, setDraggingBand] = useState<string | null>(null)
  const [curvePath, setCurvePath] = useState<string>('')

  // ─── Render Loop do Spectrum Analyzer (RTA) ───────────────────────────────
  useEffect(() => {
    if (!AudioEngine.isReady) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const nyquist = 24000 // Aprox para 48kHz sample rate
    const binCount = 1024 // Para fftSize de 2048
    const dataArray = new Uint8Array(binCount)

    const render = () => {
      animationId = requestAnimationFrame(render)
      
      AudioEngine.getChannelSpectrumData(channelId, dataArray)
      
      const width = canvas.width
      const height = canvas.height
      
      // Limpa com um fade muito leve para efeito de tail (opcional, mas pro)
      ctx.clearRect(0, 0, width, height)

      ctx.beginPath()
      ctx.moveTo(0, height)

      const logMin = Math.log10(MIN_FREQ)
      const logMax = Math.log10(MAX_FREQ)

      for (let x = 0; x < width; x++) {
        // Mapeamento Logarítmico: qual frequência este pixel em X representa?
        const logFreq = logMin + (x / width) * (logMax - logMin)
        const freq = Math.pow(10, logFreq)
        
        // Em qual Bin da FFT esta frequência está?
        const binIndex = (freq / nyquist) * binCount
        const idx = Math.floor(binIndex)
        const frac = binIndex - idx
        
        // Interpolação linear entre os Bins para não ficar com degraus em baixas frequências
        const val1 = dataArray[idx] || 0
        const val2 = dataArray[idx + 1] || 0
        const interpolatedVal = val1 * (1 - frac) + val2 * frac

        // Mapeia 0-255 para Altura (0-height) e atenua levemente para visual
        const amplitudeY = (interpolatedVal / 255.0)
        const y = height - (amplitudeY * height * 0.9) // 0.9 para não bater no teto rígido

        ctx.lineTo(x, y)
      }

      ctx.lineTo(width, height)
      ctx.closePath()

      // Gradiente preenchido do RTA
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      const color = channel?.color || '#00FFAA'
      gradient.addColorStop(0, `${color}80`) // 50% opacity
      gradient.addColorStop(1, `${color}00`) // 0% opacity
      
      ctx.fillStyle = gradient
      ctx.fill()
      
      // Linha de topo do espectro
      ctx.strokeStyle = `${color}A0` // 62% opacity
      ctx.lineWidth = 2
      ctx.stroke()
    }

    render()

    return () => cancelAnimationFrame(animationId)
  }, [channel?.color, channelId])
  // ────────────────────────────────────────────────────────────────────────────

  // Pre-calcula 200 pontos de frequência em escala logarítmica para o gráfico
  const freqPoints = useMemo(() => {
    const points = 200
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
    if (!channel || channel.eq.length === 0) return

    // Tenta pegar a curva real matemática (C++) da AudioEngine se o DSP estiver online
    if (AudioEngine.isReady) {
      const dbResponse = AudioEngine.getChannelFrequencyResponse(channelId, freqPoints)
      if (dbResponse) {
        let path = ''
        for (let i = 0; i < freqPoints.length; i++) {
          const x = freqToX(freqPoints[i])
          const y = gainToY(dbResponse[i])
          path += i === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `
        }
        setCurvePath(path)
        return
      }
    }

    // Fallback: Spline visual se o DSP ainda não foi ativado (Mocking)
    const sorted = [...channel.eq].sort((a, b) => a.frequency - b.frequency)
    let path = `M 0 50 `
    const firstX = freqToX(sorted[0].frequency)
    path += `C ${firstX * 0.5} 50, ${firstX * 0.5} ${gainToY(sorted[0].gain)}, ${firstX} ${gainToY(sorted[0].gain)} `

    for (let i = 0; i < sorted.length - 1; i++) {
      const p1 = sorted[i]
      const p2 = sorted[i + 1]
      const x1 = freqToX(p1.frequency)
      const x2 = freqToX(p2.frequency)
      const y2 = gainToY(p2.gain)
      const cpX = (x1 + x2) / 2
      path += `S ${cpX} ${y2}, ${x2} ${y2} `
    }

    const lastX = freqToX(sorted[sorted.length - 1].frequency)
    path += `C ${(100 + lastX) * 0.5} ${gainToY(sorted[sorted.length - 1].gain)}, ${(100 + lastX) * 0.5} 50, 100 50`
    
    setCurvePath(path)
  }, [channel, channel?.eq, channelId, freqPoints])

  if (!channel) return null

  const bands = channel.eq

  // Interações de Mouse/Touch para arrastar os pontos
  const handlePointerDown = (e: React.PointerEvent, bandId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingBand(bandId)
    onBandSelect?.(bandId)
    if (svgRef.current) {
      svgRef.current.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingBand || !svgRef.current) return
    
    const rect = svgRef.current.getBoundingClientRect()
    let xPercent = ((e.clientX - rect.left) / rect.width) * 100
    let yPercent = ((e.clientY - rect.top) / rect.height) * 100

    xPercent = Math.max(0, Math.min(100, xPercent))
    yPercent = Math.max(0, Math.min(100, yPercent))

    const newFreq = xToFreq(xPercent)
    const newGain = yToGain(yPercent)

    setEQBandFreq(channelId, draggingBand, newFreq)
    setEQBandGain(channelId, draggingBand, newGain)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggingBand(null)
    if (svgRef.current) {
      svgRef.current.releasePointerCapture(e.pointerId)
    }
  }

  return (
    <div className={cn("relative w-full h-full bg-void rounded-lg border border-white/5 overflow-hidden select-none", className)} style={{ touchAction: 'none' }}>
      
      {/* RTA Canvas Overlay - Renderiza a 60fps sem acionar o React */}
      <canvas
        ref={canvasRef}
        width={1024}
        height={256}
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-60"
      />

      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Grid Logarítmico Background */}
        <g className="opacity-10" stroke="currentColor" strokeWidth="0.1">
          {[20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].map(f => (
            <line key={`v-${f}`} x1={freqToX(f)} y1="0" x2={freqToX(f)} y2="100" />
          ))}
          {[-18, -12, -6, 0, 6, 12, 18].map(g => (
            <line key={`h-${g}`} x1="0" y1={gainToY(g)} x2="100" y2={gainToY(g)} strokeWidth={g === 0 ? 0.3 : 0.1} strokeDasharray={g === 0 ? "1 1" : ""} />
          ))}
        </g>

        {/* Curva de Resposta (Matemática Real ou Spline) */}
        <path
          d={curvePath}
          fill="none"
          stroke={channel.color}
          strokeWidth="0.5"
          className="drop-shadow-[0_0_2px_currentColor] transition-all duration-75"
        />

        {/* Fill sob a curva */}
        <path
          d={`${curvePath} L 100 100 L 0 100 Z`}
          fill={`url(#grad-${channelId})`}
          className="opacity-20 transition-all duration-75"
        />

        <defs>
          <linearGradient id={`grad-${channelId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={channel.color} stopOpacity="1" />
            <stop offset="100%" stopColor={channel.color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Pontos de Controle (Handles) */}
        {bands.map((band, idx) => {
          const cx = freqToX(band.frequency)
          const cy = gainToY(band.gain)
          const isActive = band.id === activeBandId || band.id === draggingBand

          return (
            <g key={band.id} transform={`translate(${cx}, ${cy})`}>
              {/* Hitbox maior invisível */}
              <circle
                r="4"
                fill="transparent"
                className="cursor-pointer"
                onPointerDown={(e) => handlePointerDown(e, band.id)}
              />
              <circle
                r={isActive ? "1.5" : "1"}
                fill={band.enabled ? channel.color : '#44445A'}
                stroke="var(--color-void)"
                strokeWidth="0.2"
                className={cn(
                  "pointer-events-none transition-all duration-150",
                  isActive && "shadow-[0_0_4px_currentColor]"
                )}
              />
              {isActive && (
                <text
                  y="-2.5"
                  textAnchor="middle"
                  fill="white"
                  fontSize="2"
                  className="font-mono opacity-80 pointer-events-none"
                >
                  {idx + 1}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      
      {/* Legend / Info */}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-text-muted">
        PARAMETRIC EQ — {channel.name}
      </div>
    </div>
  )
}
