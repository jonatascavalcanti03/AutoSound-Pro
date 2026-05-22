'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookMarked, Cloud, Download, Trash2, 
  Plus, Radio, Music, Trophy, Star, 
  Share2, PlayCircle, MoreHorizontal, CheckCircle2,
  Lock, Zap, Speaker
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium/PremiumCard'
import { cn } from '@/lib/utils'

const PRESETS = [
  { id: 1, name: 'Audiophile SQ Master', type: 'SQ', author: 'AutoSound AI', date: '2026-05-15', rating: 5, active: true, downloads: 12400, img: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: 'Pancadão Trio Elite', type: 'Trio', author: 'Jonatas C.', date: '2026-05-14', rating: 4, active: false, downloads: 8300, img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: 'Deep Bass SPL Brutal', type: 'SPL', author: 'System Pro', date: '2026-05-10', rating: 5, active: false, downloads: 4200, img: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=400' },
  { id: 4, name: 'Urban Smooth R&B', type: 'Daily', author: 'User_99', date: '2026-05-08', rating: 3, active: false, downloads: 1150, img: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=400' },
  { id: 5, name: 'Rock Concert Live', type: 'SQ', author: 'AutoSound AI', date: '2026-05-05', rating: 4, active: false, downloads: 5400, img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400' },
  { id: 6, name: 'Competição High-End', type: 'IASCA', author: 'Expert Tune', date: '2026-04-20', rating: 5, active: false, downloads: 890, img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=400' },
]

export default function PresetsPage() {
  const [activeCategory, setActiveCategory] = useState('All Presets')
  const categories = ['All Presets', 'Sound Quality', 'Trio Elétrico', 'SPL', 'Open Show', 'Daily Driver']

  return (
    <div className="p-6 space-y-8">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-widest uppercase flex items-center gap-3">
            <BookMarked className="text-primary" />
            Preset Library
          </h1>
          <p className="text-xs text-text-muted font-mono mt-1">CLOUD-SYNCED DSP CONFIGURATIONS</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-primary/20 border border-primary/40 rounded-xl text-xs font-mono font-bold text-primary hover:bg-primary/30 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.15)] hover:shadow-[0_0_25px_rgba(0,212,255,0.3)]">
            <Plus size={16} /> NEW SETUP
          </button>
          <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-text-primary hover:bg-white/10 transition-all flex items-center gap-2">
            <Cloud size={16} /> SYNC CLOUD
          </button>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap relative overflow-hidden group",
                activeCategory === cat 
                  ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,212,255,0.4)]" 
                  : "bg-black/40 text-text-muted border-white/10 hover:border-primary/50 hover:text-white"
              )}
            >
              {activeCategory === cat && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/20 mix-blend-overlay"
                />
              )}
              {cat}
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRESETS.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <PremiumCard 
              className={cn(
                "group relative overflow-hidden transition-all duration-500 hover:translate-y-[-4px]",
                p.active && "border-primary/50 shadow-[0_0_30px_rgba(0,212,255,0.15)] ring-1 ring-primary/20"
              )}
              glowColor={p.active ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}
            >
              {/* Background Image / Texture */}
              <div 
                className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 bg-cover bg-center mix-blend-luminosity grayscale"
                style={{ backgroundImage: `url(${p.img})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={cn(
                    "px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-md border",
                    p.type === 'SQ' ? "bg-primary/10 text-primary border-primary/20" : 
                    p.type === 'Trio' ? "bg-amber/10 text-amber border-amber/20" : 
                    "bg-danger/10 text-danger border-danger/20"
                  )}>
                    {p.type === 'SQ' ? <Trophy size={14} /> : 
                     p.type === 'Trio' ? <Speaker size={14} /> : 
                     <Zap size={14} />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{p.type}</span>
                  </div>
                  
                  {p.active ? (
                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-[9px] font-bold tracking-widest uppercase">Active</span>
                    </div>
                  ) : (
                    <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-primary hover:border-primary/50 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                      <PlayCircle size={16} />
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors tracking-wide">{p.name}</h3>
                
                <div className="flex items-center gap-4 text-[10px] text-text-muted font-mono mb-6">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-primary/50" />
                    {p.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download size={12} className="text-white/30" />
                    {(p.downloads / 1000).toFixed(1)}k
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={12} className={idx < p.rating ? "text-amber fill-amber" : "text-white/10"} />
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary transition-colors">
                      <Share2 size={14} />
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-danger/20 text-text-secondary hover:text-danger transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
        
        {/* Empty Add Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-text-muted hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer group min-h-[220px]"
        >
          <div className="w-14 h-14 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
            <Plus size={24} className="group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs font-bold font-mono tracking-widest uppercase">Build Custom Preset</p>
          <p className="text-[10px] mt-2 opacity-50 group-hover:opacity-100 transition-opacity text-center px-4">
            Start from scratch or import REW measurements
          </p>
        </motion.div>
      </div>

      {/* Cloud Sync Telemetry Card */}
      <PremiumCard className="mt-8 relative overflow-hidden group border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none opacity-50" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <Cloud className="text-primary relative z-10" size={28} />
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary rounded-full blur-xl"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold font-mono tracking-widest text-white uppercase flex items-center gap-2">
                Cloud Sync Pipeline <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[9px] border border-primary/30">ONLINE</span>
              </h4>
              <p className="text-[11px] text-text-muted mt-1 font-mono">
                AutoSound Cloud Edge Server (SA-EAST-1)
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full md:w-auto">
            <div className="text-right">
              <p className="text-[9px] text-white/40 uppercase mb-1">State</p>
              <p className="text-[11px] font-mono text-primary font-bold">IN SYNC</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/40 uppercase mb-1">Latency</p>
              <p className="text-[11px] font-mono text-white">42ms</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/40 uppercase mb-1">Last Backup</p>
              <p className="text-[11px] font-mono text-white">2m ago</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/40 uppercase mb-1">Checksum</p>
              <p className="text-[11px] font-mono text-text-muted">0x8F2A</p>
            </div>
          </div>
        </div>
      </PremiumCard>
    </div>
  )
}
