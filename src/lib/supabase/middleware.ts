import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "@/types/database"

/** Giriş yapılmadan erişilemeyen rota önekleri. */
const PROTECTED_PREFIXES = ["/dashboard", "/subscriptions", "/settings"]
/** Giriş yapmış kullanıcının görmemesi gereken rotalar. */
const AUTH_ROUTES = ["/login", "/signup"]

/**
 * Her istekte Supabase oturumunu yeniler (token rotasyonu) ve
 * korumalı rotalar için erişim kontrolü yapar.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
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

  // ÖNEMLİ: createServerClient ile getUser arasına başka kod koyma.
  // Aksi halde oturumun rastgele koparak kullanıcıların çıkış yapmasına yol açabilir.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  // Girişsiz kullanıcı korumalı sayfada → /login (geri dönüş için redirect param)
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return copyCookies(supabaseResponse, NextResponse.redirect(url))
  }

  // Girişli kullanıcı auth sayfasında → /dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return copyCookies(supabaseResponse, NextResponse.redirect(url))
  }

  return supabaseResponse
}

/** Yenilenen oturum cookie'lerini redirect yanıtına taşır (kaybolmasını önler). */
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie))
  return to
}
