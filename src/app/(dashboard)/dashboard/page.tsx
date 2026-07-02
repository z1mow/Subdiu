import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CalendarClock, Wallet } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { FadeIn } from "@/components/motion/fade-in"
import { StatCard } from "@/components/dashboard/stat-card"
import { BudgetCard } from "@/components/dashboard/budget-card"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { TotalToggleCard } from "@/components/dashboard/total-toggle-card"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments"
import { AddSubscriptionButton } from "@/components/subscriptions/add-subscription-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { getExchangeRates } from "@/lib/exchange"
import {
  categorySpending,
  convertedTotals,
  spendingTrend,
  upcomingPayments,
} from "@/lib/subscriptions"
import type { SubscriptionView } from "@/types"

export const metadata: Metadata = {
  title: "Genel Bakış",
}

export default async function DashboardPage() {
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
      .select("default_currency, monthly_budget")
      .eq("id", user.id)
      .single(),
  ])

  const subscriptions: SubscriptionView[] = subsRes.data ?? []
  const defaultCurrency = profileRes.data?.default_currency ?? "TRY"
  const monthlyBudget = profileRes.data?.monthly_budget ?? null

  const activeSubs = subscriptions.filter((s) => s.status === "active")
  // Farklı para birimi varsa kurları çek; hepsi varsayılan birimdeyse gerek yok.
  const needRates = activeSubs.some((s) => s.currency !== defaultCurrency)
  const rates = needRates
    ? ((await getExchangeRates(defaultCurrency)) ?? { [defaultCurrency]: 1 })
    : { [defaultCurrency]: 1 }

  const totals = convertedTotals(subscriptions, rates)
  const breakdown = categorySpending(subscriptions, rates)
  const upcoming = upcomingPayments(subscriptions, 5)
  const trend = spendingTrend(subscriptions, rates, 6)

  const convHint = needRates
    ? totals.complete
      ? "≈ güncel kurlarla"
      : "≈ bazı kurlar alınamadı"
    : undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title="Genel Bakış"
        description="Harcamalarına ve yaklaşan ödemelerine tek bakışta göz at."
      >
        <AddSubscriptionButton defaultCurrency={defaultCurrency} />
      </PageHeader>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Wallet className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Hadi başlayalım</p>
              <p className="text-sm text-muted-foreground">
                İlk aboneliğini ekle; harcamaların ve grafiklerin burada
                canlansın.
              </p>
            </div>
            <AddSubscriptionButton defaultCurrency={defaultCurrency} />
          </CardContent>
        </Card>
      ) : (
        <>
          <FadeIn className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TotalToggleCard
              monthly={totals.monthly}
              yearly={totals.yearly}
              currency={defaultCurrency}
              hint={convHint}
            />
            <StatCard
              label="Aktif Abonelik"
              value={String(activeSubs.length)}
              hint={`${subscriptions.length} toplam kayıt`}
              icon={CalendarClock}
            />
            <BudgetCard
              spent={totals.monthly}
              limit={monthlyBudget}
              currency={defaultCurrency}
            />
          </FadeIn>

          <FadeIn delay={0.06} className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Kategori dağılımı</CardTitle>
                <CardDescription>Aylık bazda · {defaultCurrency}</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryChart data={breakdown} currency={defaultCurrency} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Yaklaşan ödemeler</CardTitle>
                <CardDescription>Sıradaki 5 ödeme</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingPayments items={upcoming} />
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Harcama trendi</CardTitle>
                <CardDescription>Son 6 ay · {defaultCurrency}</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart data={trend} currency={defaultCurrency} />
              </CardContent>
            </Card>
          </FadeIn>
        </>
      )}
    </div>
  )
}
