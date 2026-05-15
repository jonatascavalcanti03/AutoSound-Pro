// src/types/hardware.types.ts

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

export type TransportType = 'websocket' | 'webserial' | 'bluetooth'

export interface HardwareDevice {
  readonly id:    string
  name:           string
  transport:      TransportType
  connection:     ConnectionState
  latencyMs:      number
  firmwareVersion: string
  ipAddress?:     string
  port?:          number
}

export interface HardwareMessage {
  type:      MessageType
  channelId: string
  param:     string
  value:     number
  timestamp: number
}

export type MessageType =
  | 'param_update'
  | 'preset_load'
  | 'preset_save'
  | 'heartbeat'
  | 'ack'
  | 'error'
