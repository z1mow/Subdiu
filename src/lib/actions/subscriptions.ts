"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import {
  subscriptionActionSchema,
  type SubscriptionActionInput,
} from "@/lib/validations/subscription"

export type ActionResult =
  | { success: true }
  | { success: false; error: string }

function revalidateAll() {
  revalidatePath("/dashboard")
  revalidatePath("/subscriptions")
}

/** Yeni abonelik ekler (user_id oturumdan alınır; RLS ile korunur). */
export async function createSubscription(
  input: SubscriptionActionInput
): Promise<ActionResult> {
  const parsed = subscriptionActionSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Form bilgileri geçersiz." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Oturum bulunamadı." }

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    ...parsed.data,
    cancel_url: parsed.data.cancel_url || null,
    notes: parsed.data.notes || null,
    color: parsed.data.color || null,
  })

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}

/** Mevcut aboneliği günceller. RLS yalnızca sahibinin güncellemesine izin verir. */
export async function updateSubscription(
  id: string,
  input: SubscriptionActionInput
): Promise<ActionResult> {
  const parsed = subscriptionActionSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Form bilgileri geçersiz." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Oturum bulunamadı." }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      ...parsed.data,
      cancel_url: parsed.data.cancel_url || null,
      notes: parsed.data.notes || null,
      color: parsed.data.color || null,
    })
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}

/** Aboneliği siler. RLS yalnızca sahibinin silmesine izin verir. */
export async function deleteSubscription(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Oturum bulunamadı." }

  const { error } = await supabase.from("subscriptions").delete().eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}
