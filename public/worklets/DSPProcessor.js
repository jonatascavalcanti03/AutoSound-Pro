/**
 * AutoSound Pro - DSP AudioWorklet Processor (PoC)
 * Este script roda na Audio Thread nativa isolada (Real-Time OS Thread).
 * Ele não tem acesso ao DOM, window ou React.
 */

class DSPProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // No futuro, instanciamos o WASM Module aqui
    this.frameCount = 0;
    this.rmsBlockSize = 128; // Standard WebAudio block
    
    // Parâmetros locais
    this.masterGain = 1.0;
    
    // Ouve mensagens de setup do Main Thread (ex: recebendo SharedArrayBuffer)
    this.port.onmessage = (event) => {
      if (event.data.type === 'SET_SHARED_BUFFER') {
        this.sharedBuffer = new Float32Array(event.data.buffer);
      } else if (event.data.type === 'SET_MASTER_GAIN') {
        this.masterGain = event.data.value;
      }
    };
  }

  // O motor em tempo real: Chamado a cada 2.6ms (128 samples a 48kHz)
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    // Se não houver áudio rodando (silêncio total), WebAudio pausa o processo.
    if (!input || input.length === 0) return true;
    
    let sumSquares = 0.0;

    // Processamento Multi-canal SIMD (Intercalado)
    for (let channel = 0; channel < input.length; ++channel) {
      const inChannel = input[channel];
      const outChannel = output[channel];
      
      // Zero-Garbage DSP Loop (Nenhuma alocação de memória aqui)
      for (let i = 0; i < inChannel.length; ++i) {
        // 1. DSP Math (Exemplo: Ganho Master direto na matemática)
        let sample = inChannel[i] * this.masterGain;
        
        // 2. Soft Clipping Matemático (Saturação analógica rápida)
        // x / (1 + |x|)
        sample = sample / (1.0 + Math.abs(sample));

        // Output
        outChannel[i] = sample;
        
        // Soma para o VU Meter (RMS)
        sumSquares += sample * sample;
      }
    }

    // Calculando RMS Final do bloco inteiro
    const totalSamples = input.length * input[0].length;
    const rms = Math.sqrt(sumSquares / totalSamples);

    // Estratégia de Shared Memory:
    // Em vez de usar postMessage (que engasga o Garbage Collector),
    // escrevemos o RMS puro num array na memória RAM compartilhada.
    // O React Canvas lerá de lá livremente a 60fps.
    if (this.sharedBuffer) {
      // index 0: VU Meter RMS
      this.sharedBuffer[0] = rms; 
      
      // index 1: Sync Counter (apenas para debug de frames)
      this.sharedBuffer[1] = this.frameCount;
    }

    this.frameCount++;
    
    // Retornar true mantém o processador vivo
    return true; 
  }
}

// Registra o processador na Engine Nativa do Navegador
registerProcessor('dsp-processor', DSPProcessor);
