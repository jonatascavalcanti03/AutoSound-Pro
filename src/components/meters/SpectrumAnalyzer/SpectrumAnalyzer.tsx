'use client'
import React, { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SpectrumAnalyzerProps {
  className?: string
  active?: boolean
}

export function SpectrumAnalyzer({ className, active = false }: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let animationId: number

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      const bars = 64
      const barWidth = W / bars

      // Background
      ctx.fillStyle = '#05050A'
      ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let i = 1; i < 4; i++) {
        ctx.moveTo(0, (H / 4) * i)
        ctx.lineTo(W, (H / 4) * i)
      }
      for (let i = 1; i < 8; i++) {
        ctx.moveTo((W / 8) * i, 0)
        ctx.lineTo((W / 8) * i, H)
      }
      ctx.stroke()

      // Draw fake spectrum
      for (let i = 0; i < bars; i++) {
        const value = active ? Math.sin((i / bars) * Math.PI + performance.now() * 0.002) * 0.5 + 0.5 : 0.05
        // Add some random jitter if active
        const jitter = active ? (Math.random() * 0.2 - 0.1) : 0
        const finalValue = Math.max(0, Math.min(1, value + jitter))
        
        const barHeight = finalValue * H * 0.8
        
        // Gradient
        const gradient = ctx.createLinearGradient(0, H - barHeight, 0, H)
        gradient.addColorStop(0, '#00FF88')
        gradient.addColorStop(0.5, '#00D4FF')
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(i * barWidth + 1, H - barHeight, barWidth - 2, barHeight)
        
        // Peak cap
        ctx.fillStyle = '#FFFFFF'
        ctx.globalAlpha = active ? 0.8 : 0.2
        ctx.fillRect(i * barWidth + 1, H - barHeight - 2, barWidth - 2, 2)
        ctx.globalAlpha = 1
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationId)
  }, [active])

  return (
    <div className={cn("relative w-full h-full bg-void rounded-lg overflow-hidden border border-white/5", className)}>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full h-full"
      />
      <div className="absolute bottom-2 left-0 w-full flex justify-between px-4 text-[9px] font-mono text-text-muted">
        <span>20</span>
        <span>100</span>
        <span>1k</span>
        <span>10k</span>
        <span>20k</span>
      </div>
    </div>
  )
}
