'use client'
import React, { memo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { VerticalFader } from '@/components/atoms/VerticalFader'
import { VUMeter } from '@/components/atoms/VUMeter'
import { useMixerStore, selectMasterGain } from '@/store/mixer.store'
import { Settings2, Volume2, Maximize2, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Reactive Background Spectrum ──────────────────────────────────────────────
const BackgroundSpectrum = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const render = (time: number) => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)
      
      // Simulate real-time FFT spectrum background
      const bars = 64
      const barWidth = width / bars
      
      ctx.fillStyle = 'rgba(0, 212, 255, 0.03)'
      
      for (let i = 0; i < bars; i++) {
        const h = Math.abs(Math.sin(time * 0.002 + i * 0.1)) * height * 0.5
        ctx.fillRect(i * barWidth, height - h, barWidth - 1, h)
      }
      
      animationId = requestAnimationFrame(render)
    }
    
    render(0)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={300} 
      className="absolute bottom-0 left-0 w-full h-[50%] opacity-50 blur-3xl pointer-events-none mix-blend-screen"
    />
  )
})
BackgroundSpectrum.displayName = 'BackgroundSpectrum'

// ─── Componente Memoizado (Isolamento de Render) ───────────────────────────
const MixerChannelStrip = memo(({ channelId, index }: { channelId: string, index: number }) => {
  const ch = useMixerStore(s => s.channels.find(c => c.id === channelId))
  const setChannelGain = useMixerStore(s => s.setChannelGain)
  const toggleMute = useMixerStore(s => s.toggleMute)
  const toggleSolo = useMixerStore(s => s.toggleSolo)
  const togglePhase = useMixerStore(s => s.togglePhase)

  if (!ch) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col items-center border rounded-2xl w-24 flex-shrink-0 group transition-all duration-500 overflow-hidden relative",
        ch.muted ? "bg-void border-white/5 opacity-60" : "glass-panel border-white/10 hover:border-white/20 hover:bg-surface/80"
      )}
    >
      {/* Active Glow Behind Channel */}
      {!ch.muted && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl pointer-events-none" 
          style={{ backgroundColor: ch.color }} 
        />
      )}

      {/* Header (Info) */}
      <div className="w-full text-center py-4 border-b border-white/5 bg-[#050505]/50 relative overflow-hidden flex flex-col items-center justify-center gap-1 z-10">
        <div 
          className="absolute top-0 left-0 w-full h-[2px] transition-all duration-300" 
          style={{ 
            backgroundColor: ch.muted ? '#444' : ch.color,
            boxShadow: ch.muted ? 'none' : `0 0 10px ${ch.color}`
          }} 
        />
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color: ch.muted ? '#666' : ch.color }}>{ch.id}</span>
        <p className="text-[11px] font-display font-bold text-white tracking-wider truncate px-2 uppercase drop-shadow-md">{ch.name}</p>
      </div>

      {/* Buttons (Phase, Mute, Solo) */}
      <div className="flex flex-col gap-2 w-full px-3 py-4 z-10">
        <button 
          onClick={() => togglePhase(ch.id)}
          className={cn(
            "w-full py-1.5 rounded-md text-[10px] font-mono font-bold border transition-all duration-300",
            ch.phase ? "bg-primary/20 text-primary border-primary/30 shadow-glow-sm" : "bg-void text-text-muted border-white/5 hover:text-white hover:border-white/20"
          )}
        >
          Ø
        </button>
        <button 
          onClick={() => toggleSolo(ch.id)}
          className={cn(
            "w-full py-1.5 rounded-md text-[10px] font-mono font-bold border transition-all duration-300",
            ch.soloed ? "bg-amber/20 text-amber border-amber/30 shadow-[0_0_15px_rgba(255,184,0,0.3)]" : "bg-void text-text-muted border-white/5 hover:text-white hover:border-white/20"
          )}
        >
          SOLO
        </button>
        <button 
          onClick={() => toggleMute(ch.id)}
          className={cn(
            "w-full py-1.5 rounded-md text-[10px] font-mono font-bold border transition-all duration-300",
            ch.muted ? "bg-danger/20 text-danger border-danger/30 shadow-[0_0_15px_rgba(255,51,102,0.3)]" : "bg-void text-text-muted border-white/5 hover:text-white hover:border-white/20"
          )}
        >
          MUTE
        </button>
      </div>

      {/* Meters & Fader Area */}
      <div className="flex-1 w-full flex justify-center gap-4 relative py-2 z-10">
        <div className="h-full py-2">
           <VUMeter channelId={ch.id} height={260} width={10} active={!ch.muted} showPeak />
        </div>
        <div className="h-full flex items-center">
           <VerticalFader 
             value={ch.gainDb} 
             min={-60} 
             max={12} 
             height={260}
             color={ch.muted ? '#333344' : ch.color}
             onChange={(val) => setChannelGain(ch.id, val)}
           />
        </div>
      </div>

      {/* Routing / Edit (Bottom) */}
      <div className="w-full p-3 border-t border-white/5 bg-[#050505]/50 flex justify-center z-10">
        <button className="p-1.5 rounded-md text-text-muted hover:text-white hover:bg-white/5 transition-colors">
          <Settings2 size={16} />
        </button>
      </div>
    </motion.div>
  )
})
MixerChannelStrip.displayName = 'MixerChannelStrip'

// ─────────────────────────────────────────────────────────────────────────────

export default function MixerPage() {
  const channelIdsStr = useMixerStore(s => s.channels.map(c => c.id).join(','))
  const channelIds = channelIdsStr.split(',').filter(Boolean)
  
  const masterGain = useMixerStore(selectMasterGain)
  const setMasterGain = useMixerStore(s => s.setMasterGain)

  return (
    <div className="flex flex-col h-full p-4 lg:p-6 gap-6 overflow-hidden relative">
      <BackgroundSpectrum />

      {/* Header HUD */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-none glass-panel rounded-xl p-4 relative z-20"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center relative overflow-hidden">
            <Volume2 size={20} className="text-primary z-10" />
            <div className="absolute inset-0 bg-primary/20 blur-md" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-white tracking-widest uppercase">
              Mixer Console
            </h1>
            <p className="text-[11px] font-mono text-primary tracking-widest mt-0.5 flex items-center gap-2">
              <Activity size={10} className="animate-pulse" />
              {channelIds.length} ACTIVE CHANNELS
            </p>
          </div>
        </div>
        <button className="p-2.5 glass-panel hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-all hover:scale-105 active:scale-95">
          <Maximize2 size={16} />
        </button>
      </motion.div>

      {/* Main Console Board */}
      <div className="flex-1 relative z-20 flex gap-4 lg:gap-6 overflow-x-auto items-stretch select-none pb-4 scrollbar-hide">
        
        {/* Channel Strips */}
        {channelIds.map((id, idx) => (
          <MixerChannelStrip key={id} channelId={id} index={idx} />
        ))}

        {/* Console Divider */}
        <div className="w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2 self-stretch" />

        {/* Master Output Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center bg-[#050505]/80 backdrop-blur-2xl border border-signal/20 rounded-2xl w-40 flex-shrink-0 relative overflow-hidden shadow-[0_0_30px_rgba(0,255,148,0.05)]"
        >
          {/* Master Ambient Glow */}
          <div className="absolute inset-0 bg-signal/5 blur-2xl pointer-events-none" />

          <div className="w-full text-center py-4 border-b border-signal/10 bg-signal/10 relative z-10">
             <span className="text-[12px] font-display font-bold tracking-widest text-signal text-glow">MAIN OUT</span>
          </div>

          <div className="flex-1 w-full flex justify-center gap-6 py-8 z-10">
            <div className="flex gap-1.5 h-full py-2">
               <VUMeter isMaster height={260} width={12} active showPeak />
               <VUMeter isMaster height={260} width={12} active showPeak />
            </div>
            <div className="h-full flex items-center">
               <VerticalFader 
                 value={masterGain} 
                 min={-60} 
                 max={12} 
                 height={260}
                 color="#00FF94"
                 onChange={setMasterGain}
               />
            </div>
          </div>

          <div className="w-full text-center py-3 border-t border-signal/10 bg-[#000000]/50 z-10">
             <span className="text-[12px] font-mono font-bold text-signal tracking-widest">{masterGain.toFixed(1)} dB</span>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
