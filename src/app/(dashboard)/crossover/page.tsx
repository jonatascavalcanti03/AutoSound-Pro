'use client'
import React, { useEffect } from 'react'
import { useMixerStore, selectAllChannels, selectActiveChannelId } from '@/store/mixer.store'
import { CrossoverGraph } from '@/components/graphs/CrossoverGraph/CrossoverGraph'
import { RotaryKnob } from '@/components/atoms/RotaryKnob'
import { formatFrequency } from '@/lib/utils'
import { AudioWaveform } from 'lucide-react'

export default function CrossoverPage() {
  const channels = useMixerStore(selectAllChannels)
  const activeChannelId = useMixerStore(selectActiveChannelId)
  const setActiveChannel = useMixerStore(s => s.setActiveChannel)

  // Seleciona o primeiro canal se nenhum estiver ativo
  useEffect(() => {
    if (!activeChannelId && channels.length > 0) {
      setActiveChannel(channels[0].id)
    }
  }, [activeChannelId, channels, setActiveChannel])

  if (!activeChannelId) return null

  return (
    <div className="flex flex-col h-full p-2 lg:p-4 gap-3 overflow-hidden">
      
      {/* ─── Top: Channel Selector ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-none">
        <div className="glass-panel rounded-lg flex p-1">
          {channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`px-4 py-2 rounded-md text-xs font-mono tracking-wider transition-all flex items-center gap-2 ${
                activeChannelId === ch.id
                  ? 'bg-elevated text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
              }`}
            >
              <div 
                className={`w-2 h-2 rounded-full ${activeChannelId === ch.id ? 'shadow-[0_0_8px_currentColor]' : ''}`} 
                style={{ backgroundColor: ch.color, color: ch.color }}
              />
              {ch.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Graph Area ──────────────────────────────────────────────────────── */}
      <div className="glass-panel rounded-xl p-3 flex-none relative" style={{ height: 'max(40vh, 250px)' }}>
        <CrossoverGraph />
      </div>

      {/* ─── Crossover Controls Area ─────────────────────────────────────────── */}
      <div className="glass-panel rounded-xl p-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-4 flex-none">
          <AudioWaveform size={14} className="text-text-muted" />
          <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">
            Filtros Linkwitz-Riley 24dB/oct & Time Alignment
          </h2>
        </div>

        <div className="flex gap-2 lg:gap-4 overflow-x-auto pb-4 flex-1">
          {channels.map((ch) => (
            <CrossoverStrip key={ch.id} channelId={ch.id} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CrossoverStrip({ channelId }: { channelId: string }) {
  const ch = useMixerStore(s => s.channels.find(c => c.id === channelId))
  const setCrossoverHP = useMixerStore(s => s.setCrossoverHP)
  const setCrossoverLP = useMixerStore(s => s.setCrossoverLP)
  const setChannelDelay = useMixerStore(s => s.setChannelDelay)
  const togglePhase = useMixerStore(s => s.togglePhase)
  const activeChannelId = useMixerStore(selectActiveChannelId)

  if (!ch) return null
  const isActive = activeChannelId === ch.id

  return (
    <div className={`flex flex-col items-center min-w-[220px] p-4 rounded-lg border transition-all ${
      isActive 
        ? 'bg-void/40 border-primary/30 shadow-[0_4px_12px_rgba(0,0,0,0.2)]' 
        : 'bg-void/10 border-white/5 hover:bg-void/20 hover:border-white/10'
    }`}>
      {/* Header */}
      <div className="flex w-full items-center justify-between mb-4 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
          <span className="text-xs font-mono font-bold text-text-primary uppercase tracking-widest">
            {ch.name}
          </span>
        </div>
        
        {/* Phase Flip */}
        <button
          onClick={() => togglePhase(ch.id)}
          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
            ch.phase 
              ? 'bg-amber/20 text-amber border-amber/30 shadow-[0_0_8px_rgba(255,149,0,0.3)]' 
              : 'bg-elevated text-text-muted border-white/5 hover:text-text-primary'
          }`}
          title="Inverter Fase (180º)"
        >
          Ø {ch.phase ? '180º' : '0º'}
        </button>
      </div>

      <div className="flex gap-4 w-full justify-center flex-1">
        
        {/* High Pass (Corte de Baixa) */}
        <div className="flex flex-col items-center gap-4 bg-void/30 p-2 rounded-lg border border-white/5 flex-1">
          <div className="flex w-full justify-between items-center mb-1">
            <span className="text-[9px] font-mono text-text-muted">HPF</span>
            <button 
              onClick={() => setCrossoverHP(ch.id, ch.crossover.highpassFreq, !ch.crossover.highpassEnabled)}
              className={`w-2.5 h-2.5 rounded-full border transition-colors ${
                ch.crossover.highpassEnabled ? 'bg-signal border-signal shadow-[0_0_6px_rgba(0,255,136,0.5)]' : 'bg-transparent border-text-muted'
              }`}
            />
          </div>
          <RotaryKnob
            value={ch.crossover.highpassFreq}
            min={20}
            max={20000}
            step={1}
            size={52}
            unit="Hz"
            label="FREQ"
            color={ch.crossover.highpassEnabled ? ch.color : '#44445A'}
            formatValue={(val) => formatFrequency(val)}
            onChange={(val) => setCrossoverHP(ch.id, val, ch.crossover.highpassEnabled)}
          />
          <span className="text-[9px] font-mono text-text-muted">24dB/oct</span>
        </div>

        {/* Low Pass (Corte de Alta) */}
        <div className="flex flex-col items-center gap-4 bg-void/30 p-2 rounded-lg border border-white/5 flex-1">
          <div className="flex w-full justify-between items-center mb-1">
            <span className="text-[9px] font-mono text-text-muted">LPF</span>
            <button 
              onClick={() => setCrossoverLP(ch.id, ch.crossover.lowpassFreq, !ch.crossover.lowpassEnabled)}
              className={`w-2.5 h-2.5 rounded-full border transition-colors ${
                ch.crossover.lowpassEnabled ? 'bg-danger border-danger shadow-[0_0_6px_rgba(255,59,92,0.5)]' : 'bg-transparent border-text-muted'
              }`}
            />
          </div>
          <RotaryKnob
            value={ch.crossover.lowpassFreq}
            min={20}
            max={20000}
            step={1}
            size={52}
            unit="Hz"
            label="FREQ"
            color={ch.crossover.lowpassEnabled ? ch.color : '#44445A'}
            formatValue={(val) => formatFrequency(val)}
            onChange={(val) => setCrossoverLP(ch.id, val, ch.crossover.lowpassEnabled)}
          />
          <span className="text-[9px] font-mono text-text-muted">24dB/oct</span>
        </div>
      </div>

      {/* Time Alignment */}
      <div className="w-full mt-4 bg-void/30 p-2 rounded-lg border border-white/5 flex items-center justify-between">
         <span className="text-[9px] font-mono text-text-muted">TIME ALIGN</span>
         <div className="flex items-center gap-2">
           <RotaryKnob
              value={ch.delayMs}
              min={0}
              max={30}
              step={0.1}
              size={36}
              unit="ms"
              label=""
              color="#FFFFFF"
              formatValue={(val) => val.toFixed(1)}
              onChange={(val) => setChannelDelay(ch.id, val)}
            />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-text-primary">{ch.delayMs.toFixed(1)} ms</span>
              <span className="text-[9px] font-mono text-text-muted">{((ch.delayMs / 1000) * 343 * 100).toFixed(1)} cm</span>
            </div>
         </div>
      </div>

    </div>
  )
}
