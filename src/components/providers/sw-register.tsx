"use client"

import { useEffect } from "react"

/** Service worker'ı kaydeder (statik varlık önbellekleme + çevrimdışı yedek sayfa). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch(() => {})
  }, [])

  return null
}
