'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, SlidersHorizontal, Sliders,
  Activity, AudioWaveform, BookMarked, Settings2,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMixerStore, selectAllChannels } from '@/store/mixer.store'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/studio',            icon: LayoutDashboard,   label: 'Dashboard'  },
  { href: '/studio/mixer',       icon: SlidersHorizontal, label: 'Mixer'      },
  { href: '/studio/eq',          icon: Sliders,            label: 'Equalizer'  },
  { href: '/studio/crossover',   icon: AudioWaveform,      label: 'Crossover'  },
  { href: '/studio/measurement', icon: Activity,           label: 'Analysis'   },
  { href: '/studio/presets',     icon: BookMarked,         label: 'Presets'    },
  { href: '/studio/settings',    icon: Settings2,          label: 'Config'     },
] as const

interface AppSidebarProps {
  collapsed: boolean
}

export function AppSidebar({ collapsed }: AppSidebarProps) {
  const pathname = usePathname()
  const channels = useMixerStore(selectAllChannels)

  return (
    <nav className="flex flex-col h-full bg-background/95 backdrop-blur-3xl border-r border-white/[0.05] py-4 overflow-hidden relative z-40">
      
      {/* Decorative Gradient Line */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent pointer-events-none" />

      {/* Nav items */}
      <ul className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'transition-all duration-300 group relative overflow-hidden',
                  active
                    ? 'bg-primary/10 text-white shadow-inner'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                )}
              >
                {active && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                  />
                )}
                
                <Icon
                  size={18}
                  className={cn(
                    'flex-shrink-0 transition-transform duration-300 relative z-10',
                    active ? 'text-primary' : 'text-text-muted group-hover:text-primary group-hover:scale-110'
                  )}
                />
                
                {!collapsed && (
                  <span className={cn(
                    "text-xs font-bold tracking-wide transition-colors relative z-10",
                    active ? "text-white" : "group-hover:text-white"
                  )}>
                    {label}
                  </span>
                )}
                
                {active && !collapsed && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-auto relative z-10"
                  >
                    <ChevronRight size={14} className="text-primary" />
                  </motion.div>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Channels list */}
      {!collapsed && (
        <div className="mt-8 px-3 flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-2 px-2 mb-3">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">
              Live Channels
            </p>
          </div>
          <ul className="flex flex-col gap-1">
            {channels.map(ch => (
              <li key={ch.id}>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono text-text-muted hover:text-white hover:bg-[#050505] border border-transparent hover:border-white/5 transition-all group"
                >
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <div
                      className={cn("absolute inset-0 rounded-full opacity-20 blur-sm transition-opacity group-hover:opacity-50", 
                        ch.muted && "hidden"
                      )}
                      style={{ backgroundColor: ch.color }}
                    />
                    <div
                      className={cn("w-2 h-2 rounded-full relative z-10 transition-transform group-hover:scale-125",
                        ch.muted && "bg-white/10"
                      )}
                      style={{ backgroundColor: ch.muted ? undefined : ch.color }}
                    />
                  </div>
                  
                  <span className="truncate flex-1 text-left tracking-wider">{ch.name}</span>
                  
                  <div className="flex gap-1">
                    {ch.muted && (
                      <span className="text-[9px] bg-danger/10 text-danger border border-danger/20 px-1.5 rounded">M</span>
                    )}
                    {ch.soloed && (
                      <span className="text-[9px] bg-amber/10 text-amber border border-amber/20 px-1.5 rounded">S</span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
