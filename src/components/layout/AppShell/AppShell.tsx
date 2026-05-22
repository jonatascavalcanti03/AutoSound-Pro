'use client'
// src/components/layout/AppShell/AppShell.tsx
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { AppStatusBar } from './AppStatusBar'
import { DSPPanicOverlay } from './DSPPanicOverlay'
import { BootSequence } from './BootSequence'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [booting, setBooting] = useState(true)

  return (
    <>
      {booting && <BootSequence onComplete={() => setBooting(false)} />}
      
      <div className={cn("flex flex-col h-screen bg-deep overflow-hidden transition-opacity duration-1000", booting ? "opacity-0" : "opacity-100")}>
        {/* Header */}
        <AppHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(p => !p)}
        />

        {/* Body */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar — hidden on mobile */}
          <aside
            className={cn(
              'hidden md:flex flex-col flex-shrink-0 overflow-hidden',
              'transition-all duration-300 ease-out z-30',
              sidebarOpen ? 'w-[240px]' : 'w-[64px]'
            )}
          >
            <AppSidebar collapsed={!sidebarOpen} />
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-auto relative z-10 bg-void">
            {/* Soft inner glow behind content */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 h-full">
              {children}
            </div>
          </main>
        </div>

        {/* Status bar */}
        <AppStatusBar />
        
        {/* Global Watchdog Overlay */}
        <DSPPanicOverlay />
      </div>
    </>
  )
}
