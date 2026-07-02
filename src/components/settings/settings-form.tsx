"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateProfile } from "@/lib/actions/profile"
import { CURRENCIES } from "@/lib/constants"

const THEMES = [
  { value: "light", label: "Aydınlık" },
  { value: "dark", label: "Karanlık" },
  { value: "system", label: "Sistem" },
]

type Props = {
  defaultCurrency: string
  defaultBudget: number | null
}

export function SettingsForm({ defaultCurrency, defaultBudget }: Props) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [currency, setCurrency] = useState(defaultCurrency)
  const [budget, setBudget] = useState(
    defaultBudget !== null ? String(defaultBudget) : ""
  )
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  async function handleSave() {
    const trimmedBudget = budget.trim()
    if (trimmedBudget !== "" && (Number.isNaN(Number(trimmedBudget)) || Number(trimmedBudget) < 0)) {
      toast.error("Geçerli bir bütçe tutarı gir.")
      return
    }

    setSaving(true)
    const nextTheme = (theme as "light" | "dark" | "system") ?? "system"
    const result = await updateProfile({
      default_currency: currency,
      theme: nextTheme,
      monthly_budget: trimmedBudget === "" ? null : Number(trimmedBudget),
    })
    setSaving(false)

    if (!result.success) {
      toast.error("Kaydedilemedi", { description: result.error })
      return
    }
    toast.success("Ayarlar kaydedildi")
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tercihler</CardTitle>
        <CardDescription>
          Varsayılan para birimi yeni aboneliklerde önceden seçilir.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currency">Varsayılan para birimi</Label>
          <Select
            items={CURRENCIES}
            value={currency || null}
            onValueChange={(value) => setCurrency(String(value))}
          >
            <SelectTrigger id="currency" className="w-full">
              <SelectValue placeholder="Seç" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">Tema</Label>
          <Select
            items={THEMES}
            value={mounted ? (theme ?? "system") : null}
            onValueChange={(value) => setTheme(String(value))}
          >
            <SelectTrigger id="theme" className="w-full">
              <SelectValue placeholder="Sistem" />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="budget">Aylık bütçe limiti (opsiyonel)</Label>
          <Input
            id="budget"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="Ör. 1500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="max-w-48"
          />
          <p className="text-xs text-muted-foreground">
            Dashboard&apos;da bu tutarı aştığında uyarı gösterilir.
          </p>
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Kaydet
        </Button>
      </CardFooter>
    </Card>
  )
}
