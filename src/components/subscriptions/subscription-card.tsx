"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ExternalLink,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
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
import { ServiceLogo } from "@/components/subscriptions/service-logo"
import { SubscriptionForm } from "@/components/subscriptions/subscription-form"
import { deleteSubscription } from "@/lib/actions/subscriptions"
import { CYCLE_SUFFIX } from "@/lib/constants"
import { formatCurrency, formatDate } from "@/lib/format"
import { relativeDays, urgencyOf, type Urgency } from "@/lib/subscriptions"
import { cn } from "@/lib/utils"
import type { SubscriptionView } from "@/types"

const URGENCY_CLASS: Record<Urgency, string> = {
  overdue: "text-destructive",
  soon: "text-destructive",
  upcoming: "text-amber-600 dark:text-amber-500",
  later: "text-muted-foreground",
}

type Props = {
  subscription: SubscriptionView
  defaultCurrency?: string
}

export function SubscriptionCard({ subscription, defaultCurrency }: Props) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const urgency = urgencyOf(subscription.next_billing_date)

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteSubscription(subscription.id)
    setDeleting(false)

    if (!result.success) {
      toast.error("Silinemedi", { description: result.error })
      return
    }
    toast.success("Abonelik silindi")
    setDeleteOpen(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted/40">
      <ServiceLogo name={subscription.name} color={subscription.color} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{subscription.name}</p>
          <Badge variant="secondary" className="shrink-0">
            {subscription.category}
          </Badge>
        </div>
        <p className={cn("text-xs", URGENCY_CLASS[urgency])}>
          {formatDate(subscription.next_billing_date)} ·{" "}
          {relativeDays(subscription.next_billing_date)}
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold tabular-nums">
          {formatCurrency(subscription.price, subscription.currency)}
        </p>
        <p className="text-xs text-muted-foreground">
          {CYCLE_SUFFIX[subscription.billing_cycle]}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="Abonelik menüsü"
            />
          }
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Düzenle
          </DropdownMenuItem>
          {subscription.cancel_url ? (
            <DropdownMenuItem
              render={
                <a
                  href={subscription.cancel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ExternalLink className="size-4" />
              İptal sayfası
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" />
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Düzenleme */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aboneliği düzenle</DialogTitle>
            <DialogDescription>
              {subscription.name} bilgilerini güncelle.
            </DialogDescription>
          </DialogHeader>
          <SubscriptionForm
            mode="edit"
            subscription={subscription}
            defaultCurrency={defaultCurrency}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Silme onayı */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abonelik silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{subscription.name}&rdquo; kalıcı olarak silinecek. Bu işlem
              geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
