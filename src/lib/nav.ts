import { LayoutDashboard, CreditCard, Settings, type LucideIcon } from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

/** Kenar çubuğu ve mobil menüde kullanılan ana navigasyon. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/subscriptions", label: "Abonelikler", icon: CreditCard },
  { href: "/settings", label: "Ayarlar", icon: Settings },
]
