import type { SubscriptionView } from "@/types"

export const CSV_HEADERS = [
  "name",
  "price",
  "currency",
  "billing_cycle",
  "category",
  "first_billing_date",
  "status",
  "cancel_url",
  "notes",
] as const

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Abonelikleri, dışa/içe aktarımda kullanılan sabit sütun sırasıyla CSV metnine çevirir. */
export function subscriptionsToCSV(subs: SubscriptionView[]): string {
  const rows = subs.map((s) => [
    s.name,
    String(s.price),
    s.currency,
    s.billing_cycle,
    s.category,
    s.first_billing_date,
    s.status,
    s.cancel_url ?? "",
    s.notes ?? "",
  ])
  return [CSV_HEADERS as unknown as string[], ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n")
}

/** Basit RFC4180 satır ayrıştırıcı (tırnaklı alan + iç virgül/satır sonu desteği). */
function splitCSVRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]!
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }
    if (char === '"') {
      inQuotes = true
      continue
    }
    if (char === ",") {
      row.push(field)
      field = ""
      continue
    }
    if (char === "\r") continue
    if (char === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
      continue
    }
    field += char
  }
  if (field !== "" || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""))
}

export type ParsedCSVRow = Record<string, string>

/** CSV metnini başlık satırına göre nesne dizisine çevirir. */
export function parseCSV(text: string): ParsedCSVRow[] {
  const rows = splitCSVRows(text)
  if (rows.length === 0) return []
  const headers = rows[0]!.map((h) => h.trim())
  return rows.slice(1).map((row) => {
    const obj: ParsedCSVRow = {}
    headers.forEach((h, i) => {
      obj[h] = (row[i] ?? "").trim()
    })
    return obj
  })
}
