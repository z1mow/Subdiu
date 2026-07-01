"use client"

import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { CreditCard, Search } from "lucide-react"

import { AddSubscriptionButton } from "@/components/subscriptions/add-subscription-button"
import { SubscriptionCard } from "@/components/subscriptions/subscription-card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SubscriptionView } from "@/types"

type Sort = "date" | "price" | "name"

const SORTS: { value: Sort; label: string }[] = [
  { value: "date", label: "Yaklaşan ödeme" },
  { value: "price", label: "Fiyat (yüksek)" },
  { value: "name", label: "İsim (A-Z)" },
]

type Props = {
  subscriptions: SubscriptionView[]
  defaultCurrency?: string
}

export function SubscriptionsBrowser({ subscriptions, defaultCurrency }: Props) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState<Sort>("date")

  const categoryItems = useMemo(() => {
    const unique = Array.from(new Set(subscriptions.map((s) => s.category)))
    return [
      { value: "all", label: "Tüm kategoriler" },
      ...unique.map((c) => ({ value: c, label: c })),
    ]
  }, [subscriptions])

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr")
    return subscriptions
      .filter(
        (s) =>
          (category === "all" || s.category === category) &&
          (q === "" || s.name.toLocaleLowerCase("tr").includes(q))
      )
      .sort((a, b) => {
        if (sort === "price") return b.monthly_price - a.monthly_price
        if (sort === "name") return a.name.localeCompare(b.name, "tr")
        return (
          new Date(a.next_billing_date).getTime() -
          new Date(b.next_billing_date).getTime()
        )
      })
  }, [subscriptions, query, category, sort])

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <CreditCard className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">Henüz abonelik eklemedin</p>
          <p className="text-sm text-muted-foreground">
            İlk aboneliğini ekleyerek harcamalarını takip etmeye başla.
          </p>
        </div>
        <AddSubscriptionButton defaultCurrency={defaultCurrency} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Abonelik ara…"
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select
            items={categoryItems}
            value={category}
            onValueChange={(v) => setCategory(String(v))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryItems.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={SORTS}
            value={sort}
            onValueChange={(v) => setSort(v as Sort)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          Aramanla eşleşen abonelik yok.
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((s) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SubscriptionCard
                subscription={s}
                defaultCurrency={defaultCurrency}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
