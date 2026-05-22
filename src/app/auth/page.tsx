'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Fingerprint, Lock, ShieldCheck, TerminalSquare } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [status, setStatus] = useState("AWAITING CREDENTIALS")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    
    // Simulate complex authentication sequence
    setTimeout(() => setStatus("VERIFYING ENCRYPTION KEYS..."), 500)
    setTimeout(() => setStatus("ALLOCATING DSP SESSION..."), 1200)
    setTimeout(() => setStatus("ACCESS GRANTED"), 2000)
    setTimeout(() => {
      router.push('/studio/mixer')
    }, 2400)
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-void to-void pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-primary/20 blur-sm pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 glass-panel rounded-2xl border border-white/10 shadow-panel"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#050505] border border-white/5 flex items-center justify-center shadow-glow-sm relative">
            <div className="absolute inset-0 bg-primary/10 blur-xl animate-pulse" />
            <ShieldCheck size={32} className="text-primary relative z-10" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-widest uppercase mb-2">
            System Login
          </h1>
          <p className="text-xs font-mono tracking-widest text-primary animate-pulse">
            {status}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <TerminalSquare size={16} className="text-text-muted group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                disabled={isAuthenticating}
                className="w-full bg-[#050505] border border-white/10 rounded-lg py-3 pl-12 pr-4 text-sm font-mono text-white placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
                placeholder="OPERATOR ID"
                defaultValue="ADMIN"
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={16} className="text-text-muted group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="password" 
                disabled={isAuthenticating}
                className="w-full bg-[#050505] border border-white/10 rounded-lg py-3 pl-12 pr-4 text-sm font-mono text-white placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
                placeholder="PASSPHRASE"
                defaultValue="********"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isAuthenticating}
            className="w-full relative group overflow-hidden bg-primary/10 border border-primary/30 text-primary py-4 rounded-lg font-bold font-mono tracking-widest uppercase transition-all hover:bg-primary/20 disabled:pointer-events-none shadow-glow-sm"
          >
            <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isAuthenticating ? (
                <>
                  <Fingerprint size={18} className="animate-pulse" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <Fingerprint size={18} />
                  AUTHORIZE ACCESS
                </>
              )}
            </span>
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[9px] font-mono tracking-widest text-text-muted uppercase">
            SECURE DSP KERNEL CONNECTION <br/> ENCRYPTED TUNNEL REQUIRED
          </p>
        </div>
      </motion.div>
    </div>
  )
}
