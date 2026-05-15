// src/audio/AudioEventBus.ts

/**
 * Event Types for Granular DSP Updates.
 */
export enum AudioEventType {
  MASTER_GAIN = 'MASTER_GAIN',
  CHANNEL_GAIN = 'CHANNEL_GAIN',
  CHANNEL_MUTE = 'CHANNEL_MUTE',
  CHANNEL_SOLO = 'CHANNEL_SOLO',
  CHANNEL_PHASE = 'CHANNEL_PHASE',
  CHANNEL_PAN = 'CHANNEL_PAN',
  CHANNEL_DELAY = 'CHANNEL_DELAY',
  EQ_GAIN = 'EQ_GAIN',
  EQ_FREQ = 'EQ_FREQ',
  EQ_Q = 'EQ_Q',
  EQ_TOGGLE = 'EQ_TOGGLE',
  CROSSOVER_HP_FREQ = 'CROSSOVER_HP_FREQ',
  CROSSOVER_HP_TOGGLE = 'CROSSOVER_HP_TOGGLE',
  CROSSOVER_LP_FREQ = 'CROSSOVER_LP_FREQ',
  CROSSOVER_LP_TOGGLE = 'CROSSOVER_LP_TOGGLE',
  
  // ─── System Fault & Panic Events ───
  SYSTEM_FAULT = 'SYSTEM_FAULT',
  DSP_PANIC = 'DSP_PANIC',
  DSP_RECOVERY = 'DSP_RECOVERY'
}

export interface AudioEventPayload {
  channelId?: string;
  bandId?: string;
  value?: number | boolean; // Opcional, Panics podem não ter valor
  message?: string; // Para mensagens de log do Panic
}

type AudioEventListener = (payload: AudioEventPayload) => void;

/**
 * Enterprise Event Bus para Audio DSP.
 * Desacopla completamente a UI/Zustand da manipulação direta do Web Audio.
 * Contém micro-batching embutido para evitar engarrafamento de I/O em rastejo rápido de faders.
 */
class AudioEventBusClass {
  private listeners: Map<AudioEventType, Set<AudioEventListener>> = new Map();
  private pendingEvents: Map<string, { type: AudioEventType, payload: AudioEventPayload }> = new Map();
  private frameScheduled = false;

  constructor() {
    // Inicializa o motor de V-Sync se estiver no Client-Side
    if (typeof window !== 'undefined') {
      this.tick = this.tick.bind(this);
    }
  }

  public subscribe(type: AudioEventType, listener: AudioEventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  /**
   * Event Coalescing System (Aglutinação)
   * Sobrescreve eventos repetidos no mesmo ciclo de renderização.
   * Reduz centenas de dispares de I/O de um mouse rápido para 1 disparo consolidado.
   */
  public emit(type: AudioEventType, payload: AudioEventPayload) {
    const key = `${type}-${payload.channelId || 'none'}-${payload.bandId || 'none'}`;
    
    // Sobrescreve (Coalesce) o evento anterior se houver
    this.pendingEvents.set(key, { type, payload });

    if (!this.frameScheduled && typeof window !== 'undefined') {
      this.frameScheduled = true;
      requestAnimationFrame(this.tick);
    }
  }

  /**
   * Disparado perfeitamente acoplado ao V-Sync da tela (normalmente a cada 16.6ms).
   */
  private tick() {
    this.frameScheduled = false;
    
    // Copia o mapa de eventos atuais e limpa para capturar novos imediatamente
    const eventsToProcess = Array.from(this.pendingEvents.values());
    this.pendingEvents.clear();

    // Dispara todos em Batch
    for (let i = 0; i < eventsToProcess.length; i++) {
      const { type, payload } = eventsToProcess[i];
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.forEach(listener => listener(payload));
      }
    }
  }
}

export const AudioEventBus = new AudioEventBusClass();
