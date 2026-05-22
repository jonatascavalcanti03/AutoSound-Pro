'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity } from 'lucide-react'

const BOOT_LOGS = [
  "Initializing AutoSound Pro Kernel...",
  "> Memory Controller: OK",
  "> Allocating SharedArrayBuffer (256MB)... OK",
  "> Starting Web Audio Context... OK",
  "> Injecting C++ WASM Core... OK",
  "> AudioWorklet Thread locked to 96kHz... OK",
  "> Establishing HAL Websocket... OK",
  "SYSTEM ONLINE. ENGAGING RUNTIME UI."
]

interface BootSequenceProps {
  onComplete: () => void
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < BOOT_LOGS.length) {
        const currentLog = BOOT_LOGS[index]
        setLogs(prev => {
          if (prev.includes(currentLog)) return prev
          return [...prev, currentLog]
        })
        index++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setGlitch(true)
          setTimeout(onComplete, 400) // Glitch duration before unmount
        }, 800)
      }
    }, 150) // Speed of logs appearing

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: glitch ? 0 : 1,
          scale: glitch ? 1.05 : 1,
          filter: glitch ? 'contrast(2) brightness(2) invert(1) hue-rotate(90deg)' : 'none'
        }}
        transition={{ duration: 0.3, ease: 'easeIn' }}
        className="fixed inset-0 z-[9999] bg-void flex items-center justify-center overflow-hidden"
      >
        <div className="w-full max-w-2xl px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Activity size={24} className="text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display tracking-widest text-white uppercase">AutoSound Pro</h1>
              <p className="text-[10px] font-mono text-primary tracking-widest">BIOS RUNTIME v0.1.0</p>
            </div>
          </motion.div>

          <div className="font-mono text-xs space-y-2">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={
                  log.includes('OK') ? 'text-signal' : 
                  log.includes('ONLINE') ? 'text-primary font-bold mt-4' : 
                  'text-white/60'
                }
              >
                {log}
              </motion.div>
            ))}
            {!glitch && logs.length < BOOT_LOGS.length && (
              <motion.div 
                animate={{ opacity: [1, 0, 1] }} 
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-3 bg-primary mt-2"
              />
            )}
          </div>
          
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
