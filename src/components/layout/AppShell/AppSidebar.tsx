'use client'
// src/components/layout/AppShell/AppSidebar.tsx
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, SlidersHorizontal, Sliders,
  Activity, AudioWaveform, BookMarked, Settings2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMixerStore, selectAllChannels } from '@/store/mixer.store'

const NAV_ITEMS = [
  { href: '/',            icon: LayoutDashboard,   label: 'Dashboard'  },
  { href: '/mixer',       icon: SlidersHorizontal, label: 'Mixer'      },
  { href: '/eq',          icon: Sliders,            label: 'Equalizer'  },
  { href: '/crossover',   icon: AudioWaveform,      label: 'Crossover'  },
  { href: '/measurement', icon: Activity,           label: 'Análise'    },
  { href: '/presets',     icon: BookMarked,         label: 'Presets'    },
  { href: '/settings',    icon: Settings2,          label: 'Config'     },
] as const

interface AppSidebarProps {
  collapsed: boolean
}

export function AppSidebar({ collapsed }: AppSidebarProps) {
  const pathname = usePathname()
  const channels = useMixerStore(selectAllChannels)

  return (
    <nav className="flex flex-col h-full bg-surface py-2 overflow-hidden">
      {/* Nav items */}
      <ul className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 px-2 py-2 rounded-md',
                  'transition-all duration-150 group',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                )}
              >
                <Icon
                  size={16}
                  className={cn(
                    'flex-shrink-0 transition-colors',
                    active ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'
                  )}
                />
                {!collapsed && (
                  <span className="text-xs font-medium truncate">{label}</span>
                )}
                {active && !collapsed && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Channels list */}
      {!collapsed && (
        <div className="mt-4 px-2 flex-1 overflow-y-auto">
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest px-2 mb-2">
            Canais
          </p>
          <ul className="flex flex-col gap-0.5">
            {channels.map(ch => (
              <li key={ch.id}>
                <button
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ch.muted ? '#44445A' : ch.color }}
                  />
                  <span className="truncate font-mono">{ch.name}</span>
                  {ch.muted && (
                    <span className="ml-auto text-[9px] text-danger font-mono">M</span>
                  )}
                  {ch.soloed && (
                    <span className="ml-auto text-[9px] text-amber font-mono">S</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
