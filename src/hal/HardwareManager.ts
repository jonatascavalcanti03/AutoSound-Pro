// src/hal/HardwareManager.ts
import { ITransport } from './transports/ITransport';

export enum HALMode {
  SIMULATION = 'SIMULATION', // Roda 100% no navegador (WebAudio API)
  HARDWARE = 'HARDWARE'      // Roda 100% no carro (ESP32/SigmaDSP)
}

/**
 * Singleton Master: O Hardware Abstraction Layer.
 * Ele atua como o juiz final que decide se a informação vai para a 
 * AudioEngine (Simulação) ou para a Rede (Hardware DSP).
 */
class HardwareManagerClass {
  private activeMode: HALMode = HALMode.SIMULATION;
  private transport: ITransport | null = null;

  public get mode() {
    return this.activeMode;
  }

  public setMode(newMode: HALMode) {
    console.log(`[HAL] Trocando modo de operação para: ${newMode}`);
    this.activeMode = newMode;
  }

  /**
   * Injela o protocolo de comunicação desejado a quente.
   * Ex: O usuário clica em "Conectar Cabo USB" -> setTransport(new WebSerialTransport())
   */
  public setTransport(transport: ITransport) {
    if (this.transport) {
      this.transport.disconnect();
    }
    this.transport = transport;
    
    this.transport.onConnectionChange = (connected) => {
      console.log(`[HAL] Link Físico ${transport.name} mudou estado: ${connected ? 'ONLINE' : 'OFFLINE'}`);
      // Se conectar, dispara SYNC RECONCILIATION com o hardware físico...
    };
  }

  /**
   * Método Universal de Envio.
   * Componentes e Hooks devem chamar isso. Se em simulação, ele não fará nada de rede.
   * Se em Hardware, despacha para a placa física do carro.
   */
  public sendBinaryPacket(buffer: ArrayBuffer) {
    if (this.activeMode === HALMode.SIMULATION) {
       // Ignorado silenciosamente. A AudioEngine local é atualizada separadamente pelo Hook.
       return;
    }

    if (!this.transport || !this.transport.isConnected) {
      console.warn('[HAL] Tentativa de envio em modo Hardware falhou: Fio Desconectado.');
      return;
    }

    this.transport.send(buffer);
  }
}

export const HardwareManager = new HardwareManagerClass();
