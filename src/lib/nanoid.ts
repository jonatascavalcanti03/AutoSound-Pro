// src/lib/nanoid.ts
// Nano ID sem dependência externa — 21 chars, URL-safe
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function nanoid(size: number = 12): string {
  const bytes = typeof crypto !== 'undefined'
    ? crypto.getRandomValues(new Uint8Array(size))
    : new Uint8Array(size).map(() => Math.floor(Math.random() * 256))

  return Array.from(bytes)
    .map(b => ALPHABET[b % ALPHABET.length])
    .join('')
}
