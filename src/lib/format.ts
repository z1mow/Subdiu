/** Ad/e-postadan avatar baş harfleri üretir. */
export function getInitials(nameOrEmail: string): string {
  const value = nameOrEmail.trim()
  if (!value) return "?"
  if (value.includes("@")) return value[0]!.toUpperCase()

  const parts = value.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1]![0] : ""
  return (first + last).toUpperCase() || "?"
}

/** Para birimine göre biçimlenmiş tutar (ör. ₺149,90 · $9.99). */
export function formatCurrency(
  amount: number,
  currency: string,
  locale = "tr-TR"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Geçersiz para birimi kodu → sade gösterim.
    return `${amount.toFixed(2)} ${currency}`
  }
}

/** Tarihi kısa, okunur biçimde döndürür (ör. 5 Tem 2026). */
export function formatDate(date: string | Date, locale = "tr-TR"): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d)
}
