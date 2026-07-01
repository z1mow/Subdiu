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
