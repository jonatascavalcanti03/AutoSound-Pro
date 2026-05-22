'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, ShieldCheck, TerminalSquare, Zap, Loader2, Cpu } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(1)
  }

  useEffect(() => {
    if (step === 1) {
      const t1 = setTimeout(() => setStep(2), 1500)
      const t2 = setTimeout(() => setStep(3), 3000)
      const t3 = setTimeout(() => {
        router.push('/studio')
      }, 4500)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
    return undefined
  }, [step, router])

  return (
    <div className="min-h-screen bg-void text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-signal/5 via-void to-void pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

      {/* Auth Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-[#050505]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_0_100px_rgba(0,255,148,0.05)] p-12 relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-void border border-white/10 flex items-center justify-center mb-6 shadow-glow">
            <Cpu size={32} className="text-signal" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 text-center text-balance">Crie sua Runtime DSP</h1>
          <p className="text-text-secondary font-mono text-xs md:text-sm tracking-widest uppercase text-center text-balance">
            Inicialize sua workstation automotiva pessoal.
          </p>
        </div>

        {step === 0 ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-text-muted tracking-widest uppercase ml-2">Identificação (Nome)</label>
              <input 
                type="text" 
                required
                className="w-full bg-void border border-white/10 rounded-2xl px-6 py-5 text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/50 transition-all"
                placeholder="Ex: Engenheiro Acústico"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-text-muted tracking-widest uppercase ml-2">ID de Sessão (E-mail)</label>
              <input 
                type="email" 
                required
                className="w-full bg-void border border-white/10 rounded-2xl px-6 py-5 text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/50 transition-all"
                placeholder="audio@system.local"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-text-muted tracking-widest uppercase ml-2">Chave Mestra (Senha)</label>
              <input 
                type="password" 
                required
                className="w-full bg-void border border-white/10 rounded-2xl px-6 py-5 text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/50 transition-all"
                placeholder="Crie uma chave segura"
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-4 bg-signal text-void font-bold font-mono text-sm tracking-widest uppercase rounded-2xl px-6 py-6 hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,255,148,0.2)] flex items-center justify-center gap-3"
            >
              <ShieldCheck size={20} />
              Configurar Ambiente Realtime
            </button>

            <div className="mt-6 text-center">
              <a href="/auth/login" className="text-xs font-mono text-text-secondary hover:text-white transition-colors tracking-widest uppercase">
                Já possui uma Runtime? Fazer Login
              </a>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-6 font-mono text-sm">
            <div className="p-8 rounded-3xl bg-void border border-white/5 space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 text-white">
                {step >= 1 ? <CheckCircle2 size={16} className="text-signal" /> : <Loader2 size={16} className="animate-spin text-text-muted" />}
                <span>Gerando arquitetura de DSP pessoal...</span>
              </motion.div>
              
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: step >= 2 ? 1 : 0 }} className="flex items-center gap-4 text-white">
                {step >= 2 ? <CheckCircle2 size={16} className="text-signal" /> : step >= 1 ? <Loader2 size={16} className="animate-spin text-signal" /> : <div className="w-4" />}
                <span>Inicializando AudioWorklet Engine...</span>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: step >= 3 ? 1 : 0 }} className="flex items-center gap-4 text-white">
                {step >= 3 ? <Activity size={16} className="text-signal animate-pulse" /> : step >= 2 ? <Loader2 size={16} className="animate-spin text-signal" /> : <div className="w-4" />}
                <span className={step >= 3 ? "text-signal font-bold" : ""}>Instância pronta. Entrando no Studio.</span>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Decorative Terminal HUD */}
      <div className="fixed bottom-10 left-10 text-[10px] font-mono text-text-muted uppercase tracking-widest hidden md:block">
        <div className="flex items-center gap-2 mb-2"><TerminalSquare size={12} /> ALLOCATING NEW WORKSPACE</div>
        <div>MEMORY: SHARED_ARRAY_BUFFER SECURED</div>
        <div>THREAD: C++ AUDIO THREAD ISOLATED</div>
      </div>
    </div>
  )
}

const CheckCircle2 = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)
