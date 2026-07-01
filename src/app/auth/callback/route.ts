import { NextResponse } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"

/**
 * OAuth (Google/Apple) ve e-posta doğrulama akışlarının dönüş noktası.
 * - OAuth / PKCE:  ?code=...          → exchangeCodeForSession
 * - E-posta OTP:   ?token_hash&type   → verifyOtp
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") ?? "/dashboard"

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return redirectTo(request, origin, next)
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return redirectTo(request, origin, next)
  }

  // Başarısız → hata bilgisiyle giriş sayfasına dön.
  return NextResponse.redirect(`${origin}/login?error=auth`)
}

/** Lokal ve Vercel (proxy arkası) ortamlarında doğru host'a yönlendirir. */
function redirectTo(request: Request, origin: string, next: string) {
  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocal = process.env.NODE_ENV === "development"

  if (isLocal || !forwardedHost) {
    return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`https://${forwardedHost}${next}`)
}
