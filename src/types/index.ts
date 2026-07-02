import type { Database } from "@/types/database"

/** Kolay erişim için tekrar dışa aktarılan uygulama tipleri. */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export type Subscription =
  Database["public"]["Tables"]["subscriptions"]["Row"]
export type SubscriptionInsert =
  Database["public"]["Tables"]["subscriptions"]["Insert"]
export type SubscriptionUpdate =
  Database["public"]["Tables"]["subscriptions"]["Update"]

/** next_billing_date + normalize edilmiş aylık/yıllık tutarları içeren zenginleştirilmiş satır. */
export type SubscriptionView =
  Database["public"]["Views"]["subscriptions_view"]["Row"]

export type BillingCycle = Database["public"]["Enums"]["billing_cycle"]
export type SubscriptionStatus =
  Database["public"]["Enums"]["subscription_status"]

export type TransactionType = Database["public"]["Enums"]["transaction_type"]

export type RecurringRule =
  Database["public"]["Tables"]["recurring_rules"]["Row"]
export type RecurringRuleInsert =
  Database["public"]["Tables"]["recurring_rules"]["Insert"]
export type RecurringRuleUpdate =
  Database["public"]["Tables"]["recurring_rules"]["Update"]

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"]
export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"]
export type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"]
