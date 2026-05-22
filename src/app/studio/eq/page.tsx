'use client'
import React, { useEffect, useState } from 'react'
import { useMixerStore, selectAllChannels, selectActiveChannelId, selectChannel } from '@/store/mixer.store'
import { InteractiveEQGraph } from '@/components/graphs/InteractiveEQGraph/InteractiveEQGraph'
import { RotaryKnob } from '@/components/atoms/RotaryKnob'
import { formatFrequency, formatGain } from '@/lib/utils'
import { Sliders } from 'lucide-react'

export default function EQPage() {
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

      <EQEditor channelId={activeChannelId} />
    </div>
  )
}

// Sub-componente para evitar re-render da página toda
function EQEditor({ channelId }: { channelId: string }) {
  const channel = useMixerStore(selectChannel(channelId))
  const setEQBandGain = useMixerStore(s => s.setEQBandGain)
  const setEQBandFreq = useMixerStore(s => s.setEQBandFreq)
  const setEQBandQ    = useMixerStore(s => s.setEQBandQ)
  const toggleEQBand  = useMixerStore(s => s.toggleEQBand)
  
  const [activeBandId, setActiveBandId] = useState<string | undefined>()

  if (!channel) return null

  return (
    <>
      {/* ─── Graph Area ──────────────────────────────────────────────────────── */}
      <div className="glass-panel rounded-xl p-3 flex-none relative" style={{ height: 'max(35vh, 250px)' }}>
        <InteractiveEQGraph 
          channelId={channelId} 
          activeBandId={activeBandId}
          onBandSelect={setActiveBandId}
        />
      </div>

      {/* ─── Band Controls Area ──────────────────────────────────────────────── */}
      <div className="glass-panel rounded-xl p-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-4 flex-none">
          <Sliders size={14} className="text-text-muted" />
          <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">
            Bandas Paramétricas
          </h2>
        </div>

        <div className="flex gap-2 lg:gap-4 overflow-x-auto pb-4 flex-1">
          {channel.eq.map((band, idx) => {
            const isActive = activeBandId === band.id

            return (
              <div 
                key={band.id}
                onClick={() => setActiveBandId(band.id)}
                className={`flex flex-col items-center min-w-[100px] p-3 rounded-lg border transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-void/40 border-primary/30 shadow-[0_4px_12px_rgba(0,0,0,0.2)]' 
                    : 'bg-void/10 border-white/5 hover:bg-void/20 hover:border-white/10'
                }`}
              >
                {/* Header da Banda */}
                <div className="flex w-full items-center justify-between mb-4">
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                    #{idx + 1}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleEQBand(channelId, band.id) }}
                    className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors ${
                      band.enabled 
                        ? 'bg-signal border-signal shadow-[0_0_8px_rgba(0,255,136,0.4)]' 
                        : 'bg-transparent border-text-muted'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-6 w-full items-center">
                  {/* Gain Knob */}
                  <RotaryKnob
                    value={band.gain}
                    min={-24}
                    max={24}
                    step={0.5}
                    size={48}
                    unit=""
                    label="GAIN"
                    color={band.enabled ? (band.gain > 0 ? '#FF9500' : band.gain < 0 ? '#00D4FF' : '#FFFFFF') : '#44445A'}
                    formatValue={(val) => formatGain(val)}
                    onChange={(val) => setEQBandGain(channelId, band.id, val)}
                  />

                  {/* Freq Knob */}
                  <RotaryKnob
                    value={band.frequency}
                    min={20}
                    max={20000}
                    step={1}
                    size={48}
                    unit="Hz"
                    label="FREQ"
                    color={band.enabled ? '#FFFFFF' : '#44445A'}
                    formatValue={(val) => formatFrequency(val)}
                    onChange={(val) => setEQBandFreq(channelId, band.id, val)}
                  />

                  {/* Q Knob */}
                  <RotaryKnob
                    value={band.q}
                    min={0.1}
                    max={10.0}
                    step={0.1}
                    size={48}
                    unit=""
                    label="Q-FAC"
                    color={band.enabled ? '#FFFFFF' : '#44445A'}
                    formatValue={(val) => val.toFixed(2)}
                    onChange={(val) => setEQBandQ(channelId, band.id, val)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
