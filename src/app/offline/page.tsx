"use client"

import { WifiOff } from "lucide-react"

import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <Brand />
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <WifiOff className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">İnternet bağlantısı yok</h1>
        <p className="text-sm text-muted-foreground">
          Bağlantın geri geldiğinde tekrar dene.
        </p>
      </div>
      <Button onClick={() => window.location.reload()}>Tekrar dene</Button>
    </div>
  )
}
