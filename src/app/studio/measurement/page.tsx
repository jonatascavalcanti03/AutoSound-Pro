'use client'
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, Zap, BarChart3, Target, 
  Cpu, Thermometer, ShieldAlert, Radio,
  Waves, Gauge, Maximize2, RefreshCw
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium/PremiumCard'
import { cn } from '@/lib/utils'

export default function MeasurementPage() {
  const fftCanvasRef = useRef<HTMLCanvasElement>(null)
  const spectrogramCanvasRef = useRef<HTMLCanvasElement>(null)
  const phaseCanvasRef = useRef<HTMLCanvasElement>(null)
  const vuCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isLive, setIsLive] = useState(true)

  // Realtime Simulation Engine
  useEffect(() => {
    if (!isLive) return
    let frameId: number
    const fftCtx = fftCanvasRef.current?.getContext('2d')
    const specCtx = spectrogramCanvasRef.current?.getContext('2d')
    const phaseCtx = phaseCanvasRef.current?.getContext('2d')
    const vuCtx = vuCanvasRef.current?.getContext('2d')

    const bufferLength = 128
    const dataArray = new Uint8Array(bufferLength)
    const specHistory: Uint8Array[] = []

    const render = () => {
      const time = Date.now() * 0.001

      // Generate Fake Audio Data
      for(let i = 0; i < bufferLength; i++) {
        const noise = Math.random() * 15
        const bass = Math.sin(time * 5) * 40 * Math.exp(-i * 0.05)
        const mid = Math.sin(time * 2 + i * 0.1) * 20 * Math.exp(-Math.pow(i - 40, 2) * 0.005)
        const high = Math.sin(time * 10 + i) * 10 * Math.exp(-Math.pow(i - 100, 2) * 0.01)
        dataArray[i] = Math.max(0, Math.min(255, 30 + bass + mid + high + noise))
      }

      // --- 1. FFT Graph ---
      if (fftCtx && fftCanvasRef.current) {
        const width = fftCanvasRef.current.width
        const height = fftCanvasRef.current.height
        fftCtx.clearRect(0, 0, width, height)
        
        const barWidth = (width / bufferLength) * 2.5
        let x = 0

        fftCtx.beginPath()
        fftCtx.moveTo(0, height)
        for (let i = 0; i < bufferLength; i++) {
          const h = (dataArray[i] / 255) * height * 0.8
          fftCtx.lineTo(x, height - h)
          x += barWidth + 1
        }
        fftCtx.lineTo(width, height)
        
        fftCtx.strokeStyle = 'rgba(0, 212, 255, 0.9)'
        fftCtx.lineWidth = 2
        fftCtx.stroke()
        
        const grad = fftCtx.createLinearGradient(0, 0, 0, height)
        grad.addColorStop(0, 'rgba(0, 212, 255, 0.4)')
        grad.addColorStop(1, 'rgba(0, 212, 255, 0.0)')
        fftCtx.fillStyle = grad
        fftCtx.fill()
      }

      // --- 2. Spectrogram (Waterfall) ---
      if (specCtx && spectrogramCanvasRef.current) {
        const width = spectrogramCanvasRef.current.width
        const height = spectrogramCanvasRef.current.height
        
        specHistory.unshift(new Uint8Array(dataArray))
        if (specHistory.length > height) specHistory.pop()

        const imgData = specCtx.createImageData(width, height)
        for (let y = 0; y < specHistory.length; y++) {
          const row = specHistory[y]
          for (let x = 0; x < width; x++) {
            const dataIndex = Math.floor((x / width) * bufferLength)
            const val = row[dataIndex]
            const pixelIndex = (y * width + x) * 4
            
            // Premium colormap (Black -> Blue -> Cyan -> White)
            imgData.data[pixelIndex] = val > 200 ? val : 0             // R
            imgData.data[pixelIndex + 1] = val > 100 ? val : val * 0.5 // G
            imgData.data[pixelIndex + 2] = val                         // B
            imgData.data[pixelIndex + 3] = 255                         // A
          }
        }
        specCtx.putImageData(imgData, 0, 0)
      }

      // --- 3. Phase Scope ---
      if (phaseCtx && phaseCanvasRef.current) {
        const width = phaseCanvasRef.current.width
        const height = phaseCanvasRef.current.height
        phaseCtx.fillStyle = 'rgba(0, 0, 0, 0.1)' // Motion blur
        phaseCtx.fillRect(0, 0, width, height)
        
        phaseCtx.beginPath()
        for (let i = 0; i < 50; i++) {
          const l = Math.sin(time * 4 + i * 0.1) * 50 + Math.random() * 20
          const r = Math.sin(time * 4 + i * 0.1 + 0.5) * 50 + Math.random() * 20
          const x = width / 2 + (l - r)
          const y = height / 2 - (l + r)
          
          if (i === 0) phaseCtx.moveTo(x, y)
          else phaseCtx.lineTo(x, y)
        }
        phaseCtx.strokeStyle = 'rgba(0, 255, 148, 0.8)'
        phaseCtx.lineWidth = 1.5
        phaseCtx.stroke()
      }

      // --- 4. VU Meters ---
      if (vuCtx && vuCanvasRef.current) {
        const width = vuCanvasRef.current.width
        const height = vuCanvasRef.current.height
        vuCtx.clearRect(0, 0, width, height)

        const drawVu = (x: number, level: number) => {
          const meterHeight = height * 0.9
          const y = height * 0.95 - meterHeight * level
          const grad = vuCtx.createLinearGradient(0, height, 0, 0)
          grad.addColorStop(0, '#00D4FF')
          grad.addColorStop(0.6, '#00FF94')
          grad.addColorStop(0.9, '#FFB800')
          grad.addColorStop(1, '#FF3366')

          // Background
          vuCtx.fillStyle = 'rgba(255,255,255,0.05)'
          vuCtx.fillRect(x, height * 0.05, 12, meterHeight)
          
          // Value
          vuCtx.fillStyle = grad
          vuCtx.fillRect(x, y, 12, meterHeight * level)

          // Peak hold (simulated)
          vuCtx.fillStyle = '#FFF'
          vuCtx.fillRect(x, Math.max(height * 0.05, y - Math.random() * 10 - 2), 12, 2)
        }

        const lLevel = Math.min(1, Math.max(0, 0.6 + Math.sin(time * 3) * 0.3 + Math.random() * 0.1))
        const rLevel = Math.min(1, Math.max(0, 0.6 + Math.sin(time * 3 + 0.2) * 0.3 + Math.random() * 0.1))
        const subLevel = Math.min(1, Math.max(0, 0.8 + Math.sin(time * 8) * 0.2))

        drawVu(10, lLevel)
        drawVu(30, rLevel)
        drawVu(60, subLevel)
      }

      frameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(frameId)
  }, [isLive])

  return (
    <div className="p-6 space-y-6">
      {/* Header com Controles e Telemetria */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-widest uppercase flex items-center gap-3">
            <Activity className="text-primary" />
            Analysis Center
          </h1>
          <p className="text-xs text-text-muted font-mono mt-1">REALTIME DSP METRICS & DIAGNOSTICS</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsLive(!isLive)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all border",
              isLive 
                ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(0,212,255,0.2)]" 
                : "bg-white/5 text-text-muted border-white/10 hover:bg-white/10"
            )}
          >
            {isLive ? <Radio size={14} className="animate-pulse" /> : <RefreshCw size={14} />}
            {isLive ? 'LIVE CAPTURE' : 'PAUSED'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'DSP LOAD', value: '12.4%', icon: Cpu, color: '#00D4FF', sparkline: true },
          { label: 'TEMP', value: '42°C', icon: Thermometer, color: '#FFB800', sparkline: false },
          { label: 'LATENCY', value: '2.8ms', icon: Zap, color: '#00FF94', sparkline: true },
          { label: 'HEALTH', value: 'OPTIMAL', icon: ShieldAlert, color: '#00D4FF', sparkline: false },
        ].map((stat, i) => (
          <PremiumCard key={i} className="py-4 px-5 relative overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: stat.color }} />
            
            <div className="flex items-center justify-between z-10 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-bold font-mono text-text-primary tracking-tight">{stat.value}</p>
                </div>
              </div>
            </div>
          </PremiumCard>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main FFT Analysis */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <PremiumCard 
            title="Spectral Analysis" 
            subtitle="FFT: 4096 samples | Window: Blackman-Harris | 96kHz"
            icon={BarChart3}
            action={<Maximize2 size={14} className="text-text-muted hover:text-primary cursor-pointer transition-colors" />}
          >
            <div className="h-[280px] w-full relative bg-[#050505] rounded-lg border border-white/5 overflow-hidden group">
              {/* Grid Background */}
              <div className="absolute inset-0 pointer-events-none border-b border-l border-white/5">
                <div className="grid grid-cols-10 h-full w-full">
                  {[...Array(10)].map((_, i) => <div key={i} className="border-r border-white/5" />)}
                </div>
                <div className="absolute inset-0 grid grid-rows-6">
                  {[...Array(6)].map((_, i) => <div key={i} className="border-t border-white/5" />)}
                </div>
              </div>
              
              <canvas 
                ref={fftCanvasRef} 
                width={800} 
                height={280} 
                className="w-full h-full relative z-10 mix-blend-screen"
              />

              {/* Fake Frequency Labels */}
              <div className="absolute bottom-1 w-full px-2 flex justify-between text-[8px] font-mono text-text-muted z-20">
                <span>20Hz</span>
                <span>100Hz</span>
                <span>1kHz</span>
                <span>10kHz</span>
                <span>20kHz</span>
              </div>
            </div>
          </PremiumCard>

          {/* Spectrogram */}
          <PremiumCard title="Waterfall Spectrogram" icon={Waves}>
            <div className="h-[180px] w-full relative bg-black rounded-lg border border-white/5 overflow-hidden">
              <canvas 
                ref={spectrogramCanvasRef} 
                width={800} 
                height={180} 
                className="w-full h-full opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            </div>
          </PremiumCard>
        </div>

        {/* Right Column: Scopes & Meters */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          <PremiumCard title="Phase & Vector Scope" icon={Target}>
            <div className="aspect-square w-full bg-[#050505] rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center group">
              {/* Target Grids */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-full h-[1px] bg-primary/30" />
                <div className="h-full w-[1px] bg-primary/30" />
                <div className="absolute w-full h-full border border-primary/30 rounded-full scale-75" />
                <div className="absolute w-full h-full border border-primary/30 rounded-full scale-50" />
                <div className="absolute w-full h-full border border-primary/30 rounded-full scale-25" />
              </div>
              
              <canvas 
                ref={phaseCanvasRef} 
                width={300} 
                height={300} 
                className="w-full h-full z-10 mix-blend-screen"
              />
              
              <div className="absolute bottom-3 right-3 text-[9px] font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                CORRELATION: +0.94
              </div>
            </div>
          </PremiumCard>

          <PremiumCard title="VU & Dynamics" icon={Gauge}>
            <div className="h-[240px] flex justify-center items-end gap-6 pb-2">
              <canvas 
                ref={vuCanvasRef} 
                width={90} 
                height={220} 
                className="bg-transparent"
              />
              <div className="flex flex-col justify-end gap-1 mb-2 text-[9px] font-mono text-text-muted">
                <span className="text-primary font-bold">L</span>
                <span className="text-primary font-bold">R</span>
                <span className="text-amber font-bold">SUB</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-text-muted uppercase block mb-1">Peak L/R</span>
                <span className="text-sm font-mono text-text-primary">-1.2 dBFS</span>
              </div>
              <div>
                <span className="text-[9px] text-text-muted uppercase block mb-1">LUFS (Int)</span>
                <span className="text-sm font-mono text-primary">-14.5 LUFS</span>
              </div>
            </div>
          </PremiumCard>

        </div>

        {/* Telemetry Log */}
        <div className="col-span-12">
          <PremiumCard title="DSP Diagnostic Bus" icon={TerminalIcon}>
            <div className="h-[160px] font-mono text-[11px] space-y-1.5 overflow-y-auto scrollbar-hide bg-[#020202] p-4 rounded-lg border border-white/5">
              {[
                { time: '18:32:01.442', sys: 'WORKLET', msg: 'DSP Worklet Heartbeat: OK', type: 'info' },
                { time: '18:32:01.982', sys: 'MEMORY', msg: 'SharedArrayBuffer lock-free sync initialized', type: 'success' },
                { time: '18:32:02.110', sys: 'HAL', msg: 'HAL Transport: CONNECTED (ESP32-S3)', type: 'warn' },
                { time: '18:32:05.001', sys: 'WATCHDOG', msg: 'Timer sync: 96kHz stable lock', type: 'info' },
                { time: '18:32:06.772', sys: 'PROTECT', msg: 'Peak level detection: -0.1dB protected limit', type: 'info' },
                { time: '18:32:07.441', sys: 'BIQUAD', msg: 'IIR coefficient recalculation complete in 0.4ms', type: 'success' },
                { time: '18:32:08.112', sys: 'ROUTING', msg: 'Matrix update applied', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 p-1 hover:bg-white/5 rounded transition-colors group">
                  <span className="text-white/30 shrink-0">[{log.time}]</span>
                  <span className="text-white/50 w-16 shrink-0">[{log.sys}]</span>
                  <span className={
                    log.type === 'success' ? 'text-primary' : 
                    log.type === 'warn' ? 'text-amber' : 
                    'text-white/80 group-hover:text-white'
                  }>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  )
}

function TerminalIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
}
