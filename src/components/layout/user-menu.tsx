"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { getInitials } from "@/lib/format"

type UserMenuProps = {
  email: string
  name: string | null
  avatarUrl: string | null
}

export function UserMenu({ email, name, avatarUrl }: UserMenuProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Hesap menüsü"
          />
        }
      >
        <Avatar className="size-8">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name ?? email} />
          ) : null}
          <AvatarFallback>{getInitials(name ?? email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="truncate text-sm font-medium">
            {name ?? "Hesabım"}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {email}
          </span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings className="size-4" />
          Ayarlar
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Çıkış yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
