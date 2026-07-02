import { CATEGORY_COLORS, colorFromString } from "@/lib/constants"
import type { Rates } from "@/lib/exchange"
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

/** Bir tutarı, kur tablosunu kullanarak temel para birimine çevirir. Kur yoksa null. */
export function convertToBase(
  amount: number,
  currency: string,
  rates: Rates | null
): number | null {
  if (!rates) return null
  const rate = rates[currency]
  if (!rate) return null
  return amount / rate
}

export type SpendingTotals = {
  monthly: number
  yearly: number
  /** Tüm aktif abonelikler çevrilebildi mi (false → bazı kurlar eksik). */
  complete: boolean
}

/** Aktif aboneliklerin aylık/yıllık toplamını temel para biriminde döndürür. */
export function convertedTotals(
  subs: SubscriptionView[],
  rates: Rates | null
): SpendingTotals {
  let monthly = 0
  let yearly = 0
  let complete = true

  for (const s of subs) {
    if (s.status !== "active") continue
    const m = convertToBase(s.monthly_price, s.currency, rates)
    const y = convertToBase(s.yearly_price, s.currency, rates)
    if (m === null || y === null) {
      complete = false
      continue
    }
    monthly += m
    yearly += y
  }

  return {
    monthly: Math.round(monthly * 100) / 100,
    yearly: Math.round(yearly * 100) / 100,
    complete,
  }
}

/** Kategoriye göre aylık harcama dağılımı — hepsi temel para birimine çevrilir (grafik için). */
export function categorySpending(
  subs: SubscriptionView[],
  rates: Rates | null
): { category: string; value: number; color: string }[] {
  const map = new Map<string, number>()
  for (const s of subs) {
    if (s.status !== "active") continue
    const m = convertToBase(s.monthly_price, s.currency, rates)
    if (m === null) continue
    map.set(s.category, (map.get(s.category) ?? 0) + m)
  }
  return [...map.entries()]
    .map(([category, value]) => ({
      category,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_COLORS[category] ?? colorFromString(category),
    }))
    .sort((a, b) => b.value - a.value)
}

export type TrendPoint = { key: string; label: string; total: number }

/** Bir tarihi `yıl*12+ay` tam sayısına indirger (ay bazlı karşılaştırma için). */
function monthIndexOf(date: string): number {
  const d = new Date(date)
  return d.getFullYear() * 12 + d.getMonth()
}

/**
 * Son `months` ay için toplam aylık harcama trendi (temel para biriminde).
 * Geçmiş durum değişikliği loglanmadığından yaklaşık hesaplanır: aktif abonelikler
 * first_billing_date'ten itibaren her ay sayılır; duraklatılan/iptal edilenler
 * `updated_at` ayına kadar sayılır (durum değişikliğinin o an olduğu varsayılır).
 */
export function spendingTrend(
  subs: SubscriptionView[],
  rates: Rates | null,
  months = 6
): TrendPoint[] {
  const now = new Date()
  const points: TrendPoint[] = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthIndex = d.getFullYear() * 12 + d.getMonth()
    let total = 0

    for (const s of subs) {
      if (monthIndexOf(s.first_billing_date) > monthIndex) continue
      if (s.status !== "active" && monthIndexOf(s.updated_at) < monthIndex) continue

      const amount = convertToBase(s.monthly_price, s.currency, rates)
      if (amount !== null) total += amount
    }

    points.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(d),
      total: Math.round(total * 100) / 100,
    })
  }

  return points
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
