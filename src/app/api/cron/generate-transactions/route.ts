import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Vercel Cron tarafından günlük çağrılır: aktif abonelikler + tekrarlı
 * kurallardan bugüne kadar geçen dönemler için defter kaydı üretir.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET yapılandırılmamış." },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("generate_due_transactions")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ generated: data })
}
