'use client'
import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Activity, Play, Cpu, Wifi, Zap, Sliders,
  AudioWaveform, MonitorSpeaker, Database, Cloud,
  Combine, Radio, XCircle, CheckCircle2
} from 'lucide-react'

// ─── BACKGROUND ────────────────────────────────────────────────────────────────
const CyberGrid = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    let id: number
    const draw = (t: number) => {
      ctx.clearRect(0, 0, c.width, c.height)
      const g = 80
      ctx.strokeStyle = 'rgba(0,212,255,0.025)'; ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x < c.width; x += g) { ctx.moveTo(x, 0); ctx.lineTo(x, c.height) }
      for (let y = (t * 0.015) % g; y < c.height; y += g) { ctx.moveTo(0, y); ctx.lineTo(c.width, y) }
      ctx.stroke()
      const gr = ctx.createRadialGradient(c.width / 2, c.height * 0.3, 0, c.width / 2, c.height * 0.3, 900)
      gr.addColorStop(0, 'rgba(0,212,255,0.06)'); gr.addColorStop(1, 'transparent')
      ctx.fillStyle = gr; ctx.fillRect(0, 0, c.width, c.height)
      id = requestAnimationFrame(draw)
    }
    draw(0); return () => cancelAnimationFrame(id)
  }, [])
  return <canvas ref={ref} width={1920} height={1080} className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0" />
}

// ─── PRIMITIVES ─────────────────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-5%' }}
    transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
)

// Inline badge pill
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 font-mono text-[10px] font-semibold tracking-widest text-primary uppercase">
    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
    {children}
  </span>
)

// Eyebrow + H2 + body — always full-width, always centered
const SectionHead = ({ pill, title, body }: {
  pill: string; title: React.ReactNode; body?: string
}) => (
  <div className="flex w-full flex-col items-center gap-5 text-center">
    <Pill>{pill}</Pill>
    <h2
      className="font-display font-bold text-white tracking-tight"
      style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3.2rem)', lineHeight: 1.1, maxWidth: 700 }}
    >
      {title}
    </h2>
    {body && (
      <p
        className="font-light leading-relaxed text-text-secondary"
        style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)', maxWidth: 560 }}
      >
        {body}
      </p>
    )}
  </div>
)

// Centered container — works in any context
const W = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div
    className={className}
    style={{ width: '100%', maxWidth: 960, marginLeft: 'auto', marginRight: 'auto', paddingLeft: 24, paddingRight: 24 }}
  >
    {children}
  </div>
)

// ─── PAGE ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const heroOp = useTransform(scrollYProgress, [0, 0.22], [1, 0])
  const heroY  = useTransform(scrollYProgress, [0, 0.22], [0, 80])

  return (
    <div className="relative bg-void text-white overflow-x-hidden selection:bg-primary/20">
      <CyberGrid />

      {/* ── NAV ───────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-white/5 bg-void/75 backdrop-blur-2xl">
        <div className="flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#080808]">
              <Zap size={16} className="text-primary" fill="currentColor" />
            </div>
            <span className="hidden font-display text-sm font-bold tracking-widest uppercase sm:block">
              AutoSound <span className="text-primary">Pro</span>
            </span>
          </div>

          <div className="hidden items-center gap-8 font-mono text-[10px] tracking-widest text-white/40 uppercase lg:flex">
            {['Plataforma', 'Tecnologia', 'Módulos', 'Hardware'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          <Link
            href="/auth/login"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-mono text-[10px] font-bold tracking-widest text-void uppercase transition hover:bg-white/90 active:scale-95"
          >
            <Activity size={13} /> Runtime Login
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(0,212,255,0.13),transparent)]" />

        <motion.div
          style={{ y: heroY, opacity: heroOp }}
          className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <Pill>DSP Runtime v1.0 — Online</Pill>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold tracking-tighter"
            style={{ fontSize: 'clamp(2.8rem, 7.5vw, 6rem)', lineHeight: 0.96, maxWidth: 860 }}
          >
            O Futuro do DSP Automotivo{' '}
            <span className="bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent">
              em Tempo Real.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.4 }}
            className="font-light leading-relaxed text-text-secondary"
            style={{ fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', maxWidth: 520 }}
          >
            Uma workstation profissional de áudio automotivo — Runtime DSP, WebAssembly e
            sincronização inteligente com hardware.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/auth/register"
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 font-mono text-xs font-bold tracking-widest text-void uppercase shadow-[0_0_40px_rgba(0,212,255,0.3)] transition hover:brightness-110 active:scale-95"
            >
              <Play size={14} fill="currentColor" /> Criar Runtime
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-3.5 font-mono text-xs font-bold tracking-widest text-white uppercase transition hover:bg-white/10 active:scale-95"
            >
              Fazer Login
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating dashboard ghost */}
        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-auto mt-16 w-full max-w-5xl"
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#040404] shadow-[0_32px_100px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-[9px] tracking-widest text-white/20">AUTOSOUND PRO — RUNTIME STUDIO</span>
            </div>
            <div className="grid grid-cols-4 gap-px bg-white/[0.03] p-px">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex h-28 flex-col justify-end gap-2 bg-[#040404] p-4">
                  <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${55 + Math.sin(i * 1.3) * 30}%` }} />
                  </div>
                  <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-signal/60" style={{ width: `${40 + Math.sin(i * 0.7) * 25}%` }} />
                  </div>
                  <span className="font-mono text-[8px] tracking-widest text-white/20">CH 0{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── ALL SECTIONS ── */}

        <W className="relative z-10">
        <section className="flex flex-col items-center gap-14 py-32">
          <FadeIn className="flex w-full flex-col items-center gap-6 text-center">
            <XCircle size={44} className="text-danger/60" strokeWidth={1.5} />
            <SectionHead
              pill="O Problema"
              title="A era dos DSPs lentos acabou."
              body="Aplicativos que demoram segundos para atualizar. Interfaces que esmagam botões. Gráficos falsos que não representam o som real. O mercado automotivo estagnou — até agora."
            />
          </FadeIn>

          <FadeIn delay={0.1} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { value: '> 200ms', label: 'Latência típica de DSPs comuns' },
              { value: '90%', label: 'Interfaces sem gráficos reais' },
              { value: 'Nenhuma', label: 'Integração com hardware real' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-danger/15 bg-danger/5 p-6 text-center">
                <div className="mb-2 font-display text-3xl font-bold text-danger">{s.value}</div>
                <div className="font-mono text-xs tracking-wide text-text-secondary">{s.label}</div>
              </div>
            ))}
          </FadeIn>
        </section>
        </W>

        {/* ── SOLUTION ── */}
        <W className="relative z-10">
        <section className="flex flex-col items-center gap-12 py-20 border-t border-white/5">
          <FadeIn className="w-full">
            <SectionHead
              pill="A Solução"
              title="O primeiro Runtime DSP do mundo para o navegador."
              body="O AutoSound Pro não é um painel de controle. É um ecossistema completo de engenharia de áudio — nascido da tecnologia que rege os estúdios profissionais."
            />
          </FadeIn>

          <FadeIn delay={0.1} className="w-full">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 w-full">
            {[
              { icon: Activity, label: 'DSP em Tempo Real',   color: 'text-primary' },
              { icon: Cpu,      label: 'WebAssembly Core',    color: 'text-purple'  },
              { icon: Database, label: 'Shared Memory',       color: 'text-amber'   },
              { icon: Radio,    label: 'AudioWorklet',        color: 'text-signal'  },
              { icon: Wifi,     label: 'HAL Automotivo',      color: 'text-primary' },
              { icon: Cloud,    label: 'Cloud Snapshots',     color: 'text-purple'  },
            ].map(({ icon: Icon, label, color }, i) => (
              <FadeIn key={i} delay={i * 0.05} className="rounded-2xl border border-white/5 bg-[#060606] p-6 flex flex-col gap-4 hover:border-white/15 transition-colors group">
                <Icon size={20} className={`${color} transition-transform group-hover:scale-110 duration-300`} />
                <span className="text-sm font-semibold text-white">{label}</span>
              </FadeIn>
            ))}
          </div>
          </FadeIn>
        </section>
        </W>

        {/* ── SHOWCASE: MIXER ── */}
        <W className="relative z-10">
        <section className="flex flex-col items-center gap-10 py-20 border-t border-white/5">
          <FadeIn className="w-full">
            <SectionHead
              pill="Mixer Console"
              title="60fps. Zero latência. Controle total."
              body="VU Meters renderizados nativamente via GPU. Cada fader com precisão de ponto flutuante — operando em uma Audio Thread C++ imune a qualquer gargalo do navegador."
            />
          </FadeIn>

          <FadeIn delay={0.1} className="w-full">
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#040404] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
                <Pill>MIXER — REALTIME</Pill>
                <span className="ml-auto font-mono text-[9px] tracking-widest text-signal">AUDIO THREAD ACTIVE</span>
              </div>
              <div className="flex items-end gap-2 p-6" style={{ height: 200 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative w-full flex-1 overflow-hidden rounded-lg border border-white/8 bg-white/5 flex items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-signal to-primary/60"
                        style={{ height: `${35 + Math.abs(Math.sin(i * 0.8 + 0.3)) * 55}%`, opacity: 0.75 }}
                      />
                    </div>
                    <span className="font-mono text-[7px] tracking-widest text-white/30">CH{String(i + 1).padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </section>
        </W>

        {/* ── SHOWCASE: EQ ── */}
        <W className="relative z-10">
        <section className="flex flex-col items-center gap-10 py-20 border-t border-white/5">
          <FadeIn className="w-full">
            <SectionHead
              pill="Equalizador Paramétrico"
              title="Veja exatamente o que você está cortando."
              body="Espectrograma FFT em tempo real embaixo da curva. Não adivinhe frequências — ouça e ajuste com precisão cirúrgica, assistido por análise de áudio real."
            />
          </FadeIn>

          <FadeIn delay={0.1} className="w-full">
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#040404] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
                <Pill>EQ — FFT REALTIME</Pill>
                <span className="ml-auto font-mono text-[9px] tracking-widest text-purple">ANALYSIS ACTIVE</span>
              </div>
              <div className="relative" style={{ height: 200 }}>
                {/* FFT bars */}
                <div className="absolute inset-0 flex items-end px-4 pb-4">
                  {[...Array(60)].map((_, i) => (
                    <div
                      key={i}
                      className="mx-px flex-1 rounded-sm bg-purple/35"
                      style={{ height: `${20 + Math.abs(Math.sin(i * 0.18) * 52) + Math.abs(Math.cos(i * 0.07) * 20)}%` }}
                    />
                  ))}
                </div>
                {/* EQ curve */}
                <svg className="absolute inset-0 h-full w-full z-10" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <path
                    d="M0 140 C100 140 180 60 280 100 C380 140 450 170 550 90 C650 30 720 80 800 75"
                    fill="none" stroke="#00D4FF" strokeWidth="2"
                  />
                  {([[280, 100], [550, 90], [720, 80]] as [number, number][]).map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="4" fill="#fff" stroke="#00D4FF" strokeWidth="1.5" />
                  ))}
                </svg>
              </div>
            </div>
          </FadeIn>
        </section>

        </W>

        {/* ── HARDWARE ── */}
        <W className="relative z-10">
        <section id="hardware" className="flex flex-col items-center gap-10 py-20 border-t border-white/5">
          <FadeIn className="w-full">
            <SectionHead
              pill="Hardware Sync"
              title="Bidirecional. Instantâneo. Automotivo."
              body="Gire o volume no carro — a interface espelha no mesmo instante. Integração via HAL com ESP32, usando pacotes binários otimizados via WebSocket ou WebBLE."
            />
          </FadeIn>

          <FadeIn delay={0.1} className="w-full">
            <div className="rounded-2xl border border-white/8 bg-[#040404] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                {/* Web node */}
                <div className="flex flex-1 flex-col items-center gap-4 rounded-xl border border-white/8 bg-[#060606] p-6 text-center">
                  <MonitorSpeaker size={24} className="text-primary" />
                  <span className="font-mono text-xs tracking-widest text-white/50 uppercase">Web Runtime</span>
                  <div className="flex gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>

                {/* Connector */}
                <div className="flex items-center justify-center gap-2 flex-col sm:flex-row">
                  <div className="w-px h-8 sm:h-px sm:w-16 bg-gradient-to-b sm:bg-gradient-to-r from-primary to-signal" />
                  <span className="font-mono text-[9px] tracking-widest text-signal">HAL</span>
                  <div className="w-px h-8 sm:h-px sm:w-16 bg-gradient-to-b sm:bg-gradient-to-r from-signal to-primary" />
                </div>

                {/* ESP32 node */}
                <div className="flex flex-1 flex-col items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center shadow-[0_0_30px_rgba(0,212,255,0.06)]">
                  <Cpu size={24} className="text-primary" />
                  <span className="font-mono text-xs tracking-widest text-white/50 uppercase">ESP32 Core</span>
                  <span className="font-mono text-[9px] tracking-widest text-signal">TX 240b/s · RX 1.2kb/s</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
        </W>

        {/* ── COMPARISON ── */}
        <W className="relative z-10">
        <section className="py-20 border-t border-white/5">
          <FadeIn className="w-full overflow-hidden rounded-2xl border border-white/8 bg-[#040404] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <div className="border-b border-white/5 px-8 py-7 text-center">
              <h2
                className="font-display font-bold text-white"
                style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)' }}
              >
                DSP Comum <span className="mx-2 font-light text-white/25">vs</span> AutoSound Pro
              </h2>
            </div>
            <div className="grid grid-cols-1 divide-y divide-white/5 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="p-8 flex flex-col gap-4">
                <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-danger uppercase">
                  <XCircle size={12} /> Tradicional
                </span>
                {['Interface engessada e lenta', 'Sem análise FFT real', 'Latência de centenas de ms', 'Sem integração com hardware', 'Sem snapshots em nuvem'].map(t => (
                  <div key={t} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="mt-0.5 shrink-0 text-danger">—</span>{t}
                  </div>
                ))}
              </div>
              <div className="p-8 flex flex-col gap-4">
                <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-primary uppercase">
                  <CheckCircle2 size={12} /> AutoSound Pro
                </span>
                {['Workstation DSP a 60fps', 'FFT Realtime + Espectrograma', 'Sub-10ms via AudioWorklet', 'HAL + ESP32 bidirecional', 'Snapshot Engine com cloud sync'].map(t => (
                  <div key={t} className="flex items-start gap-3 text-sm text-white">
                    <span className="mt-0.5 shrink-0 text-primary">+</span>{t}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </section>
        </W>

        {/* ── CTA ── */}
        <W className="relative z-10">
        <section className="flex flex-col items-center gap-8 py-32 text-center">
          <FadeIn className="flex w-full flex-col items-center gap-8">
            <Pill>Launch</Pill>
            <h2
              className="font-display font-bold text-white tracking-tighter"
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)', lineHeight: 1.0, maxWidth: 640 }}
            >
              Assuma o controle do seu som.
            </h2>
            <p
              className="font-light leading-relaxed text-text-secondary"
              style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)', maxWidth: 400 }}
            >
              Inicialize o Runtime DSP agora e entre no Studio profissional diretamente do navegador.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="flex items-center gap-2 rounded-2xl bg-white px-10 py-4 font-mono text-xs font-bold tracking-widest text-void uppercase shadow-[0_0_40px_rgba(255,255,255,0.15)] transition hover:bg-white/90 active:scale-95"
              >
                <Activity size={14} /> Criar Runtime
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-2xl border border-white/10 px-10 py-4 font-mono text-xs font-bold tracking-widest text-white uppercase transition hover:bg-white/5 active:scale-95"
              >
                Fazer Login
              </Link>
            </div>
          </FadeIn>
        </section>
        </W>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 text-center">
        <p className="font-mono text-[10px] tracking-widest text-white/20 uppercase">
          AutoSound Pro © 2026 — Next-Gen Automotive Platform
        </p>
      </footer>
    </div>
  )
}
