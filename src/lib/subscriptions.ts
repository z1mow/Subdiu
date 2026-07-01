import { CATEGORY_COLORS, colorFromString } from "@/lib/constants"
import type { SubscriptionView } from "@/types"

/** Date nesnesini `yyyy-mm-dd` (yerel) biçimine çevirir. */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Bugünden verilen tarihe kalan tam gün sayısı (negatif = geçmiş). */
export function daysUntil(date: string | Date): number {
  const target = typeof date === "string" ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export type Urgency = "overdue" | "soon" | "upcoming" | "later"

/** Kalan güne göre aciliyet seviyesi (renk kodlaması için). */
export function urgencyOf(date: string | Date): Urgency {
  const d = daysUntil(date)
  if (d < 0) return "overdue"
  if (d <= 3) return "soon"
  if (d <= 7) return "upcoming"
  return "later"
}

/** Kalan günü okunur metne çevirir (ör. "Bugün", "3 gün sonra"). */
export function relativeDays(date: string | Date): string {
  const d = daysUntil(date)
  if (d < 0) return `${Math.abs(d)} gün gecikti`
  if (d === 0) return "Bugün"
  if (d === 1) return "Yarın"
  return `${d} gün sonra`
}

export type CurrencySpending = {
  currency: string
  monthly: number
  yearly: number
  count: number
}

/** Aktif abonelikleri para birimine göre gruplayıp aylık/yıllık toplamları çıkarır. */
export function groupSpendingByCurrency(
  subs: SubscriptionView[]
): CurrencySpending[] {
  const map = new Map<string, CurrencySpending>()
  for (const s of subs) {
    if (s.status !== "active") continue
    const cur = map.get(s.currency) ?? {
      currency: s.currency,
      monthly: 0,
      yearly: 0,
      count: 0,
    }
    cur.monthly += s.monthly_price
    cur.yearly += s.yearly_price
    cur.count += 1
    map.set(s.currency, cur)
  }
  return [...map.values()].sort((a, b) => b.monthly - a.monthly)
}

/** Verilen para biriminde, kategoriye göre aylık harcama dağılımı (grafik için). */
export function categoryBreakdown(
  subs: SubscriptionView[],
  currency: string
): { category: string; value: number; color: string }[] {
  const map = new Map<string, number>()
  for (const s of subs) {
    if (s.status !== "active" || s.currency !== currency) continue
    map.set(s.category, (map.get(s.category) ?? 0) + s.monthly_price)
  }
  return [...map.entries()]
    .map(([category, value]) => ({
      category,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_COLORS[category] ?? colorFromString(category),
    }))
    .sort((a, b) => b.value - a.value)
}

/** Aktif abonelikleri sonraki ödeme tarihine göre sıralayıp ilk n tanesini döndürür. */
export function upcomingPayments(
  subs: SubscriptionView[],
  limit = 5
): SubscriptionView[] {
  return subs
    .filter((s) => s.status === "active")
    .slice()
    .sort(
      (a, b) =>
        new Date(a.next_billing_date).getTime() -
        new Date(b.next_billing_date).getTime()
    )
    .slice(0, limit)
}
