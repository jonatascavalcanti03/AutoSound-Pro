'use client'
import { useState, useCallback } from 'react'
import { useMixerStore } from '@/store/mixer.store'
import { AudioEngine } from '@/audio/AudioEngine'

export function useAudioEngineSync() {
  const [isReady, setIsReady] = useState(false)
  const [isPlayingNoise, setIsPlayingNoise] = useState(false)

  const initialize = useCallback(async () => {
    if (AudioEngine.isReady) return
    const state = useMixerStore.getState()
    await AudioEngine.initialize(state.channels, state.masterGainDb)
    setIsReady(true)
  }, [])

  const toggleNoise = useCallback(() => {
    if (!AudioEngine.isReady) return
    const playing = AudioEngine.toggleTestNoise()
    setIsPlayingNoise(playing)
  }, [])

  // A sincronização imperativa pesada (Diffing) foi removida.
  // Todo o roteamento de dados em tempo real agora ocorre através do AudioEventBus
  // que é disparado diretamente pelas Actions atômicas do Zustand.

  return { isReady, initialize, toggleNoise, isPlayingNoise }
}
