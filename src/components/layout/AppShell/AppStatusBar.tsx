'use client'
// src/components/layout/AppShell/AppStatusBar.tsx
import React from 'react'
import { Cpu, Clock, Wifi, Layers } from 'lucide-react'

export function AppStatusBar() {
  return (
    <footer className="flex items-center justify-between h-6 px-4 bg-void border-t border-white/[0.04] flex-shrink-0">
      <div className="flex items-center gap-4">
        <StatusItem icon={<Clock size={10} />} label="LATÊNCIA" value="2.9ms" color="text-signal" />
        <StatusItem icon={<Layers size={10} />} label="BUFFER" value="128" />
        <StatusItem icon={<Cpu size={10} />} label="DSP" value="12%" />
      </div>
      <div className="flex items-center gap-4">
        <StatusItem icon={<Wifi size={10} />} label="HARDWARE" value="N/A" color="text-text-muted" />
        <span className="text-[9px] text-text-muted font-mono">AutoSound Pro v0.1.0</span>
      </div>
    </footer>
  )
}

function StatusItem({
  icon, label, value, color = 'text-text-secondary'
}: {
  icon: React.ReactNode
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-text-muted">{icon}</span>
      <span className="text-[9px] text-text-muted font-mono">{label}:</span>
      <span className={`text-[9px] font-mono font-medium ${color}`}>{value}</span>
    </div>
  )
}
