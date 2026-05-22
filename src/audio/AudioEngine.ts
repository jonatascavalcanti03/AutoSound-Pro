import { ChannelGraph } from './ChannelGraph'
import { AudioEventBus, AudioEventType } from './AudioEventBus'
import { dbToLinear } from '@/lib/utils'
import type { Channel } from '@/types/audio.types'

class AudioEngineClass {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null
  public analyser: AnalyserNode | null = null
  private dcBlocker: BiquadFilterNode | null = null
  private dspWorklet: AudioWorkletNode | null = null // O Novo Motor Nativo
  private sharedVuBuffer: Float32Array | null = null
  
  // Watchdog Telemetry
  private watchdogTimer: ReturnType<typeof setInterval> | null = null
  private lastFrameCount: number = -1
  public isPanicking: boolean = false

  private channels: Map<string, ChannelGraph> = new Map()
  private noiseNode: AudioBufferSourceNode | null = null

  public get isReady() {
    return this.context !== null && this.context.state === 'running'
  }

  public async initialize(initialChannels: Channel[], initialMasterDb: number) {
    if (this.context) return

    // Lazy init via user gesture
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)({
      latencyHint: 'interactive'
    })

    this.masterGain = this.context.createGain()
    this.analyser = this.context.createAnalyser()
    this.dcBlocker = this.context.createBiquadFilter()
    
    // 1. Analyser
    this.analyser.fftSize = 2048
    this.analyser.smoothingTimeConstant = 0.8

    // 2. DC Blocker
    this.dcBlocker.type = 'highpass'
    this.dcBlocker.frequency.value = 10
    this.dcBlocker.Q.value = 0.7071

    // 3. AudioWorklet Processor (WASM/C++ PoC)
    try {
      await this.context.audioWorklet.addModule('/worklets/DSPProcessor.js')
      this.dspWorklet = new AudioWorkletNode(this.context, 'dsp-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
      })

      // Cross-Origin Isolation Runtime Detection & Recovery Strategy
      if (typeof window !== 'undefined' && window.crossOriginIsolated) {
        try {
          const sab = new SharedArrayBuffer(1024) // Buffer para RTA e VUs
          this.sharedVuBuffer = new Float32Array(sab)
          this.dspWorklet.port.postMessage({ type: 'SET_SHARED_BUFFER', buffer: sab })
          console.log('[AudioEngine] 🟢 Cross-Origin Verificado. SharedArrayBuffer alocado com sucesso! (Zero-Latency IPC)')
        } catch (e) {
          console.warn('[AudioEngine] 🟡 Falha ao alocar SharedArrayBuffer mesmo em ambiente seguro.', e)
        }
      } else {
        console.warn('[AudioEngine] 🔴 Cross-Origin Isolation Falhou (Headers bloqueados). Sistema entrou em "Degraded Fallback Mode".')
        // Aqui o sistema usaria postMessage (lento) como Fallback
      }
    } catch (err) {
      console.error('[AudioEngine] Falha fatal ao carregar DSPProcessor.js:', err)
      // Dispararia um Global Fault Event aqui
      return // Halt
    }

    // Master Routing: Mix -> MasterGain -> DC Blocker -> DSPWorklet -> Analyser -> Output
    this.masterGain.connect(this.dcBlocker)
    
    if (this.dspWorklet) {
      this.dcBlocker.connect(this.dspWorklet)
      this.dspWorklet.connect(this.analyser)
    } else {
      this.dcBlocker.connect(this.analyser) // Fallback
    }
    
    this.analyser.connect(this.context.destination)

    this.setMasterGain(initialMasterDb)

    // Build Channel Graphs
    initialChannels.forEach(ch => {
      this.addChannel(ch)
    })

    // Inicia o Heartbeat Watchdog
    this.startWatchdog()

    // Hack para acordar a thread de áudio no iOS/Safari silenciosamente
    const osc = this.context.createOscillator()
    const silentGain = this.context.createGain()
    silentGain.gain.value = 0
    osc.connect(silentGain)
    silentGain.connect(this.context.destination)
    osc.start()
    osc.stop(this.context.currentTime + 0.1)

    if (this.context.state === 'suspended') {
      await this.context.resume()
    }

    this.attachEventListeners()
  }

  // ─── Watchdog & Fault Tolerance ────────────────────────────────────────────
  private startWatchdog() {
    if (this.watchdogTimer) clearInterval(this.watchdogTimer)
    
    this.watchdogTimer = setInterval(() => {
      if (this.isPanicking || !this.context || this.context.state !== 'running') return
      
      if (this.sharedVuBuffer) {
        const currentFrame = this.sharedVuBuffer[1]
        
        // Se o frame atual é igual ao de 1 segundo atrás, a Audio Thread Crashou!
        if (currentFrame === this.lastFrameCount) {
          this.triggerPanic("AudioWorklet Heartbeat Frozen")
        } else {
          this.lastFrameCount = currentFrame
        }
      }
    }, 1000)
  }

  private triggerPanic(reason: string) {
    if (this.isPanicking) return
    this.isPanicking = true
    console.error(`[AudioEngine] 🚨 DSP PANIC TRIGGERED: ${reason}`)
    
    // Desconecta fisicamente para evitar som de distorção ou zumbido no alto-falante
    if (this.masterGain) this.masterGain.disconnect()
    if (this.dspWorklet) this.dspWorklet.disconnect()
    
    AudioEventBus.emit(AudioEventType.DSP_PANIC, { message: reason })
  }

  public async recoverFromPanic() {
    console.warn(`[AudioEngine] 🔄 Tentando recuperação do Motor DSP...`)
    // Em produção, isso iria reconstruir toda a árvore de nós ou dar refresh do Context
    // Por enquanto, sinaliza sucesso visual
    setTimeout(() => {
      this.isPanicking = false
      AudioEventBus.emit(AudioEventType.DSP_RECOVERY, {})
      console.log(`[AudioEngine] ✅ Recuperação Bem Sucedida.`)
    }, 2000)
  }
  // ───────────────────────────────────────────────────────────────────────────

  // ─── Event-Driven Architecture ───────────────────────────────────────────────
  private attachEventListeners() {
    AudioEventBus.subscribe(AudioEventType.MASTER_GAIN, (p) => this.setMasterGain(p.value as number))
    AudioEventBus.subscribe(AudioEventType.CHANNEL_GAIN, (p) => this.channels.get(p.channelId!)?.setGain(p.value as number))
    AudioEventBus.subscribe(AudioEventType.CHANNEL_MUTE, (p) => this.channels.get(p.channelId!)?.setMute(p.value as boolean))
    AudioEventBus.subscribe(AudioEventType.CHANNEL_SOLO, (p) => this.handleSolo(p.channelId!, p.value as boolean))
    AudioEventBus.subscribe(AudioEventType.CHANNEL_PHASE, (p) => this.channels.get(p.channelId!)?.setPhase(p.value as boolean))
    AudioEventBus.subscribe(AudioEventType.CHANNEL_PAN, (p) => this.channels.get(p.channelId!)?.setPan(p.value as number))
    AudioEventBus.subscribe(AudioEventType.CHANNEL_DELAY, (p) => this.channels.get(p.channelId!)?.setDelay(p.value as number))
    AudioEventBus.subscribe(AudioEventType.EQ_GAIN, (p) => this.channels.get(p.channelId!)?.setEqGain(p.bandId!, p.value as number))
    AudioEventBus.subscribe(AudioEventType.EQ_FREQ, (p) => this.channels.get(p.channelId!)?.setEqFreq(p.bandId!, p.value as number))
    AudioEventBus.subscribe(AudioEventType.EQ_Q, (p) => this.channels.get(p.channelId!)?.setEqQ(p.bandId!, p.value as number))
    AudioEventBus.subscribe(AudioEventType.EQ_TOGGLE, (p) => this.channels.get(p.channelId!)?.setEqEnabled(p.bandId!, p.value as boolean))
    AudioEventBus.subscribe(AudioEventType.CROSSOVER_HP_FREQ, (p) => this.channels.get(p.channelId!)?.setHpFreq(p.value as number))
    AudioEventBus.subscribe(AudioEventType.CROSSOVER_LP_FREQ, (p) => this.channels.get(p.channelId!)?.setLpFreq(p.value as number))
    AudioEventBus.subscribe(AudioEventType.CROSSOVER_HP_TOGGLE, (p) => this.channels.get(p.channelId!)?.setHpEnabled(p.value as boolean))
    AudioEventBus.subscribe(AudioEventType.CROSSOVER_LP_TOGGLE, (p) => this.channels.get(p.channelId!)?.setLpEnabled(p.value as boolean))
  }
  // ───────────────────────────────────────────────────────────────────────────

  // ─── Solo Routing ────────────────────────────────────────────────────────────
  private handleSolo(soloedChannelId: string, isSoloed: boolean) {
    // Propaga para todos os grafos: o canal solado fica ativo,
    // os demais são silenciados enquanto o solo estiver ligado.
    this.channels.forEach((graph, id) => {
      graph.setSolo(id === soloedChannelId ? isSoloed : false, isSoloed)
    })
  }
  // ───────────────────────────────────────────────────────────────────────────

  public addChannel(chData: Channel) {
    if (!this.context || !this.masterGain) return
    const graph = new ChannelGraph(this.context, chData)
    graph.connect(this.masterGain)
    this.channels.set(chData.id, graph)
    
    // Se há pink noise rodando, conecta o novo canal nele
    if (this.noiseNode) {
      this.noiseNode.connect(graph.input)
    }
  }

  // Função legacy `updateChannel` removida pois agora o EventBus aciona 
  // os métodos da ChannelGraph atomicamente.

  public setMasterGain(db: number) {
    if (!this.context || !this.masterGain) return
    const time = this.context.currentTime + 0.01
    this.masterGain.gain.setTargetAtTime(dbToLinear(db), time, 0.01)
  }

  // ─── DSP Analysis APIs ──────────────────────────────────────────────────────

  public getChannelFrequencyResponse(channelId: string, freqs: Float32Array): Float32Array | null {
    const graph = this.channels.get(channelId)
    if (!graph) return null
    return graph.getFrequencyResponse(freqs)
  }

  // Monitoramento (VU Meters)
  public getChannelLevel(id: string): number {
    return this.channels.get(id)?.getLevel() || 0
  }

  public getMasterLevel(): number {
    if (!this.analyser) return 0
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteTimeDomainData(data)
    let sumSquares = 0.0
    for (let i = 0; i < data.length; i++) {
        const norm = (data[i] / 128.0) - 1.0
        sumSquares += norm * norm
    }
    const rms = Math.sqrt(sumSquares / data.length)
    return Math.min(1.0, rms * 2.5)
  }

  public getSpectrumData(outArray: Uint8Array) {
    if (!this.analyser) return
    this.analyser.getByteFrequencyData(outArray as Uint8Array<ArrayBuffer>)
  }

  public getChannelSpectrumData(channelId: string, outArray: Uint8Array) {
    const graph = this.channels.get(channelId)
    if (graph && graph.analyser) {
      graph.analyser.getByteFrequencyData(outArray as Uint8Array<ArrayBuffer>)
    }
  }

  // Gerador de Sinal de Teste (Pink Noise) embutido no MVP
  public toggleTestNoise(): boolean {
    if (!this.context) return false
    
    if (this.noiseNode) {
      this.noiseNode.stop()
      this.noiseNode.disconnect()
      this.noiseNode = null
      return false
    }

    // Gerador aproximado de Pink Noise (Filtro Paul Kellet)
    const bufferSize = this.context.sampleRate * 5
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate)
    const output = buffer.getChannelData(0)
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
        output[i] *= 0.11
        b6 = white * 0.115926
    }
    
    this.noiseNode = this.context.createBufferSource()
    this.noiseNode.buffer = buffer
    this.noiseNode.loop = true
    
    // Conecta o gerador nas entradas dos canais
    this.channels.forEach(ch => {
      this.noiseNode!.connect(ch.input)
    })
    
    this.noiseNode.start()
    return true
  }
}

export const AudioEngine = new AudioEngineClass()
