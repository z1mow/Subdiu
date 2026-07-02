import type { BillingCycle } from "@/types"

/** Select bileşenleri için {value,label} çiftleri (Base UI `items` prop'u ile uyumlu). */

export const CURRENCIES: { value: string; label: string }[] = [
  { value: "TRY", label: "₺ TRY" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
  { value: "GBP", label: "£ GBP" },
]

export const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Aylık" },
  { value: "yearly", label: "Yıllık" },
  { value: "weekly", label: "Haftalık" },
  { value: "quarterly", label: "3 Aylık" },
]

/** Döngü kodunu kısa ekine çevirir (ör. monthly → /ay). */
export const CYCLE_SUFFIX: Record<BillingCycle, string> = {
  weekly: "/hafta",
  monthly: "/ay",
  quarterly: "/3 ay",
  yearly: "/yıl",
}

export const CATEGORIES: string[] = [
  "Eğlence",
  "Müzik",
  "Yazılım",
  "Oyun",
  "Fatura",
  "Depolama",
  "Eğitim",
  "Fitness",
  "Haberler",
  "Diğer",
]

export const CATEGORY_ITEMS = CATEGORIES.map((c) => ({ value: c, label: c }))

/** Grafik ve rozetler için kategori renkleri. */
export const CATEGORY_COLORS: Record<string, string> = {
  Eğlence: "#e11d48",
  Müzik: "#22c55e",
  Yazılım: "#6366f1",
  Oyun: "#f59e0b",
  Fatura: "#0ea5e9",
  Depolama: "#14b8a6",
  Eğitim: "#a855f7",
  Fitness: "#ef4444",
  Haberler: "#64748b",
  Diğer: "#94a3b8",
}

/** Hızlı ekleme için hazır popüler servisler (isim + marka rengi + kategori + simple-icons slug). */
export const POPULAR_SERVICES: {
  name: string
  color: string
  category: string
  slug: string
}[] = [
  { name: "Netflix", color: "#E50914", category: "Eğlence", slug: "netflix" },
  { name: "Spotify", color: "#1DB954", category: "Müzik", slug: "spotify" },
  { name: "YouTube Premium", color: "#FF0000", category: "Eğlence", slug: "youtube" },
  { name: "Disney+", color: "#113CCF", category: "Eğlence", slug: "" },
  { name: "Amazon Prime", color: "#00A8E1", category: "Eğlence", slug: "" },
  { name: "Apple Music", color: "#FA243C", category: "Müzik", slug: "applemusic" },
  { name: "iCloud+", color: "#3693F3", category: "Depolama", slug: "icloud" },
  { name: "Google One", color: "#4285F4", category: "Depolama", slug: "google" },
  { name: "ChatGPT Plus", color: "#10A37F", category: "Yazılım", slug: "" },
  { name: "Adobe CC", color: "#FF0000", category: "Yazılım", slug: "" },
  { name: "GitHub", color: "#181717", category: "Yazılım", slug: "github" },
  { name: "Notion", color: "#0F0F0F", category: "Yazılım", slug: "notion" },
  { name: "Xbox Game Pass", color: "#107C10", category: "Oyun", slug: "" },
  { name: "PS Plus", color: "#0070D1", category: "Oyun", slug: "playstation" },
]

/** Abonelik adından bilinen bir simple-icons slug'ı bulur (yoksa null). */
export function iconSlugFor(name: string): string | null {
  const normalized = name.trim().toLocaleLowerCase("tr")
  const match = POPULAR_SERVICES.find(
    (s) => s.name.toLocaleLowerCase("tr") === normalized
  )
  return match?.slug || null
}

/** Bir metinden deterministik, canlı bir renk üretir (bilinmeyen servisler için). */
export function colorFromString(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue} 65% 45%)`
}
