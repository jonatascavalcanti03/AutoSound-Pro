'use client'
// src/app/(dashboard)/page.tsx
import React, { useState } from 'react'
import { RotaryKnob } from '@/components/atoms/RotaryKnob'
import { VUMeter } from '@/components/atoms/VUMeter'
import { EQGraph } from '@/components/graphs/EQGraph/EQGraph'
import { SpectrumAnalyzer } from '@/components/meters/SpectrumAnalyzer/SpectrumAnalyzer'
import { useMixerStore, selectAllChannels, selectMasterGain } from '@/store/mixer.store'
import { useAudioEngineSync } from '@/hooks/useAudioEngineSync'
import { formatGain } from '@/lib/utils'
import { Activity, Sliders, AudioWaveform, Cpu, Search, Layers, Maximize2 } from 'lucide-react'

export default function DashboardPage() {
  const channels    = useMixerStore(selectAllChannels)
  const masterGain  = useMixerStore(selectMasterGain)
  const setChannelGain = useMixerStore(s => s.setChannelGain)
  const setMasterGain  = useMixerStore(s => s.setMasterGain)
  const toggleMute     = useMixerStore(s => s.toggleMute)
  const toggleSolo     = useMixerStore(s => s.toggleSolo)

  // O hook gerencia a inicialização. A flag isReady será usada para animar os componentes mock
  const { isReady, isPlayingNoise } = useAudioEngineSync()

  // Controla abas no display principal
  const [activeTab, setActiveTab] = useState<'eq' | 'spectrum' | 'routing'>('spectrum')

  return (
    <div className="flex flex-col h-full p-2 lg:p-4 gap-3 lg:gap-4 overflow-hidden">

      {/* ─── Top Level: Main Display & System Status ───────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-3 lg:gap-4 flex-none" style={{ height: 'max(40vh, 300px)' }}>
        
        {/* Main Display (Graphs) */}
        <div className="glass-panel rounded-xl p-3 flex-1 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 flex-none relative z-10">
            <div className="flex items-center gap-1 bg-void/50 p-1 rounded-lg border border-white/5">
              <button 
                onClick={() => setActiveTab('spectrum')}
                className={`px-4 py-1 text-[10px] font-mono rounded-md transition-colors ${activeTab === 'spectrum' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
              >
                RTA SPECTRUM
              </button>
              <button 
                onClick={() => setActiveTab('eq')}
                className={`px-4 py-1 text-[10px] font-mono rounded-md transition-colors ${activeTab === 'eq' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
              >
                EQ CURVE
              </button>
              <button 
                onClick={() => setActiveTab('routing')}
                className={`px-4 py-1 text-[10px] font-mono rounded-md transition-colors ${activeTab === 'routing' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
              >
                ROUTING
              </button>
            </div>
            
            <button className="p-1.5 text-text-muted hover:text-primary transition-colors bg-void/50 rounded-md border border-white/5">
              <Maximize2 size={14} />
            </button>
          </div>

          <div className="flex-1 w-full relative rounded-lg overflow-hidden border border-white/5 bg-void">
            {activeTab === 'spectrum' && <SpectrumAnalyzer active={isReady || isPlayingNoise} />}
            {activeTab === 'eq' && <EQGraph />}
            {activeTab === 'routing' && (
              <div className="absolute inset-0 flex items-center justify-center text-text-muted font-mono text-xs opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface to-void">
                <Layers size={32} className="mb-2 opacity-20" />
                <br/>ROUTING MATRIX VISUALIZATION
              </div>
            )}
          </div>
        </div>

        {/* System Status Panel */}
        <div className="glass-panel rounded-xl p-4 w-full xl:w-80 flex flex-col gap-4 flex-none">
          <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} /> DSP Status
          </h2>
          
          <div className="grid grid-cols-2 gap-3 flex-1">
            <StatBox label="DSP Load" value="12%" color="text-primary" />
            <StatBox label="Latency" value="2.9 ms" color="text-signal" />
            <StatBox label="Sample Rate" value="48 kHz" color="text-text-secondary" />
            <StatBox label="Buffer" value="128" color="text-text-secondary" />
            
            <div className="col-span-2 mt-auto p-3 bg-void rounded-lg border border-white/5 flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] ${isReady ? 'bg-signal text-signal' : 'bg-text-muted text-transparent'}`} />
               <div>
                 <p className="text-[10px] font-mono text-text-muted">HARDWARE</p>
                 <p className="text-xs font-mono text-text-primary">{isReady ? 'CONECTADO' : 'AGUARDANDO INIT'}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Level: Mixer Console ─────────────────────────────────────── */}
      <div className="glass-panel rounded-xl p-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 flex-none">
          <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest flex items-center gap-2">
            <Sliders size={14} /> Console de Mixagem
          </h2>
          <span className="text-[10px] text-text-muted font-mono bg-void px-3 py-1 rounded-full border border-white/5">
            {channels.length} CANAIS
          </span>
        </div>

        <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 flex-1">
          {/* Channel strips */}
          {channels.map((ch) => (
            <ChannelStrip
              key={ch.id}
              channelId={ch.id}
              name={ch.name}
              color={ch.color}
              gainDb={ch.gainDb}
              muted={ch.muted}
              soloed={ch.soloed}
              onGainChange={(db) => setChannelGain(ch.id, db)}
              onMuteToggle={() => toggleMute(ch.id)}
              onSoloToggle={() => toggleSolo(ch.id)}
            />
          ))}

          {/* Separator */}
          <div className="w-px bg-white/[0.06] mx-2 self-stretch" />

          {/* Master section */}
          <div className="flex flex-col items-center gap-3 min-w-[80px] bg-void/30 p-2 rounded-lg border border-white/5">
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Master</p>
            <div className="flex gap-1.5 flex-1 items-end py-2">
              <VUMeter isMaster showPeak height={160} width={16} active />
              <VUMeter isMaster showPeak height={160} width={16} active />
            </div>
            <div className="mt-auto flex flex-col items-center">
              <RotaryKnob
                value={masterGain}
                min={-60}
                max={12}
                step={0.5}
                size={56}
                unit=" dB"
                color="#FFFFFF"
                onChange={setMasterGain}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Componentes Auxiliares ───────────────────────────────────────────────────

function StatBox({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="bg-elevated rounded-lg p-3 flex flex-col justify-center border border-white/5">
      <p className="text-[9px] text-text-muted font-mono uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-display font-semibold ${color} mt-1`}>{value}</p>
    </div>
  )
}

interface ChannelStripProps {
  channelId:    string
  name:         string
  color:        string
  gainDb:       number
  muted:        boolean
  soloed:       boolean
  onGainChange: (db: number) => void
  onMuteToggle: () => void
  onSoloToggle: () => void
}

function ChannelStrip({
  channelId, name, color, gainDb, muted, soloed,
  onGainChange, onMuteToggle, onSoloToggle,
}: ChannelStripProps) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[72px] bg-void/20 p-2 rounded-lg border border-white/5 hover:bg-void/40 transition-colors group">
      {/* Channel name & Info */}
      <div className="w-full flex flex-col items-center gap-1 mb-1">
        <p className="text-[10px] font-mono text-text-secondary uppercase tracking-wider truncate max-w-full group-hover:text-text-primary transition-colors">
          {name}
        </p>
        <div className="w-full h-0.5 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color }} />
      </div>

      {/* VU Meter puxando nível real via channelId */}
      <div className="flex-1 py-2 flex items-end">
        <VUMeter
          channelId={channelId}
          showPeak
          height={140}
          width={18}
          active={!muted}
        />
      </div>

      {/* Gain Knob */}
      <div className="mt-2 mb-3">
        <RotaryKnob
          value={gainDb}
          min={-60}
          max={12}
          step={0.5}
          size={48}
          unit=" dB"
          color={muted ? '#44445A' : color}
          onChange={onGainChange}
        />
      </div>

      {/* Mute / Solo */}
      <div className="flex gap-1.5 w-full justify-center">
        <button
          onClick={onMuteToggle}
          className={`flex-1 text-[10px] font-mono font-semibold py-1 rounded transition-all border ${
            muted
              ? 'bg-danger/20 text-danger border-danger/30 shadow-[0_0_8px_rgba(255,59,92,0.3)]'
              : 'bg-elevated text-text-muted border-white/5 hover:text-text-primary hover:border-white/10'
          }`}
        >
          M
        </button>
        <button
          onClick={onSoloToggle}
          className={`flex-1 text-[10px] font-mono font-semibold py-1 rounded transition-all border ${
            soloed
              ? 'bg-amber/20 text-amber border-amber/30 shadow-[0_0_8px_rgba(255,149,0,0.3)]'
              : 'bg-elevated text-text-muted border-white/5 hover:text-text-primary hover:border-white/10'
          }`}
        >
          S
        </button>
      </div>
    </div>
  )
}
