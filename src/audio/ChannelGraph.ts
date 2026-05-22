// src/audio/ChannelGraph.ts
import { dbToLinear } from '@/lib/utils'
import type { Channel } from '@/types/audio.types'

export class ChannelGraph {
  public readonly id: string
  private context: AudioContext
  
  // Nodes
  public input: GainNode
  private preEqPad: GainNode       // Auto Headroom Padding (-6dB)
  private eqNodes: Map<string, BiquadFilterNode> = new Map()
  private postEqMakeup: GainNode   // Auto Headroom Makeup (+6dB)
  private hpFilter: BiquadFilterNode
  private hpFilter2: BiquadFilterNode // For 24dB/oct (Linkwitz-Riley)
  private lpFilter: BiquadFilterNode
  private lpFilter2: BiquadFilterNode
  private delayNode: DelayNode
  private phaseNode: GainNode
  private pannerNode: StereoPannerNode
  public output: GainNode
  public analyser: AnalyserNode

  // Estado espelhado internamente para Mute/Gain/Solo
  private currentDb: number = 0
  private isMuted: boolean = false
  private isSoloMuted: boolean = false // true = outro canal está em solo (este deve silenciar)

  constructor(context: AudioContext, channelData: Channel) {
    this.context = context
    this.id = channelData.id

    this.input = context.createGain()
    this.preEqPad = context.createGain()
    this.postEqMakeup = context.createGain()
    this.hpFilter = context.createBiquadFilter()
    this.hpFilter2 = context.createBiquadFilter()
    this.lpFilter = context.createBiquadFilter()
    this.lpFilter2 = context.createBiquadFilter()
    this.delayNode = context.createDelay(1.0)
    this.phaseNode = context.createGain()
    this.pannerNode = context.createStereoPanner()
    this.output = context.createGain()
    
    this.analyser = context.createAnalyser()
    this.analyser.fftSize = 2048
    this.analyser.smoothingTimeConstant = 0.85 // Smoothing analógico suave

    // Configuração inicial de Crossover Filters
    this.hpFilter.type = 'highpass'
    this.hpFilter2.type = 'highpass'
    this.lpFilter.type = 'lowpass'
    this.lpFilter2.type = 'lowpass'

    // Sistema de Headroom Automático Interno:
    // Atenua -6dB antes do EQ para dar folga aos acumuladores matemáticos float32
    // e restaura +6dB após o EQ. Evita artefatos de saturação inter-sample.
    this.preEqPad.gain.value = 0.5 // -6.02 dB
    this.postEqMakeup.gain.value = 2.0 // +6.02 dB
    
    this.input.connect(this.preEqPad)

    // Cadeia de EQ
    let lastNode: AudioNode = this.preEqPad
    channelData.eq.forEach(band => {
      const node = context.createBiquadFilter()
      node.type = band.type as BiquadFilterType
      node.frequency.value = band.frequency
      node.gain.value = band.gain
      node.Q.value = band.q
      this.eqNodes.set(band.id, node)
      
      lastNode.connect(node)
      lastNode = node
    })
    
    lastNode.connect(this.postEqMakeup)

    // Conectando o resto da cadeia
    this.postEqMakeup.connect(this.hpFilter)
    this.hpFilter.connect(this.hpFilter2)
    this.hpFilter2.connect(this.lpFilter)
    this.lpFilter.connect(this.lpFilter2)

    this.lpFilter2.connect(this.delayNode)
    this.delayNode.connect(this.phaseNode)
    this.phaseNode.connect(this.pannerNode)
    
    // Analyser antes do output final
    this.pannerNode.connect(this.analyser)
    this.analyser.connect(this.output)

    // Aplica o estado inicial
    this.applyInitialState(channelData)
  }

  private applyInitialState(chData: Channel) {
    this.setGain(chData.gainDb)
    this.setMute(chData.muted) // FIX: apenas respeita o flag muted; solo é gerenciado separadamente
    this.setPhase(chData.phase)
    this.setPan(chData.panLR)
    this.setDelay(chData.delayMs)
    
    this.setHpFreq(chData.crossover.highpassFreq)
    this.setHpEnabled(chData.crossover.highpassEnabled)
    this.setLpFreq(chData.crossover.lowpassFreq)
    this.setLpEnabled(chData.crossover.lowpassEnabled)

    chData.eq.forEach(band => {
      this.setEqFreq(band.id, band.frequency)
      this.setEqGain(band.id, band.gain)
      this.setEqQ(band.id, band.q)
      this.setEqEnabled(band.id, band.enabled)
    })
  }

  // ─── Granular Event-Driven Setters ─────────────────────────────────────────

  public setGain(db: number) {
    this.currentDb = db
    this.updateOutputGain()
  }

  public setMute(muted: boolean) {
    this.isMuted = muted
    this.updateOutputGain()
  }

  /**
   * Chamado pelo AudioEngine quando o estado de solo do sistema muda.
   * @param isSoloed    true = ESTE canal foi solado
   * @param soloActive  true = qualquer canal no sistema está em solo
   */
  public setSolo(isSoloed: boolean, soloActive: boolean) {
    // Se o sistema tem solo ativo e este canal NÃO é o solado → silencia
    this.isSoloMuted = soloActive && !isSoloed
    this.updateOutputGain()
  }

  private updateOutputGain() {
    const time = this.context.currentTime + 0.01
    const silenced = this.isMuted || this.isSoloMuted
    const targetGain = silenced ? 0 : dbToLinear(this.currentDb)
    this.output.gain.setTargetAtTime(targetGain, time, 0.01)
  }

  public setPhase(inverted: boolean) {
    const time = this.context.currentTime + 0.01
    this.phaseNode.gain.setTargetAtTime(inverted ? -1 : 1, time, 0.01)
  }

  public setPan(panLR: number) {
    const time = this.context.currentTime + 0.01
    this.pannerNode.pan.setTargetAtTime(panLR, time, 0.01)
  }

  public setDelay(delayMs: number) {
    const time = this.context.currentTime + 0.01
    this.delayNode.delayTime.setTargetAtTime(delayMs / 1000, time, 0.01)
  }

  // ─── Param Automation (EQ) ───

  public setEqGain(bandId: string, gain: number) {
    const node = this.eqNodes.get(bandId)
    if (node) node.gain.setTargetAtTime(gain, this.context.currentTime + 0.01, 0.010)
  }

  public setEqFreq(bandId: string, freq: number) {
    const node = this.eqNodes.get(bandId)
    if (node) node.frequency.setTargetAtTime(freq, this.context.currentTime + 0.01, 0.025)
  }

  public setEqQ(bandId: string, q: number) {
    const node = this.eqNodes.get(bandId)
    if (node) node.Q.setTargetAtTime(q, this.context.currentTime + 0.01, 0.015)
  }

  public setEqEnabled(bandId: string, enabled: boolean) {
    const node = this.eqNodes.get(bandId)
    if (!node) return
    // FIX: quando desabilitado zeramos o ganho (bypass do efeito EQ);
    // quando habilitado restauramos o ganho que estava configurado.
    // Para bandas do tipo shelf/peaking o bypass correto é gain=0.
    // Para lowpass/highpass a abordagem correta seria desviar o sinal,
    // mas para evitar glitches de conexão, mantemos gain=0 como bypass.
    node.gain.setTargetAtTime(enabled ? node.gain.value : 0, this.context.currentTime + 0.01, 0.010)
  }

  // ─── Param Automation (Crossover) ───

  public setHpFreq(freq: number) {
    const time = this.context.currentTime + 0.01
    this.hpFilter.frequency.setTargetAtTime(freq, time, 0.01)
    this.hpFilter2.frequency.setTargetAtTime(freq, time, 0.01)
  }

  public setLpFreq(freq: number) {
    const time = this.context.currentTime + 0.01
    this.lpFilter.frequency.setTargetAtTime(freq, time, 0.01)
    this.lpFilter2.frequency.setTargetAtTime(freq, time, 0.01)
  }

  public setHpEnabled(enabled: boolean) {
    const time = this.context.currentTime + 0.01
    if (!enabled) {
      this.hpFilter.frequency.setTargetAtTime(10, time, 0.01)
      this.hpFilter2.frequency.setTargetAtTime(10, time, 0.01)
    }
  }

  public setLpEnabled(enabled: boolean) {
    const time = this.context.currentTime + 0.01
    if (!enabled) {
      this.lpFilter.frequency.setTargetAtTime(22000, time, 0.01)
      this.lpFilter2.frequency.setTargetAtTime(22000, time, 0.01)
    }
  }
  // ───────────────────────────────────────────────────────────────────────────

  public getLevel(): number {
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteTimeDomainData(data)
    let sumSquares = 0.0
    for (let i = 0; i < data.length; i++) {
        const norm = (data[i] / 128.0) - 1.0
        sumSquares += norm * norm
    }
    const rms = Math.sqrt(sumSquares / data.length)
    // Amplifica ligeiramente o RMS para a UI ter mais dinâmica visível
    return Math.min(1.0, rms * 2.5)
  }

  public getFrequencyResponse(freqs: Float32Array): Float32Array {
    const totalMag = new Float32Array(freqs.length).fill(1)
    const magResponse = new Float32Array(freqs.length)
    const phaseResponse = new Float32Array(freqs.length)
    
    const safeFreqs = freqs as unknown as Float32Array<ArrayBuffer>

    // Combina as respostas de todas as bandas de EQ
    for (const node of this.eqNodes.values()) {
      node.getFrequencyResponse(safeFreqs, magResponse, phaseResponse)
      for (let i = 0; i < freqs.length; i++) {
        totalMag[i] *= magResponse[i]
      }
    }

    // Aplica Crossover HighPass (LR24 = 2x Butterworth)
    this.hpFilter.getFrequencyResponse(safeFreqs, magResponse, phaseResponse)
    for (let i = 0; i < freqs.length; i++) totalMag[i] *= magResponse[i]
    this.hpFilter2.getFrequencyResponse(safeFreqs, magResponse, phaseResponse)
    for (let i = 0; i < freqs.length; i++) totalMag[i] *= magResponse[i]

    // Aplica Crossover LowPass (LR24 = 2x Butterworth)
    this.lpFilter.getFrequencyResponse(safeFreqs, magResponse, phaseResponse)
    for (let i = 0; i < freqs.length; i++) totalMag[i] *= magResponse[i]
    this.lpFilter2.getFrequencyResponse(safeFreqs, magResponse, phaseResponse)
    for (let i = 0; i < freqs.length; i++) totalMag[i] *= magResponse[i]

    // Converte magnitude linear de volta para decibéis
    const dbResponse = new Float32Array(freqs.length)
    for (let i = 0; i < freqs.length; i++) {
      dbResponse[i] = totalMag[i] > 0 ? 20 * Math.log10(totalMag[i]) : -100
    }

    return dbResponse
  }

  public connect(destination: AudioNode) {
    this.output.connect(destination)
  }

  public disconnect() {
    this.output.disconnect()
  }
}
