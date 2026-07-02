import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PageHeader } from "@/components/layout/page-header"
import { SettingsForm } from "@/components/settings/settings-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Ayarlar",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_currency, monthly_budget")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ayarlar"
        description="Varsayılan para birimi ve tema tercihlerini yönet."
      />
      <SettingsForm
        defaultCurrency={profile?.default_currency ?? "TRY"}
        defaultBudget={profile?.monthly_budget ?? null}
      />
    </div>
  )
}
