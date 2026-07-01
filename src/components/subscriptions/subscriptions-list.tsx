import { CreditCard } from "lucide-react"

import { AddSubscriptionButton } from "@/components/subscriptions/add-subscription-button"
import { SubscriptionCard } from "@/components/subscriptions/subscription-card"
import type { SubscriptionView } from "@/types"

type Props = {
  subscriptions: SubscriptionView[]
  defaultCurrency?: string
}

export function SubscriptionsList({ subscriptions, defaultCurrency }: Props) {
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
    <div className="grid gap-3">
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          defaultCurrency={defaultCurrency}
        />
      ))}
    </div>
  )
}
