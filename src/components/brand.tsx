import { CreditCard } from "lucide-react"

import { cn } from "@/lib/utils"

type BrandProps = {
  className?: string
  showText?: boolean
}

/** Subdiu logo + kelime markası. Navbar, auth ekranları vb. her yerde kullanılır. */
export function Brand({ className, showText = true }: BrandProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <CreditCard className="size-4" />
      </div>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">Subdiu</span>
      )}
    </div>
  )
}
