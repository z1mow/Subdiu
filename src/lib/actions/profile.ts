"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

export type ActionResult =
  | { success: true }
  | { success: false; error: string }

const profileSchema = z.object({
  default_currency: z.string().min(1).max(8),
  theme: z.enum(["light", "dark", "system"]),
  monthly_budget: z.number().min(0).max(10_000_000).nullable().optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

/** Kullanıcının varsayılan para birimi ve tema tercihini günceller. */
export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: "Geçersiz tercih." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Oturum bulunamadı." }

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/settings")
  revalidatePath("/dashboard")
  return { success: true }
}
