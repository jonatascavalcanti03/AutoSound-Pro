import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * AutoSound Pro — Supabase OAuth Callback Handler
 * O Supabase redireciona aqui após o usuário autorizar no GitHub.
 * Trocamos o `code` por uma sessão válida e redirecionamos para o studio.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/studio'
  const error = searchParams.get('error')

  // Se o usuário cancelou a autorização no GitHub
  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_cancelled`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Algo deu errado — volta pro login com erro
  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`)
}
