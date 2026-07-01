import type { Metadata } from "next"
import Link from "next/link"

import { Brand } from "@/components/brand"
import { FadeIn } from "@/components/motion/fade-in"
import { SignupForm } from "@/components/auth/signup-form"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Kayıt ol",
}

export default function SignupPage() {
  return (
    <FadeIn>
      <div className="mb-8 flex justify-center">
        <Brand />
      </div>

      <Card className="border-border/60 shadow-xl shadow-black/5">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Hesap oluştur</CardTitle>
          <CardDescription>
            Aboneliklerini takip etmeye ücretsiz başla.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <OAuthButtons />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">veya e-posta ile</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <SignupForm />
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Giriş yap
        </Link>
      </p>
    </FadeIn>
  )
}
