import type { Metadata } from "next"
import { redirect } from "next/navigation"
import {
  CalendarClock,
  CreditCard,
  Scale,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { FadeIn } from "@/components/motion/fade-in"
import { StatCard } from "@/components/dashboard/stat-card"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments"
import { AddTransactionButton } from "@/components/budget/add-transaction-button"
import { RecentTransactions } from "@/components/budget/recent-transactions"
import { RecurringRulesList } from "@/components/budget/recurring-rules-list"
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
import { formatCurrency } from "@/lib/format"
import {
  categorySpending,
  convertedTotals,
  spendingTrend,
  toISODate,
  upcomingPayments,
} from "@/lib/subscriptions"
import { monthlyIncomeExpense } from "@/lib/transactions"
import type { RecurringRule, SubscriptionView, Transaction } from "@/types"

export const metadata: Metadata = {
  title: "Genel Bakış",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const now = new Date()
  const monthStart = toISODate(new Date(now.getFullYear(), now.getMonth(), 1))

  const [subsRes, profileRes, monthTxRes, recentTxRes, rulesRes] =
    await Promise.all([
      supabase
        .from("subscriptions_view")
        .select("*")
        .order("next_billing_date", { ascending: true }),
      supabase
        .from("profiles")
        .select("default_currency")
        .eq("id", user.id)
        .single(),
      supabase.from("transactions").select("*").gte("occurred_on", monthStart),
      supabase
        .from("transactions")
        .select("*")
        .order("occurred_on", { ascending: false })
        .limit(8),
      supabase
        .from("recurring_rules")
        .select("*")
        .order("created_at", { ascending: false }),
    ])

  const subscriptions: SubscriptionView[] = subsRes.data ?? []
  const defaultCurrency = profileRes.data?.default_currency ?? "TRY"
  const monthTransactions: Transaction[] = monthTxRes.data ?? []
  const recentTx: Transaction[] = recentTxRes.data ?? []
  const recurringRules: RecurringRule[] = rulesRes.data ?? []

  const activeSubs = subscriptions.filter((s) => s.status === "active")
  // Farklı para birimi varsa kurları çek; hepsi varsayılan birimdeyse gerek yok.
  const needRates =
    activeSubs.some((s) => s.currency !== defaultCurrency) ||
    monthTransactions.some((t) => t.currency !== defaultCurrency)
  const rates = needRates
    ? ((await getExchangeRates(defaultCurrency)) ?? { [defaultCurrency]: 1 })
    : { [defaultCurrency]: 1 }

  const totals = convertedTotals(subscriptions, rates)
  const breakdown = categorySpending(subscriptions, rates)
  const upcoming = upcomingPayments(subscriptions, 5)
  const trend = spendingTrend(subscriptions, rates, 6)
  const budget = monthlyIncomeExpense(monthTransactions, rates, now)

  const convHint = needRates
    ? totals.complete
      ? "≈ güncel kurlarla"
      : "≈ bazı kurlar alınamadı"
    : undefined
  const budgetHint = needRates && !budget.complete ? "≈ bazı kurlar alınamadı" : undefined
  const netLabel =
    budget.net > 0
      ? `+${formatCurrency(budget.net, defaultCurrency)}`
      : formatCurrency(budget.net, defaultCurrency)

  const isEmpty =
    subscriptions.length === 0 &&
    monthTransactions.length === 0 &&
    recentTx.length === 0 &&
    recurringRules.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Genel Bakış"
        description="Harcamalarına ve yaklaşan ödemelerine tek bakışta göz at."
      >
        <AddTransactionButton
          defaultCurrency={defaultCurrency}
          variant="outline"
        />
        <AddSubscriptionButton defaultCurrency={defaultCurrency} />
      </PageHeader>

      {isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Wallet className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Hadi başlayalım</p>
              <p className="text-sm text-muted-foreground">
                İlk aboneliğini veya gelir/gider kaydını ekle; harcamaların ve
                grafiklerin burada canlansın.
              </p>
            </div>
            <div className="flex gap-2">
              <AddTransactionButton
                defaultCurrency={defaultCurrency}
                variant="outline"
              />
              <AddSubscriptionButton defaultCurrency={defaultCurrency} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {subscriptions.length > 0 && (
            <>
              <FadeIn className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  label="Aylık Harcama"
                  value={formatCurrency(totals.monthly, defaultCurrency)}
                  hint={convHint}
                  icon={Wallet}
                />
                <StatCard
                  label="Yıllık Harcama"
                  value={formatCurrency(totals.yearly, defaultCurrency)}
                  hint={convHint}
                  icon={CreditCard}
                />
                <StatCard
                  label="Aktif Abonelik"
                  value={String(activeSubs.length)}
                  hint={`${subscriptions.length} toplam kayıt`}
                  icon={CalendarClock}
                />
              </FadeIn>

              <FadeIn delay={0.06} className="grid gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Kategori dağılımı</CardTitle>
                    <CardDescription>
                      Aylık bazda · {defaultCurrency}
                    </CardDescription>
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

          <div className="space-y-1 pt-2">
            <h2 className="text-lg font-semibold tracking-tight">Bütçe</h2>
            <p className="text-sm text-muted-foreground">
              Bu ay gerçekleşen gelir/gider — abonelik ödemeleri dahil.
            </p>
          </div>

          <FadeIn delay={0.14} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Bu Ay Gelir"
              value={formatCurrency(budget.income, defaultCurrency)}
              hint={budgetHint}
              icon={TrendingUp}
            />
            <StatCard
              label="Bu Ay Gider"
              value={formatCurrency(budget.expense, defaultCurrency)}
              hint={budgetHint}
              icon={TrendingDown}
            />
            <StatCard label="Net" value={netLabel} icon={Scale} />
          </FadeIn>

          <FadeIn delay={0.18} className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Son işlemler</CardTitle>
                <CardDescription>En yeni 8 kayıt</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions items={recentTx} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tekrarlı gelir/giderler</CardTitle>
                <CardDescription>Maaş, kira gibi düzenli kalemler</CardDescription>
              </CardHeader>
              <CardContent>
                <RecurringRulesList
                  rules={recurringRules}
                  defaultCurrency={defaultCurrency}
                />
              </CardContent>
            </Card>
          </FadeIn>
        </>
      )}
    </div>
  )
}
