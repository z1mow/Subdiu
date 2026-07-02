import { type NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

// Next.js 16: "middleware" konvansiyonu yerine "proxy".
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Aşağıdakiler DIŞINDA tüm istek yollarında çalışır:
     * - api/* (route handler'lar kendi auth'unu yönetir; cron gibi
     *   servis-rolü uçları kullanıcı oturumuna bağlı olmamalı)
     * - _next/static, _next/image (Next varlıkları)
     * - favicon.ico ve yaygın statik görsel uzantıları
     * Böylece her sayfa gezinmesinde oturum yenilenir.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
