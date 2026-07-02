"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  MoreVertical,
  PauseCircle,
  Pencil,
  PlayCircle,
  Trash2,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TransactionForm } from "@/components/budget/transaction-form"
import {
  deleteRecurringRule,
  setRecurringRuleStatus,
} from "@/lib/actions/transactions"
import { CYCLE_SUFFIX } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { RecurringRule, SubscriptionStatus } from "@/types"

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: "Aktif",
  paused: "Duraklatıldı",
  cancelled: "İptal edildi",
}

export function RecurringRulesList({
  rules,
  defaultCurrency,
}: {
  rules: RecurringRule[]
  defaultCurrency?: string
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<RecurringRule | null>(null)
  const [deleting, setDeleting] = useState<RecurringRule | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleStatus(rule: RecurringRule, status: SubscriptionStatus) {
    const result = await setRecurringRuleStatus(rule.id, status)
    if (!result.success) {
      toast.error("Durum değiştirilemedi", { description: result.error })
      return
    }
    toast.success(
      status === "active"
        ? "Kural etkinleştirildi"
        : status === "paused"
          ? "Kural duraklatıldı"
          : "Kural iptal edildi"
    )
    router.refresh()
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    const result = await deleteRecurringRule(deleting.id)
    setDeleteLoading(false)

    if (!result.success) {
      toast.error("Silinemedi", { description: result.error })
      return
    }
    toast.success("Kural silindi")
    setDeleting(null)
    router.refresh()
  }

  if (rules.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Henüz tekrarlı bir gelir/gider kuralı yok.
      </p>
    )
  }

  return (
    <>
      <ul className="space-y-3">
        {rules.map((rule) => {
          const isActive = rule.status === "active"
          return (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-2.5",
                !isActive && "opacity-60"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{rule.name}</p>
                  <Badge variant="secondary" className="shrink-0">
                    {rule.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isActive
                    ? CYCLE_SUFFIX[rule.billing_cycle]
                    : STATUS_LABEL[rule.status]}
                </p>
              </div>
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  rule.type === "income" &&
                    "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {rule.type === "income" ? "+" : "−"}
                {formatCurrency(rule.amount, rule.currency)}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0"
                      aria-label="Kural menüsü"
                    />
                  }
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(rule)}>
                    <Pencil className="size-4" />
                    Düzenle
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {!isActive && (
                    <DropdownMenuItem
                      onClick={() => handleStatus(rule, "active")}
                    >
                      <PlayCircle className="size-4" />
                      {rule.status === "paused"
                        ? "Devam ettir"
                        : "Yeniden etkinleştir"}
                    </DropdownMenuItem>
                  )}
                  {isActive && (
                    <DropdownMenuItem
                      onClick={() => handleStatus(rule, "paused")}
                    >
                      <PauseCircle className="size-4" />
                      Duraklat
                    </DropdownMenuItem>
                  )}
                  {rule.status !== "cancelled" && (
                    <DropdownMenuItem
                      onClick={() => handleStatus(rule, "cancelled")}
                    >
                      <XCircle className="size-4" />
                      İptal et
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setDeleting(rule)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          )
        })}
      </ul>

      {/* Düzenleme */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kuralı düzenle</DialogTitle>
            <DialogDescription>
              {editing?.name} bilgilerini güncelle.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <TransactionForm
              mode="edit"
              recurringRule={editing}
              defaultCurrency={defaultCurrency}
              onSuccess={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Silme onayı */}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kural silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.name}&rdquo; kalıcı olarak silinecek. Geçmiş
              defter kayıtları korunur, bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading && <Loader2 className="size-4 animate-spin" />}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
