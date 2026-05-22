// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Orbitron, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AutoSound Pro — Professional Automotive Audio Control',
  description: 'Enterprise-grade web platform for professional automotive audio control. Real-time DSP, parametric EQ, crossover, spectrum analyzer.',
  keywords: ['automotive audio', 'DSP', 'equalizer', 'car audio', 'crossover'],
  authors: [{ name: 'AutoSound Pro' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A0A0F',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased bg-void text-text-primary overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
