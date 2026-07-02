"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TransactionForm } from "@/components/budget/transaction-form"

type Props = {
  defaultCurrency?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
}

export function AddTransactionButton({ defaultCurrency, variant }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={variant} />}>
        <Plus className="size-4" />
        Gelir / Gider ekle
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni kayıt</DialogTitle>
          <DialogDescription>
            Tek seferlik bir kayıt gir ya da tekrarlı bir kural oluştur.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          mode="create"
          defaultCurrency={defaultCurrency}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
