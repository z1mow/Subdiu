import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

/**
 * Service-role istemcisi — kullanıcı oturumuna bağlı değildir, RLS'i bypass eder.
 * SADECE sunucu tarafı güvenilir bağlamlarda (cron route handler) kullanılır,
 * asla client'a sızdırılmaz.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
