// src/components/atoms/RotaryKnob/RotaryKnob.types.ts

export interface RotaryKnobProps {
  /** Valor atual */
  value:     number
  /** Valor mínimo (default: 0) */
  min?:      number
  /** Valor máximo (default: 100) */
  max?:      number
  /** Incremento por step (default: 1) */
  step?:     number
  /** Tamanho em px do SVG (default: 56) */
  size?:     number
  /** Label descritivo (também usado em aria-label) */
  label?:    string
  /** Unidade exibida após o valor (ex: "dB", "Hz") */
  unit?:     string
  /** Cor accent em hex (default: #00D4FF) */
  color?:    string
  /** Desabilita interação */
  disabled?: boolean
  /** Callback durante drag (alta frequência) */
  onChange?:    (value: number) => void
  /** Callback ao soltar (fim do drag) */
  onChangeEnd?: (value: number) => void
  /** Opcional: Formatação visual de exibição de valor (eg. 1000 -> "1k") */
  formatValue?: (value: number) => string | number
  /** Classes Tailwind adicionais */
  className?: string
}
