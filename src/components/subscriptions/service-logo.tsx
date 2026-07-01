import { colorFromString } from "@/lib/constants"
import { cn } from "@/lib/utils"

type ServiceLogoProps = {
  name: string
  color?: string | null
  className?: string
}

/** Servisin marka rengiyle baş harfini gösteren kare "logo". */
export function ServiceLogo({ name, color, className }: ServiceLogoProps) {
  const background = color || colorFromString(name)
  const initial = name.trim().charAt(0).toUpperCase() || "?"

  return (
    <div
      aria-hidden
      style={{ backgroundColor: background }}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-sm",
        className
      )}
    >
      {initial}
    </div>
  )
}
