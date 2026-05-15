'use client'
// src/components/layout/AppShell/AppHeader.tsx
import React from 'react'
import { Menu, Radio, Zap, Settings, Play, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'
import { useAudioEngineSync } from '@/hooks/useAudioEngineSync'

interface AppHeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AppHeader({ sidebarOpen, onToggleSidebar }: AppHeaderProps) {
  const { isReady, initialize, toggleNoise, isPlayingNoise } = useAudioEngineSync()

  return (
    <header className={cn(
      'flex items-center justify-between',
      'h-12 px-4 flex-shrink-0',
      'bg-surface border-b border-white/[0.06]',
      'z-50'
    )}>
      {/* Left: toggle + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-text-secondary hover:text-primary hover:bg-elevated transition-colors"
          aria-label={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <Zap size={18} className="text-primary" fill="currentColor" />
          <span className="font-display text-sm font-semibold text-primary tracking-wider hidden sm:block">
            {APP_NAME}
          </span>
        </div>
      </div>

      {/* Center: vehicle name */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs text-text-muted font-mono">VEHICLE</span>
        <span className="text-xs text-text-primary font-mono border border-white/10 rounded px-2 py-0.5 bg-elevated">
          Sistema Principal
        </span>
      </div>

      {/* Right: status + settings */}
      <div className="flex items-center gap-3">
        {!isReady ? (
          <button
            onClick={initialize}
            className="flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30 rounded-md text-xs font-mono border border-primary/30 transition-colors"
          >
            <Play size={12} fill="currentColor" />
            ATIVAR DSP
          </button>
        ) : (
          <>
            <button
              onClick={toggleNoise}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono border transition-colors",
                isPlayingNoise 
                  ? "bg-danger/20 text-danger border-danger/30 hover:bg-danger/30" 
                  : "bg-surface text-text-secondary border-white/10 hover:text-white"
              )}
            >
              {isPlayingNoise ? <Volume2 size={12} /> : <VolumeX size={12} />}
              {isPlayingNoise ? 'STOP NOISE' : 'TEST NOISE'}
            </button>

            {/* Connection LED */}
            <div className="flex items-center gap-1.5 ml-2">
              <div className="led led--active" />
              <span className="text-[10px] text-text-muted font-mono hidden sm:block">ONLINE</span>
            </div>

            {/* Audio status */}
            <div className="flex items-center gap-1.5">
              <Radio size={14} className="text-signal" />
              <span className="text-[10px] text-signal font-mono hidden sm:block">48kHz</span>
            </div>
          </>
        )}

        <button
          className="p-1.5 rounded-md text-text-secondary hover:text-primary hover:bg-elevated transition-colors ml-2"
          aria-label="Configurações"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
