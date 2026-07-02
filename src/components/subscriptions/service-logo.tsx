"use client"

import { useState } from "react"

import { colorFromString, iconSlugFor } from "@/lib/constants"
import { cn } from "@/lib/utils"

type ServiceLogoProps = {
  name: string
  color?: string | null
  className?: string
}

/**
 * Servisin marka rengiyle logosu. Bilinen servislerde simple-icons marka ikonu,
 * aksi halde (veya ikon yüklenemezse) baş harfi gösterir.
 */
export function ServiceLogo({ name, color, className }: ServiceLogoProps) {
  const [iconFailed, setIconFailed] = useState(false)

  const background = color || colorFromString(name)
  const slug = iconSlugFor(name)
  const initial = name.trim().charAt(0).toUpperCase() || "?"
  const showIcon = slug && !iconFailed

  return (
    <div
      aria-hidden
      style={{ backgroundColor: background }}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-sm",
        className
      )}
    >
      {showIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://cdn.simpleicons.org/${slug}/white`}
          alt=""
          loading="lazy"
          className="h-1/2 w-1/2"
          onError={() => setIconFailed(true)}
        />
      ) : (
        initial
      )}
    </div>
  )
}
