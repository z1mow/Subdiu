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
import { SubscriptionForm } from "@/components/subscriptions/subscription-form"

type Props = {
  defaultCurrency?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
}

export function AddSubscriptionButton({ defaultCurrency, variant }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={variant} />}>
        <Plus className="size-4" />
        Abonelik ekle
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni abonelik</DialogTitle>
          <DialogDescription>
            Hazır bir servis seç ya da bilgileri elle gir.
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm
          mode="create"
          defaultCurrency={defaultCurrency}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
