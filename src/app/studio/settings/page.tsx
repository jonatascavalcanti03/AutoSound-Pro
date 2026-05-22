'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings2, Cpu, Zap, HardDrive, 
  Bluetooth, Share2, ShieldCheck, 
  Terminal, Monitor, Database, Gauge,
  Wifi, Activity, Lock, AlertTriangle
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium/PremiumCard'
import { cn } from '@/lib/utils'

export default function ConfigPage() {
  const [performanceMode, setPerformanceMode] = useState(true)
  const [developerMode, setDeveloperMode] = useState(false)
  const [safeMode, setSafeMode] = useState(false)
  const [time, setTime] = useState('00:00:00:000')

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date()
      setTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}:${d.getMilliseconds().toString().padStart(3, '0')}`)
    }, 47)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* BIOS Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Settings2 className="text-primary" size={28} />
            <h1 className="text-3xl font-bold font-mono tracking-widest uppercase text-white">
              System Config
            </h1>
          </div>
          <p className="text-xs text-primary font-mono tracking-widest flex items-center gap-2">
            AUTOSOUND PRO OS <span className="text-white/30">|</span> BUILD 8842.1 <span className="text-white/30">|</span> X86_64 WASM
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="font-mono text-xl font-bold text-white tracking-widest">{time}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
            <span className="text-[10px] font-bold font-mono text-primary uppercase tracking-widest">KERNEL ONLINE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Core Settings */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Audio Engine Config */}
          <PremiumCard title="Core Audio DSP Settings" icon={Cpu}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold font-mono text-text-muted uppercase tracking-wider">Audio Buffer Size</label>
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">1.3ms Latency</span>
                  </div>
                  <div className="relative">
                    <select className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-sm font-mono text-white outline-none focus:border-primary/50 appearance-none shadow-inner">
                      <option>64 samples (Ultra-Low)</option>
                      <option selected>128 samples (Fastest)</option>
                      <option>256 samples (Balanced)</option>
                      <option>512 samples (Stable)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">▼</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-[11px] font-bold font-mono text-text-muted uppercase tracking-wider mb-2 block">Internal Sample Rate</label>
                  <div className="flex gap-2">
                    {['44.1 kHz', '48 kHz', '96 kHz'].map(rate => (
                      <button key={rate} className={cn(
                        "flex-1 py-3 border rounded-xl text-xs font-bold transition-all uppercase tracking-wider",
                        rate === '96 kHz' 
                          ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(0,212,255,0.1)]" 
                          : "bg-[#0a0a0a] border-white/10 text-text-muted hover:border-white/30 hover:text-white"
                      )}>
                        {rate}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Toggles */}
                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber/10 rounded-lg text-amber group-hover:scale-110 transition-transform"><Zap size={18} /></div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Performance Mode</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Bypass power saving for min latency</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPerformanceMode(!performanceMode)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors shadow-inner",
                      performanceMode ? "bg-amber" : "bg-white/10"
                    )}
                  >
                    <motion.div 
                      animate={{ x: performanceMode ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform"><Terminal size={18} /></div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Developer Console</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Enable WASM & Worklet debug logs</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDeveloperMode(!developerMode)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors shadow-inner",
                      developerMode ? "bg-primary" : "bg-white/10"
                    )}
                  >
                    <motion.div 
                      animate={{ x: developerMode ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-danger/20 hover:border-danger/40 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-danger/10 rounded-lg text-danger group-hover:scale-110 transition-transform"><AlertTriangle size={18} /></div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Safe Mode</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Limits master output to -12dBFS</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSafeMode(!safeMode)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors shadow-inner",
                      safeMode ? "bg-danger" : "bg-white/10"
                    )}
                  >
                    <motion.div 
                      animate={{ x: safeMode ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                    />
                  </button>
                </div>

              </div>
            </div>
          </PremiumCard>

          {/* HAL Diagnostics */}
          <PremiumCard title="Hardware Abstraction Layer (HAL)" icon={Database}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Transport Link', value: 'WEBSOCKET', icon: Wifi, color: 'text-primary' },
                  { label: 'Device Target', value: 'ESP32-S3', icon: Cpu, color: 'text-amber' },
                  { label: 'Packet Drop', value: '0.000%', icon: ShieldCheck, color: 'text-primary' },
                  { label: 'Tx/Rx Jitter', value: '0.8ms', icon: Gauge, color: 'text-primary' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-[#050505] rounded-xl border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: stat.color === 'text-primary' ? 'var(--primary)' : 'var(--amber)' }} />
                    <stat.icon size={16} className={cn("mb-3", stat.color)} />
                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-sm font-bold font-mono text-white tracking-wide">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#020202] rounded-lg p-5 font-mono text-xs text-primary/80 border border-primary/20 shadow-inner overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                </div>
                <div className="space-y-2 opacity-90">
                  <p className="flex gap-4"><span className="text-white/30">00:00:12</span> <span>[HAL] Boot sequence initiated... OK</span></p>
                  <p className="flex gap-4"><span className="text-white/30">00:00:13</span> <span>[HAL] Handshake successful with ESP32-S3 (ID: 0x4F22_A1)</span></p>
                  <p className="flex gap-4"><span className="text-white/30">00:00:13</span> <span>[HAL] Negotiated Protocol: ASPBTP v2.4 (Binary Delta)</span></p>
                  <p className="flex gap-4"><span className="text-white/30">00:00:14</span> <span>[HAL] Realtime Stream initialized at 2Mbaud</span></p>
                  <p className="flex gap-4 animate-pulse text-white"><span className="text-white/30">00:00:14</span> <span>[HAL] Awaiting sync instructions...</span></p>
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Right Column: Status & Telemetry */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          <PremiumCard title="Thread Telemetry" icon={Monitor}>
            <div className="space-y-6">
              
              <div className="space-y-3 p-4 bg-[#050505] rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                  <span className="text-text-muted flex items-center gap-2"><Cpu size={12} /> Main JS Thread</span>
                  <span className="text-primary font-bold">8%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ['5%', '12%', '8%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full bg-primary shadow-[0_0_10px_rgba(0,212,255,0.8)]" 
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 bg-[#050505] rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                  <span className="text-text-muted flex items-center gap-2"><Activity size={12} /> Audio Worklet</span>
                  <span className="text-primary font-bold">14%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ['10%', '18%', '14%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full bg-primary shadow-[0_0_10px_rgba(0,212,255,0.8)]" 
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 bg-[#050505] rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                  <span className="text-text-muted flex items-center gap-2"><Database size={12} /> WASM Heap</span>
                  <span className="text-primary font-bold">42 / 256 MB</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[16%] bg-primary shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <Lock size={12} className="text-primary" />
                    <span className="text-[11px] font-bold font-mono text-white uppercase tracking-widest">SharedArrayBuffer</span>
                  </div>
                  <span className="text-[10px] font-mono text-black bg-primary px-2 py-0.5 rounded font-bold">LOCKED</span>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed px-2">
                  Zero-copy memory sharing active. Enables lock-free IPC between UI Thread and AudioWorklet for sub-millisecond parameter updates.
                </p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard title="System Actions" icon={HardDrive}>
            <div className="space-y-4">
              <div className="p-4 bg-[#050505] rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest">
                  <span className="text-text-muted uppercase">Cloud DB Size</span>
                  <span className="text-white font-bold">1.4 MB</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest">
                  <span className="text-text-muted uppercase">Local Cache</span>
                  <span className="text-white font-bold">12.8 MB</span>
                </div>
              </div>
              
              <button className="w-full py-3.5 bg-primary/10 border border-primary/30 rounded-xl text-xs font-bold font-mono tracking-widest text-primary hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all flex items-center justify-center gap-2">
                <Share2 size={16} /> EXPORT DIAGNOSTICS
              </button>
              <button className="w-full py-3.5 bg-[#050505] border border-danger/30 rounded-xl text-xs font-bold font-mono tracking-widest text-danger hover:bg-danger/10 transition-all">
                FACTORY RESET
              </button>
            </div>
          </PremiumCard>

        </div>
      </div>
    </div>
  )
}
