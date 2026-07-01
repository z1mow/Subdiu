import type { Metadata } from "next"
import Link from "next/link"

import { Brand } from "@/components/brand"
import { FadeIn } from "@/components/motion/fade-in"
import { LoginForm } from "@/components/auth/login-form"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Giriş yap",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams
  const redirectTo = redirect?.startsWith("/") ? redirect : "/dashboard"

  return (
    <FadeIn>
      <div className="mb-8 flex justify-center">
        <Brand />
      </div>

      <Card className="border-border/60 shadow-xl shadow-black/5">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Tekrar hoş geldin</CardTitle>
          <CardDescription>
            Aboneliklerini görmek için giriş yap.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <OAuthButtons next={redirectTo} />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">veya e-posta ile</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <LoginForm redirectTo={redirectTo} />
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Hesabın yok mu?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Kayıt ol
        </Link>
      </p>
    </FadeIn>
  )
}
