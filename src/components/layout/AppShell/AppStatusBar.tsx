'use client'
// src/components/layout/AppShell/AppStatusBar.tsx
import React, { useState, useEffect } from 'react'
import { Cpu, Clock, Wifi, Layers, Activity } from 'lucide-react'

export function AppStatusBar() {
  const [latency, setLatency] = useState('2.8')

  // Simulate slight jitter in latency for alive feel
  useEffect(() => {
    const timer = setInterval(() => {
      const base = 2.8
      const jitter = (Math.random() * 0.4 - 0.2).toFixed(1)
      setLatency((base + parseFloat(jitter)).toFixed(1))
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="flex items-center justify-between h-7 px-4 bg-[#020202] border-t border-white/[0.05] flex-shrink-0 relative z-50 overflow-hidden">
      
      {/* Background glow strip */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="flex items-center gap-6">
        <StatusItem 
          icon={<Clock size={12} className="text-signal" />} 
          label="LATENCY" 
          value={`${latency}ms`} 
          color="text-signal" 
          glow 
        />
        <div className="w-[1px] h-3 bg-white/10" />
        <StatusItem 
          icon={<Layers size={12} />} 
          label="BUFFER" 
          value="128" 
        />
        <div className="w-[1px] h-3 bg-white/10" />
        <StatusItem 
          icon={<Cpu size={12} />} 
          label="DSP LOAD" 
          value="12.4%" 
        />
      </div>
      
      <div className="flex items-center gap-6">
        <StatusItem 
          icon={<Activity size={12} className="text-primary animate-pulse" />} 
          label="WORKLET" 
          value="SYNCED" 
          color="text-primary" 
        />
        <div className="w-[1px] h-3 bg-white/10" />
        <StatusItem 
          icon={<Wifi size={12} />} 
          label="HARDWARE" 
          value="WEBSOCKET" 
          color="text-text-muted" 
        />
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-[1px] h-3 bg-white/10" />
          <span className="text-[9px] text-text-muted font-mono tracking-widest">AUTOSOUND PRO OS <span className="text-primary">v0.1.0</span></span>
        </div>
      </div>
    </footer>
  )
}

function StatusItem({
  icon, label, value, color = 'text-white', glow = false
}: {
  icon: React.ReactNode
  label: string
  value: string
  color?: string
  glow?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5 group cursor-default">
      <span className="text-white/40 group-hover:text-white/80 transition-colors">{icon}</span>
      <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">{label}:</span>
      <span className={`text-[10px] font-mono font-bold tracking-wider ${color} ${glow ? 'drop-shadow-[0_0_5px_rgba(0,255,148,0.5)]' : ''}`}>
        {value}
      </span>
    </div>
  )
}
