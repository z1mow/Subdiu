import { AlertTriangle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
  spent: number
  limit: number | null
  currency: string
}

export function BudgetCard({ spent, limit, currency }: Props) {
  if (limit === null) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            Aylık bütçe
          </p>
          <p className="text-sm text-muted-foreground">
            Ayarlar&apos;dan bir bütçe limiti belirle.
          </p>
        </CardContent>
      </Card>
    )
  }

  const over = spent > limit
  const pct = limit > 0 ? Math.min(spent / limit, 1) * 100 : 100

  return (
    <Card>
      <CardContent className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Aylık bütçe
          </p>
          {over && <AlertTriangle className="size-4 text-destructive" />}
        </div>
        <p className="truncate text-2xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(spent, currency)}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            / {formatCurrency(limit, currency)}
          </span>
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              over ? "bg-destructive" : "bg-primary"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        {over && (
          <p className="text-xs text-destructive">
            Bütçeni {formatCurrency(spent - limit, currency)} aştın.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
