import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CalendarClock, CreditCard, Wallet } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { FadeIn } from "@/components/motion/fade-in"
import { StatCard } from "@/components/dashboard/stat-card"
import { CategoryChart } from "@/components/dashboard/category-chart"
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
import { formatCurrency } from "@/lib/format"
import {
  categoryBreakdown,
  groupSpendingByCurrency,
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
      .select("default_currency")
      .eq("id", user.id)
      .single(),
  ])

  const subscriptions: SubscriptionView[] = subsRes.data ?? []
  const defaultCurrency = profileRes.data?.default_currency ?? "TRY"

  const spending = groupSpendingByCurrency(subscriptions)
  const primary =
    spending.find((s) => s.currency === defaultCurrency) ?? spending[0]
  const primaryCurrency = primary?.currency ?? defaultCurrency
  const otherCurrencies = spending
    .filter((s) => s.currency !== primaryCurrency)
    .map((s) => s.currency)

  const activeCount = subscriptions.filter((s) => s.status === "active").length
  const breakdown = categoryBreakdown(subscriptions, primaryCurrency)
  const upcoming = upcomingPayments(subscriptions, 5)

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
            <StatCard
              label="Aylık Harcama"
              value={formatCurrency(primary?.monthly ?? 0, primaryCurrency)}
              hint={
                otherCurrencies.length
                  ? `Ayrıca: ${otherCurrencies.join(", ")}`
                  : undefined
              }
              icon={Wallet}
            />
            <StatCard
              label="Yıllık Harcama"
              value={formatCurrency(primary?.yearly ?? 0, primaryCurrency)}
              icon={CreditCard}
            />
            <StatCard
              label="Aktif Abonelik"
              value={String(activeCount)}
              hint={`${subscriptions.length} toplam kayıt`}
              icon={CalendarClock}
            />
          </FadeIn>

          <FadeIn delay={0.06} className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Kategori dağılımı</CardTitle>
                <CardDescription>Aylık bazda · {primaryCurrency}</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryChart data={breakdown} currency={primaryCurrency} />
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
        </>
      )}
    </div>
  )
}
