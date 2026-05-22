import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Cross-Origin Isolation (SharedArrayBuffer / AudioWorklet) ────────────────
  // Também está no proxy.ts (middleware) para redundância no Vercel Edge.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy',  value: 'same-origin'   },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp'  },
        ],
      },
    ];
  },

  // ─── Image domains ────────────────────────────────────────────────────────────
  // Permite que imagens externas sejam otimizadas pelo Next.js Image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.transparenttextures.com',
      },
    ],
  },

  // ─── Turbopack (produção) ─────────────────────────────────────────────────────
  // Mantém comportamento consistente entre dev e prod
  experimental: {},
};

export default nextConfig;
