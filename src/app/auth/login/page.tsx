'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ShieldCheck, TerminalSquare, Zap, Loader2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type BootStep = 0 | 1 | 2 | 3

export default function LoginPage() {
  const [step, setStep]         = useState<BootStep>(0)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setLoading(false)
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Credenciais inválidas. Verifique e-mail e senha.'
          : authError.message
      )
      return
    }

    // Sucesso — dispara a sequência de boot animada
    setLoading(false)
    setStep(1)
    setTimeout(() => setStep(2), 1500)
    setTimeout(() => setStep(3), 3000)
    setTimeout(() => {
      // location.replace é mais confiável que router.push com COOP/COEP ativos
      location.replace('/studio')
    }, 4500)
  }, [email, password])

  return (
    <div className="min-h-screen bg-void text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-void to-void pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(0,212,255,0.2) 30px, rgba(0,212,255,0.2) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(0,212,255,0.2) 30px, rgba(0,212,255,0.2) 31px)',
        }}
      />

      {/* Auth Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-[#050505]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_0_100px_rgba(0,212,255,0.05)] p-12 relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-void border border-white/10 flex items-center justify-center mb-6 shadow-glow">
            <Zap size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 text-center">Autenticação DSP</h1>
          <p className="text-text-secondary font-mono text-sm tracking-widest uppercase text-center">
            Acesso ao Runtime Studio
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleLogin}
              className="flex flex-col gap-6"
            >
              {/* Error Banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl px-5 py-4 text-sm font-mono"
                  >
                    <AlertTriangle size={16} className="shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs font-mono text-text-muted tracking-widest uppercase ml-2">
                  ID do Usuário (E-mail)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-void border border-white/10 rounded-2xl px-6 py-5 text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
                  placeholder="audio@system.local"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-text-muted tracking-widest uppercase ml-2">
                  Chave de Acesso (Senha)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-void border border-white/10 rounded-2xl px-6 py-5 text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-white text-void font-bold font-mono text-sm tracking-widest uppercase rounded-2xl px-6 py-6 hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 disabled:opacity-60 disabled:scale-100"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <ShieldCheck size={20} />
                )}
                {loading ? 'Verificando...' : 'Iniciar Sequência de Boot'}
              </button>

              <div className="mt-6 text-center">
                <a
                  href="/auth/register"
                  className="text-xs font-mono text-text-secondary hover:text-white transition-colors tracking-widest uppercase"
                >
                  Não possui ambiente? Criar Runtime
                </a>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-6 font-mono text-sm"
            >
              <div className="p-8 rounded-3xl bg-void border border-white/5 space-y-6">
                {/* Step 1 */}
                <div className="flex items-center gap-4 text-white">
                  {step >= 1
                    ? <CheckCircle2 size={16} className="text-signal" />
                    : <Loader2 size={16} className="animate-spin text-text-muted" />}
                  <span>Verificando sessão do sistema...</span>
                </div>

                {/* Step 2 */}
                <motion.div
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: step >= 2 ? 1 : 0.3 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-4 text-white"
                >
                  {step >= 2
                    ? <CheckCircle2 size={16} className="text-signal" />
                    : <Loader2 size={16} className="animate-spin text-primary" />}
                  <span>Alocando ambiente realtime...</span>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: step >= 3 ? 1 : 0.3 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-4 text-white"
                >
                  {step >= 3
                    ? <Activity size={16} className="text-signal animate-pulse" />
                    : <Loader2 size={16} className="animate-spin text-primary" />}
                  <span className={step >= 3 ? 'text-signal font-bold' : ''}>
                    DSP Engine Online. Entrando no Studio.
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Decorative Terminal HUD */}
      <div className="fixed bottom-10 left-10 text-[10px] font-mono text-text-muted uppercase tracking-widest hidden md:block">
        <div className="flex items-center gap-2 mb-2"><TerminalSquare size={12} /> AUTH SECURE KERNEL</div>
        <div>LATENCY: 0.2ms</div>
        <div>ENCRYPTION: AES-256-GCM</div>
      </div>
    </div>
  )
}

const CheckCircle2 = ({ size, className }: { size: number; className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)
