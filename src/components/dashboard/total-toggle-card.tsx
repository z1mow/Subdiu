"use client"

import { useState } from "react"
import { Wallet } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/format"

type View = "monthly" | "yearly"

type Props = {
  monthly: number
  yearly: number
  currency: string
  hint?: string
}

export function TotalToggleCard({ monthly, yearly, currency, hint }: Props) {
  const [view, setView] = useState<View>("monthly")
  const value = view === "monthly" ? monthly : yearly

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Harcama
            </p>
            <Tabs
              value={view}
              onValueChange={(v) => setView(v as View)}
            >
              <TabsList className="h-6 p-0.5">
                <TabsTrigger value="monthly" className="h-5 px-2 text-[11px]">
                  Aylık
                </TabsTrigger>
                <TabsTrigger value="yearly" className="h-5 px-2 text-[11px]">
                  Yıllık
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <p className="truncate text-3xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(value, currency)}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Wallet className="size-4" />
        </div>
      </CardContent>
    </Card>
  )
}
