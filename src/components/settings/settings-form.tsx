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

export function SettingsForm({ defaultCurrency }: { defaultCurrency: string }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [currency, setCurrency] = useState(defaultCurrency)
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  async function handleSave() {
    setSaving(true)
    const nextTheme = (theme as "light" | "dark" | "system") ?? "system"
    const result = await updateProfile({
      default_currency: currency,
      theme: nextTheme,
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
