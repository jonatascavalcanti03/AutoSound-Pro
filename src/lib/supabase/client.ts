/**
 * AutoSound Pro — Supabase Browser Client
 * Usado em componentes 'use client' para auth e operações do lado do cliente.
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
