"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { importSubscriptions } from "@/lib/actions/subscriptions"
import { BILLING_CYCLES } from "@/lib/constants"
import { parseCSV } from "@/lib/csv"

const CYCLE_LABEL_TO_VALUE = new Map(
  BILLING_CYCLES.map((c) => [c.label.toLocaleLowerCase("tr"), c.value])
)
const STATUS_LABEL_TO_VALUE: Record<string, string> = {
  aktif: "active",
  duraklatıldı: "paused",
  duraklat: "paused",
  "i̇ptal edildi": "cancelled",
  "iptal edildi": "cancelled",
  iptal: "cancelled",
}

function normalizeCycle(value: string): string {
  const v = value.trim().toLocaleLowerCase("tr")
  return CYCLE_LABEL_TO_VALUE.get(v) ?? value.trim()
}

function normalizeStatus(value: string): string | undefined {
  if (!value.trim()) return undefined
  const v = value.trim().toLocaleLowerCase("tr")
  return STATUS_LABEL_TO_VALUE[v] ?? value.trim()
}

export function ImportButton() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setLoading(true)
    try {
      const text = await file.text()
      const parsed = parseCSV(text)
      const rows = parsed.map((row) => ({
        name: row.name ?? "",
        price: Number(row.price),
        currency: (row.currency ?? "").trim().toUpperCase(),
        billing_cycle: normalizeCycle(row.billing_cycle ?? ""),
        category: row.category ?? "",
        first_billing_date: row.first_billing_date ?? "",
        status: normalizeStatus(row.status ?? ""),
        cancel_url: row.cancel_url ?? "",
        notes: row.notes ?? "",
      }))

      const result = await importSubscriptions(rows)
      if (!result.success) {
        toast.error("İçe aktarılamadı", { description: result.error })
        return
      }
      toast.success(`${result.imported} abonelik içe aktarıldı`, {
        description:
          result.skipped > 0 ? `${result.skipped} satır atlandı` : undefined,
      })
      router.refresh()
    } catch {
      toast.error("Dosya okunamadı", {
        description: "Geçerli bir CSV dosyası seç.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        İçe aktar
      </Button>
    </>
  )
}
