"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Provider } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function OAuthButtons({ next = "/dashboard" }: { next?: string }) {
  const [loading, setLoading] = useState<Provider | null>(null)

  async function signInWith(provider: Provider) {
    try {
      setLoading(provider)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (error) throw error
      // Başarılıysa tarayıcı sağlayıcıya yönlenir; state'i bırakmıyoruz.
    } catch (err) {
      setLoading(null)
      toast.error("Bu yöntemle giriş şu an kullanılamıyor", {
        description:
          err instanceof Error
            ? err.message
            : "Sağlayıcı Supabase panelinde etkinleştirilmemiş olabilir.",
      })
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        disabled={loading !== null}
        onClick={() => signInWith("google")}
      >
        {loading === "google" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={loading !== null}
        onClick={() => signInWith("apple")}
      >
        {loading === "apple" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <AppleIcon className="size-4" />
        )}
        Apple
      </Button>
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.03-2.53 2.07-3.75 2.16-3.81-1.18-1.72-3.02-1.96-3.67-1.98-1.56-.16-3.05.92-3.84.92-.79 0-2.01-.9-3.31-.87-1.7.03-3.27 1-4.14 2.53-1.77 3.07-.45 7.6 1.27 10.09.84 1.22 1.84 2.58 3.15 2.53 1.27-.05 1.74-.82 3.28-.82 1.53 0 1.96.82 3.3.79 1.36-.02 2.23-1.24 3.06-2.46.96-1.41 1.36-2.78 1.38-2.85-.03-.01-2.65-1.02-2.68-4.04ZM14.54 4.9c.7-.85 1.17-2.03 1.04-3.2-1.01.04-2.23.67-2.95 1.52-.65.75-1.21 1.95-1.06 3.1 1.12.09 2.27-.57 2.97-1.42Z" />
    </svg>
  )
}
