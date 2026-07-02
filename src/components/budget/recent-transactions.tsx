"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { deleteTransaction } from "@/lib/actions/transactions"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/types"

export function RecentTransactions({ items }: { items: Transaction[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteTransaction(id)
    setDeletingId(null)

    if (!result.success) {
      toast.error("Silinemedi", { description: result.error })
      return
    }
    toast.success("Kayıt silindi")
    router.refresh()
  }

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Henüz bir kayıt yok.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t.id} className="group flex items-center gap-3">
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              t.type === "income" ? "bg-emerald-500" : "bg-destructive"
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{t.category}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(t.occurred_on)}
              {t.subscription_id && " · Abonelik"}
              {t.recurring_rule_id && " · Tekrarlı"}
            </p>
          </div>
          <span
            className={cn(
              "text-sm font-medium tabular-nums",
              t.type === "income" && "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {t.type === "income" ? "+" : "−"}
            {formatCurrency(t.amount, t.currency)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 opacity-0 group-hover:opacity-100"
            aria-label="Kaydı sil"
            disabled={deletingId === t.id}
            onClick={() => handleDelete(t.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
