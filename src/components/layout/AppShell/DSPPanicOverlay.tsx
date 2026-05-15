'use client'
import React, { useEffect, useState } from 'react'
import { AudioEventBus, AudioEventType } from '@/audio/AudioEventBus'
import { AudioEngine } from '@/audio/AudioEngine'
import { AlertOctagon, RefreshCw, Activity } from 'lucide-react'

export function DSPPanicOverlay() {
  const [isPanicking, setIsPanicking] = useState(false)
  const [panicReason, setPanicReason] = useState<string>('')
  const [isRecovering, setIsRecovering] = useState(false)

  useEffect(() => {
    const unsubPanic = AudioEventBus.subscribe(AudioEventType.DSP_PANIC, (payload) => {
      setPanicReason(payload.message || 'Unknown Engine Failure')
      setIsPanicking(true)
      setIsRecovering(false)
    })

    const unsubRecovery = AudioEventBus.subscribe(AudioEventType.DSP_RECOVERY, () => {
      setIsPanicking(false)
      setIsRecovering(false)
      setPanicReason('')
    })

    return () => {
      unsubPanic()
      unsubRecovery()
    }
  }, [])

  if (!isPanicking) return null

  const handleRecovery = () => {
    setIsRecovering(true)
    AudioEngine.recoverFromPanic()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      {/* Container Principal de Alerta */}
      <div className="max-w-md w-full mx-4 bg-void border border-danger/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,59,92,0.15)] relative">
        
        {/* Banner Superior Vermelho */}
        <div className="bg-danger/20 border-b border-danger/30 p-4 flex items-center gap-3">
          <AlertOctagon className="text-danger animate-pulse" size={28} />
          <div>
            <h2 className="text-danger font-mono font-bold text-lg tracking-widest uppercase">
              DSP Panic
            </h2>
            <p className="text-danger/70 text-[10px] font-mono tracking-widest uppercase">
              Audio Engine Falhou
            </p>
          </div>
        </div>

        {/* Corpo do Erro */}
        <div className="p-6">
          <div className="bg-black/50 border border-white/5 rounded-lg p-4 mb-6">
            <p className="text-text-muted text-xs font-mono mb-1">CÓDIGO / RAZÃO:</p>
            <p className="text-white font-mono text-sm break-words">{panicReason}</p>
          </div>

          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            A thread de processamento de áudio em tempo real parou de responder. O motor foi fisicamente desligado para proteger seus alto-falantes de ruídos extremos.
          </p>

          {/* Botões de Ação */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRecovery}
              disabled={isRecovering}
              className={`w-full py-3 px-4 rounded-lg font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                isRecovering
                  ? 'bg-elevated text-text-muted border border-white/5 cursor-wait'
                  : 'bg-danger text-white hover:bg-danger/80 hover:shadow-[0_0_20px_rgba(255,59,92,0.4)]'
              }`}
            >
              {isRecovering ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Reiniciando Motor...
                </>
              ) : (
                <>
                  <Activity size={18} />
                  Forçar Hard Reset
                </>
              )}
            </button>
            <button
              onClick={() => window.location.reload()}
              disabled={isRecovering}
              className="w-full py-3 px-4 rounded-lg font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-transparent text-text-muted hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
