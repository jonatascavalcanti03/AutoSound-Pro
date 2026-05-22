import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * AutoSound Pro — Edge Middleware / Proxy
 * Injeta Cross-Origin Isolation (necessário para SharedArrayBuffer / AudioWorklet).
 * Compatível com Next.js 16 (mantém export "middleware" enquanto a convenção
 * "proxy" ainda está sendo adotada).
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
