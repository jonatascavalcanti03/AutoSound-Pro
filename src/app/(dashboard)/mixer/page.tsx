'use client'
import React, { memo } from 'react'
import { VerticalFader } from '@/components/atoms/VerticalFader'
import { VUMeter } from '@/components/atoms/VUMeter'
import { useMixerStore, selectMasterGain } from '@/store/mixer.store'
import { Settings2, Volume2, Maximize2 } from 'lucide-react'

// ─── Componente Memoizado (Isolamento de Render) ───────────────────────────
const MixerChannelStrip = memo(({ channelId }: { channelId: string }) => {
  const ch = useMixerStore(s => s.channels.find(c => c.id === channelId))
  const setChannelGain = useMixerStore(s => s.setChannelGain)
  const toggleMute = useMixerStore(s => s.toggleMute)
  const toggleSolo = useMixerStore(s => s.toggleSolo)
  const togglePhase = useMixerStore(s => s.togglePhase)

  if (!ch) return null

  return (
    <div className="flex flex-col items-center bg-void/30 border border-white/5 rounded-xl w-20 flex-shrink-0 group hover:bg-void/50 transition-colors">
      {/* Header (Info) */}
      <div className="w-full text-center py-3 border-b border-white/5 bg-black/20 rounded-t-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: ch.color }} />
        <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: ch.color }}>{ch.id}</span>
        <p className="text-[10px] font-mono text-text-muted truncate px-1 uppercase mt-0.5">{ch.name}</p>
      </div>

      {/* Buttons (Phase, Mute, Solo) */}
      <div className="flex flex-col gap-1.5 w-full px-2 py-3">
        <button 
          onClick={() => togglePhase(ch.id)}
          className={`w-full py-1 rounded text-[9px] font-mono font-bold border transition-colors ${ch.phase ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-surface text-text-muted border-white/5 hover:bg-elevated hover:text-text-secondary'}`}
        >
          Ø
        </button>
        <button 
          onClick={() => toggleSolo(ch.id)}
          className={`w-full py-1 rounded text-[9px] font-mono font-bold border transition-all ${ch.soloed ? 'bg-amber/20 text-amber border-amber/30 shadow-[0_0_8px_rgba(255,149,0,0.3)]' : 'bg-surface text-text-muted border-white/5 hover:bg-elevated hover:text-text-secondary'}`}
        >
          SOLO
        </button>
        <button 
          onClick={() => toggleMute(ch.id)}
          className={`w-full py-1 rounded text-[9px] font-mono font-bold border transition-all ${ch.muted ? 'bg-danger/20 text-danger border-danger/30 shadow-[0_0_8px_rgba(255,59,92,0.3)]' : 'bg-surface text-text-muted border-white/5 hover:bg-elevated hover:text-text-secondary'}`}
        >
          MUTE
        </button>
      </div>

      {/* Meters & Fader Area */}
      <div className="flex-1 w-full flex justify-center gap-3 relative py-2">
        <div className="h-full py-2">
           <VUMeter channelId={ch.id} height={240} width={10} active={!ch.muted} showPeak />
        </div>
        <div className="h-full flex items-center">
           <VerticalFader 
             value={ch.gainDb} 
             min={-60} 
             max={12} 
             height={240}
             color={ch.muted ? '#44445A' : ch.color}
             onChange={(val) => setChannelGain(ch.id, val)}
           />
        </div>
      </div>

      {/* Routing / Edit (Bottom) */}
      <div className="w-full p-2 border-t border-white/5 bg-black/20 rounded-b-xl flex justify-center">
        <button className="text-[10px] text-text-muted hover:text-primary transition-colors">
          <Settings2 size={14} />
        </button>
      </div>
    </div>
  )
})
MixerChannelStrip.displayName = 'MixerChannelStrip'
// ─────────────────────────────────────────────────────────────────────────────

export default function MixerPage() {
  // Otimização: Assinar APENAS a string de IDs para evitar re-renders globais
  const channelIdsStr = useMixerStore(s => s.channels.map(c => c.id).join(','))
  const channelIds = channelIdsStr.split(',').filter(Boolean)
  
  const masterGain = useMixerStore(selectMasterGain)
  const setMasterGain = useMixerStore(s => s.setMasterGain)

  return (
    <div className="flex flex-col h-full p-2 lg:p-4 gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-none bg-void/50 border border-white/5 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <Volume2 size={18} className="text-signal" />
          <h1 className="text-sm font-mono text-text-primary tracking-widest uppercase">
            Mixer Console <span className="text-text-muted">| {channelIds.length} Canais</span>
          </h1>
        </div>
        <button className="p-1.5 bg-elevated hover:bg-white/10 border border-white/10 rounded text-text-muted hover:text-white transition-colors">
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Main Console Board */}
      <div className="flex-1 glass-panel rounded-xl border border-white/5 p-4 flex gap-2 lg:gap-4 overflow-x-auto items-stretch select-none">
        
        {/* Channel Strips Otimizados */}
        {channelIds.map(id => (
          <MixerChannelStrip key={id} channelId={id} />
        ))}

        {/* Console Divider */}
        <div className="w-px bg-white/5 mx-2 self-stretch" />

        {/* Master Output Section */}
        <div className="flex flex-col items-center bg-void/50 border border-signal/20 rounded-xl w-32 flex-shrink-0 relative overflow-hidden shadow-[0_0_20px_rgba(0,255,170,0.05)]">
          <div className="w-full text-center py-3 border-b border-white/5 bg-signal/10 rounded-t-xl">
             <span className="text-[11px] font-mono font-bold tracking-widest text-signal">MAIN OUT</span>
          </div>

          <div className="flex-1 w-full flex justify-center gap-4 py-8">
            <div className="flex gap-1 h-full py-2">
               <VUMeter isMaster height={240} width={12} active showPeak />
               <VUMeter isMaster height={240} width={12} active showPeak />
            </div>
            <div className="h-full flex items-center">
               <VerticalFader 
                 value={masterGain} 
                 min={-60} 
                 max={12} 
                 height={240}
                 color="#00FFAA"
                 onChange={setMasterGain}
               />
            </div>
          </div>

          <div className="w-full text-center py-2 border-t border-white/5 bg-black/20 rounded-b-xl">
             <span className="text-[10px] font-mono text-text-muted">{masterGain.toFixed(1)} dB</span>
          </div>
        </div>

      </div>
    </div>
  )
}
