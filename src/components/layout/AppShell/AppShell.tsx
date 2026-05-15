'use client'
// src/components/layout/AppShell/AppShell.tsx
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { AppStatusBar } from './AppStatusBar'
import { DSPPanicOverlay } from './DSPPanicOverlay'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex flex-col h-full bg-deep overflow-hidden">
      {/* Header */}
      <AppHeader
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(p => !p)}
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile */}
        <aside
          className={cn(
            'hidden md:flex flex-col flex-shrink-0 overflow-hidden',
            'border-r border-white/[0.06]',
            'transition-all duration-300 ease-out',
            sidebarOpen ? 'w-[220px]' : 'w-[60px]'
          )}
        >
          <AppSidebar collapsed={!sidebarOpen} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Status bar */}
      <AppStatusBar />
      
      {/* Global Watchdog Overlay */}
      <DSPPanicOverlay />
    </div>
  )
}
