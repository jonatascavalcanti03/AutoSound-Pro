'use client'
// src/hooks/useAnimationLoop.ts
import { useEffect, useRef } from 'react'

/**
 * Hook canônico para loops de animação imperativa.
 * O callback roda no requestAnimationFrame, completamente
 * fora do ciclo de render do React.
 *
 * @param callback - Função chamada a cada frame com o timestamp
 * @param active   - Se false, pausa o loop (útil para abas ocultas)
 */
export function useAnimationLoop(
  callback: (timestamp: number, deltaMs: number) => void,
  active: boolean = true
): void {
  const rafRef      = useRef<number>(0)
  const callbackRef = useRef(callback)
  const prevTsRef   = useRef<number>(0)

  // Sempre mantém a referência ao callback mais recente
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    const loop = (timestamp: number) => {
      const delta = prevTsRef.current ? timestamp - prevTsRef.current : 0
      prevTsRef.current = timestamp
      callbackRef.current(timestamp, delta)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      prevTsRef.current = 0
    }
  }, [active])
}
