'use client'
import React, { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface EQGraphProps {
  className?: string
}

export function EQGraph({ className }: EQGraphProps) {
  return (
    <div className={cn("relative w-full h-full bg-void rounded-lg border border-white/5 overflow-hidden", className)}>
      {/* Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-text-muted" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Horizontal 0dB line */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-primary opacity-50" strokeDasharray="4 4" />
      </svg>

      {/* Mock EQ Curve */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
        {/* Fill under curve */}
        <path
          d="M 0 100 C 100 100, 150 150, 200 150 C 300 150, 350 80, 450 80 C 550 80, 650 120, 750 120 C 850 120, 950 100, 1000 100 L 1000 200 L 0 200 Z"
          fill="url(#curveGradient)"
          className="opacity-20"
        />
        {/* Stroke */}
        <path
          d="M 0 100 C 100 100, 150 150, 200 150 C 300 150, 350 80, 450 80 C 550 80, 650 120, 750 120 C 850 120, 950 100, 1000 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />

        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Mock Handles */}
        <circle cx="200" cy="150" r="6" fill="currentColor" className="text-primary cursor-pointer hover:scale-150 transition-transform" />
        <circle cx="450" cy="80" r="6" fill="currentColor" className="text-primary cursor-pointer hover:scale-150 transition-transform" />
        <circle cx="750" cy="120" r="6" fill="currentColor" className="text-primary cursor-pointer hover:scale-150 transition-transform" />
      </svg>

      {/* Labels */}
      <div className="absolute top-2 right-3 text-[10px] font-mono text-text-muted">
        +24 dB
      </div>
      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-text-muted">
        -24 dB
      </div>
    </div>
  )
}
