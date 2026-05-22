'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PremiumCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  icon?: React.ElementType
  glowColor?: string
  action?: React.ReactNode
}

export function PremiumCard({ 
  children, 
  title, 
  subtitle, 
  className, 
  icon: Icon,
  glowColor = 'var(--primary)',
  action,
}: PremiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative group overflow-hidden',
        'bg-surface/40 backdrop-blur-md border border-white/5 rounded-xl',
        'shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]',
        className
      )}
    >
      {/* Background Glow */}
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none rounded-full"
        style={{ backgroundColor: glowColor }}
      />
      
      {/* Header */}
      {(title || Icon) && (
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-xs font-mono font-bold tracking-widest text-text-primary uppercase flex items-center gap-2">
                {Icon && <Icon size={14} className="text-primary" />}
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[10px] text-text-muted font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Action slot */}
            {action && <div>{action}</div>}
            {/* Status Indicator (Mini) */}
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-primary/40" />
              <div className="w-1 h-1 rounded-full bg-primary/20" />
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 p-5">
        {children}
      </div>
      
      {/* Interactive Border Glow */}
      <div className="absolute inset-0 border border-white/10 rounded-xl group-hover:border-primary/30 transition-colors pointer-events-none" />
    </motion.div>
  )
}

export function GlassPanel({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn(
      "bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden",
      className
    )}>
      {children}
    </div>
  )
}
