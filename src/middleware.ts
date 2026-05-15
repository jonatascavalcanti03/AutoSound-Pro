import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Enterprise Security Middleware (Edge)
 * Reforça a injeção do Cross-Origin Isolation mesmo se o tráfego 
 * vier de Edge Caches (Vercel Edge Network / Cloudflare CDN) que 
 * costumam dropar headers do next.config.ts.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  return response;
}

// Executar em todos os caminhos exceto assets estáticos muito puros
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
