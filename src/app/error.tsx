"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="space-y-1">
        <p className="text-lg font-semibold">Bir şeyler ters gitti</p>
        <p className="text-sm text-muted-foreground">
          Sayfa yüklenirken bir sorun oluştu. Tekrar dener misin?
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">Hata kodu: {error.digest}</p>
        )}
      </div>
      <Button onClick={() => reset()}>Tekrar dene</Button>
    </div>
  )
}
