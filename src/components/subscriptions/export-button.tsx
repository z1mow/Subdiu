"use client"

import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { subscriptionsToCSV } from "@/lib/csv"
import { toISODate } from "@/lib/subscriptions"
import type { SubscriptionView } from "@/types"

export function ExportButton({
  subscriptions,
}: {
  subscriptions: SubscriptionView[]
}) {
  function handleExport() {
    const csv = subscriptionsToCSV(subscriptions)
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `subdiu-abonelikler-${toISODate(new Date())}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={subscriptions.length === 0}
    >
      <Download className="size-4" />
      Dışa aktar
    </Button>
  )
}
