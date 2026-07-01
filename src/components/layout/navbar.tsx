import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserMenu } from "@/components/layout/user-menu"

type NavbarProps = {
  email: string
  name: string | null
  avatarUrl: string | null
}

/** Üst çubuk: mobil menü tetikleyici + tema değiştirici + hesap menüsü. */
export function Navbar({ email, name, avatarUrl }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 lg:px-8">
      <MobileNav />
      <div className="flex-1" />
      <ThemeToggle />
      <UserMenu email={email} name={name} avatarUrl={avatarUrl} />
    </header>
  )
}
