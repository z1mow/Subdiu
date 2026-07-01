import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PageHeader } from "@/components/layout/page-header"
import { AddSubscriptionButton } from "@/components/subscriptions/add-subscription-button"
import { SubscriptionsBrowser } from "@/components/subscriptions/subscriptions-browser"
import { createClient } from "@/lib/supabase/server"
import type { SubscriptionView } from "@/types"

export const metadata: Metadata = {
  title: "Abonelikler",
}

export default async function SubscriptionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [subsRes, profileRes] = await Promise.all([
    supabase
      .from("subscriptions_view")
      .select("*")
      .order("next_billing_date", { ascending: true }),
    supabase
      .from("profiles")
      .select("default_currency")
      .eq("id", user.id)
      .single(),
  ])

  const subscriptions: SubscriptionView[] = subsRes.data ?? []
  const defaultCurrency = profileRes.data?.default_currency ?? "TRY"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Abonelikler"
        description={`${subscriptions.length} abonelik`}
      >
        <AddSubscriptionButton defaultCurrency={defaultCurrency} />
      </PageHeader>

      <SubscriptionsBrowser
        subscriptions={subscriptions}
        defaultCurrency={defaultCurrency}
      />
    </div>
  )
}
