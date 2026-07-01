import { ServiceLogo } from "@/components/subscriptions/service-logo"
import { formatCurrency, formatDate } from "@/lib/format"
import { relativeDays, urgencyOf, type Urgency } from "@/lib/subscriptions"
import { cn } from "@/lib/utils"
import type { SubscriptionView } from "@/types"

const URGENCY_DOT: Record<Urgency, string> = {
  overdue: "bg-destructive",
  soon: "bg-destructive",
  upcoming: "bg-amber-500",
  later: "bg-muted-foreground/40",
}

export function UpcomingPayments({ items }: { items: SubscriptionView[] }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Yaklaşan ödeme yok.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((s) => {
        const urgency = urgencyOf(s.next_billing_date)
        return (
          <li key={s.id} className="flex items-center gap-3">
            <span
              className={cn("size-2 shrink-0 rounded-full", URGENCY_DOT[urgency])}
            />
            <ServiceLogo
              name={s.name}
              color={s.color}
              className="size-8 rounded-lg text-xs"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(s.next_billing_date)} ·{" "}
                {relativeDays(s.next_billing_date)}
              </p>
            </div>
            <span className="text-sm font-medium tabular-nums">
              {formatCurrency(s.price, s.currency)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
