"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"
import { mapAuthError } from "@/lib/supabase/errors"
import { signupSchema, type SignupValues } from "@/lib/validations/auth"

export function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  })

  async function onSubmit(values: SignupValues) {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setLoading(false)
      toast.error("Kayıt başarısız", { description: mapAuthError(error.message) })
      return
    }

    // E-posta doğrulama açıkken zaten kayıtlı e-posta için Supabase boş "identities" döndürür.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setLoading(false)
      toast.error("Bu e-posta zaten kayıtlı", {
        description: "Giriş yapmayı dene.",
      })
      return
    }

    if (data.session) {
      // E-posta doğrulaması kapalı → anında oturum açıldı.
      toast.success("Hesabın oluşturuldu 🎉")
      router.push("/dashboard")
      router.refresh()
      return
    }

    // E-posta doğrulaması açık → linki bekle.
    toast.success("Neredeyse tamam!", {
      description: "E-postana gönderdiğimiz doğrulama bağlantısına tıkla.",
    })
    router.push("/login")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  placeholder="Adın Soyadın"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="ornek@mail.com"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şifre</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="En az 8 karakter"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Hesap oluştur
        </Button>
      </form>
    </Form>
  )
}
