// src/hal/transports/ITransport.ts

/**
 * Transport Interface.
 * Todos os módulos de comunicação (USB Serial, WebSocket, BLE) devem
 * obrigatoriamente implementar esta interface para garantir o polimorfismo na HAL.
 */
export interface ITransport {
  /** Nome amigável do protocolo (ex: "WebSerial", "WebSocket WiFi") */
  name: string;
  
  /** Retorna o status de conexão ao vivo */
  isConnected: boolean;

  /**
   * Tenta conectar ao destino físico.
   * @param address Pode ser um IP (WebSocket), ServiceUUID (BLE), ou nulo (WebSerial abre popup nativo)
   */
  connect(address?: string): Promise<boolean>;

  /** Desconecta o transporte com segurança */
  disconnect(): Promise<void>;

  /** 
   * Envia um buffer binário puro. 
   * Obrigatório usar ArrayBuffer para evitar overhead de parsing JSON no DSP.
   */
  send(buffer: ArrayBuffer): Promise<boolean>;

  /** Callback disparado assim que pacotes binários chegam do DSP (ex: Feedback VU, Sync) */
  onMessage: ((buffer: ArrayBuffer) => void) | null;
  
  /** Callback para notificar perda ou estabelecimento de link de hardware */
  onConnectionChange: ((connected: boolean) => void) | null;
}
