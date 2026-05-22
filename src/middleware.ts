import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * AutoSound Pro — Edge Middleware
 *
 * Responsabilidades:
 * 1. Injeta Cross-Origin Isolation (COOP/COEP) — necessário para SharedArrayBuffer / AudioWorklet
 * 2. Atualiza a sessão Supabase a cada request (refresh de token automático)
 * 3. Protege rotas do /studio — redireciona para /auth/login se não autenticado
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // ── Supabase Session Refresh ──────────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Atualiza sessão (nunca remover esta chamada)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Proteção de Rotas ─────────────────────────────────────────────────────
  // Se está tentando acessar /studio sem sessão → redireciona para login
  if (pathname.startsWith('/studio') && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    return NextResponse.redirect(loginUrl)
  }

  // Se já está autenticado e tenta acessar /auth → redireciona para studio
  if (pathname.startsWith('/auth') && user) {
    const studioUrl = request.nextUrl.clone()
    studioUrl.pathname = '/studio'
    return NextResponse.redirect(studioUrl)
  }

  // ── Cross-Origin Isolation Headers ───────────────────────────────────────
  // Necessário para SharedArrayBuffer e AudioWorklet funcionarem
  supabaseResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  supabaseResponse.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
