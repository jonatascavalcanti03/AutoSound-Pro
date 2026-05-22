'use client'
import React from 'react'
import { Menu, Zap, Settings, Play, Volume2, VolumeX, Activity, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'
import { useAudioEngineSync } from '@/hooks/useAudioEngineSync'
import { motion } from 'framer-motion'

interface AppHeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AppHeader({ sidebarOpen, onToggleSidebar }: AppHeaderProps) {
  const { isReady, initialize, toggleNoise, isPlayingNoise } = useAudioEngineSync()

  return (
    <header className={cn(
      'flex items-center justify-between',
      'h-14 px-4 flex-shrink-0',
      'bg-background/80 backdrop-blur-xl border-b border-white/[0.05]',
      'z-50 relative'
    )}>
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-14 bg-primary/5 blur-3xl pointer-events-none" />

      {/* Left: toggle + logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-white/5 transition-all active:scale-95 group"
          aria-label={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
        >
          <Menu size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 border border-primary/20">
            <Zap size={16} className="text-primary z-10" fill="currentColor" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-primary/20 rounded-xl blur-md"
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display text-sm font-bold text-white tracking-widest uppercase">
              {APP_NAME}
            </span>
            <span className="text-[9px] text-primary font-mono tracking-widest">PRO EDITION</span>
          </div>
        </div>
      </div>

      {/* Center: vehicle name */}
      <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-[#050505] border border-white/5 rounded-full shadow-inner">
        <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest flex items-center gap-2">
          <Activity size={12} className="text-primary animate-pulse" />
          Active Profile
        </span>
        <span className="w-[1px] h-3 bg-white/10" />
        <span className="text-[11px] font-bold text-white tracking-wide uppercase">
          Studio Reference
        </span>
      </div>

      {/* Right: status + settings */}
      <div className="flex items-center gap-4">
        {!isReady ? (
          <button
            onClick={initialize}
            className="group relative flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-mono font-bold border border-primary/30 transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <Play size={12} fill="currentColor" className="relative z-10 group-hover:scale-110 transition-transform" />
            <span className="relative z-10">START DSP ENGINE</span>
          </button>
        ) : (
          <>
            <button
              onClick={toggleNoise}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-widest uppercase transition-all shadow-inner",
                isPlayingNoise 
                  ? "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 shadow-[0_0_15px_rgba(255,51,102,0.2)]" 
                  : "bg-[#050505] text-text-muted border border-white/10 hover:text-white hover:border-white/20"
              )}
            >
              {isPlayingNoise ? <Volume2 size={12} className="animate-pulse" /> : <VolumeX size={12} />}
              {isPlayingNoise ? 'STOP PINK NOISE' : 'TEST NOISE'}
            </button>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-3 px-3 py-1 bg-[#050505] border border-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Cpu size={12} className="text-primary" />
                <span className="text-[10px] text-white font-mono font-bold">96kHz</span>
              </div>
              <div className="w-[1px] h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-signal shadow-[0_0_5px_rgba(0,255,148,0.8)] animate-pulse" />
                <span className="text-[10px] text-signal font-mono font-bold tracking-widest">SYNCED</span>
              </div>
            </div>
          </>
        )}

        <button
          className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
          aria-label="Configurações"
        >
          <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>
    </header>
  )
}
