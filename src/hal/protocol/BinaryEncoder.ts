// src/hal/protocol/BinaryEncoder.ts

/**
 * Protocolo de Codificação Binária DSP Enterprise.
 * Responsável por empacotar dados Float32 e comandos de estado em frames
 * minúsculos de < 10 bytes para não gargalar a placa IoT (ESP32).
 */
export class BinaryEncoder {
  public static readonly SYNC_BYTE = 0xAA;
  
  // Command Types (Protocolo ASPBTP)
  public static readonly CMD_EQ_GAIN       = 0x01;
  public static readonly CMD_EQ_FREQ       = 0x02;
  public static readonly CMD_EQ_Q          = 0x03;
  public static readonly CMD_CROSSOVER_HP  = 0x04;
  public static readonly CMD_CROSSOVER_LP  = 0x05;
  public static readonly CMD_CHANNEL_GAIN  = 0x06;
  public static readonly CMD_CHANNEL_MUTE  = 0x07;
  public static readonly CMD_MASTER_MUTE   = 0x08; // P1 Priority
  public static readonly CMD_SYNC_REQUEST  = 0x99;

  /**
   * Empacota uma mudança de valor (float32) em um frame Delta padrão de 9 bytes.
   * Estrutura: [SYNC, CMD, CH_ID, PARAM_ID, FLOAT_B1, FLOAT_B2, FLOAT_B3, FLOAT_B4, CRC_8]
   */
  public static encodeFloatCommand(cmdType: number, channelIndex: number, paramIndex: number, value: number): ArrayBuffer {
    const buffer = new ArrayBuffer(9);
    const view = new DataView(buffer);
    const uint8View = new Uint8Array(buffer);

    view.setUint8(0, this.SYNC_BYTE);
    view.setUint8(1, cmdType);
    view.setUint8(2, channelIndex);
    view.setUint8(3, paramIndex);
    
    // Seta o Float32 estritamente em Little Endian (true) para casamento de memória C++ (ESP32/SigmaDSP)
    view.setFloat32(4, value, true);
    
    // Calcula CRC-8 (Dallas/Maxim) para integridade contra ruído automotivo EMI
    const crc = this.calculateCRC8(uint8View, 0, 8);
    view.setUint8(8, crc);

    return buffer;
  }

  /**
   * Cálculo Robusto de CRC-8.
   * Polinômio padrão: 0x31 (X^8 + X^5 + X^4 + 1)
   */
  private static calculateCRC8(data: Uint8Array, start: number, length: number): number {
    let crc = 0x00;
    for (let i = start; i < length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x80) !== 0) {
          crc = (crc << 1) ^ 0x31;
        } else {
          crc <<= 1;
        }
      }
    }
    return crc & 0xFF; // Garante 8 bits
  }
}
