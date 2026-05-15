// src/components/atoms/VUMeter/VUMeter.types.ts

export interface VUMeterProps {
  /** Nível manual (usado se channelId/isMaster não for passado) */
  level?:       number
  /** ID do canal para buscar o nível direto do AudioEngine */
  channelId?:   string
  /** Flag para buscar o nível master do AudioEngine */
  isMaster?:    boolean
  /** Nível do peak (opcional) */
  peakLevel?:   number
  /** Direção do meter */
  orientation?: 'vertical' | 'horizontal'
  /** Largura em px do canvas */
  width?:       number
  /** Altura em px do canvas */
  height?:      number
  /** Exibe linha de peak hold */
  showPeak?:    boolean
  /** Exibe escala dB */
  showScale?:   boolean
  /** Label do canal */
  label?:       string
  /** Pausa o loop de animação */
  active?:      boolean
  /** Classes Tailwind adicionais */
  className?:   string
}
