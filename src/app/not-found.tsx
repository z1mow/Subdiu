import Link from "next/link"

import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <Brand />
      <div className="space-y-1">
        <p className="text-5xl font-semibold tracking-tight">404</p>
        <p className="text-muted-foreground">Aradığın sayfa bulunamadı.</p>
      </div>
      <Button render={<Link href="/dashboard" />}>Panele dön</Button>
    </div>
  )
}
