"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import {
  subscriptionActionSchema,
  type SubscriptionActionInput,
} from "@/lib/validations/subscription"
import type { SubscriptionInsert, SubscriptionStatus } from "@/types"

const STATUSES: SubscriptionStatus[] = ["active", "paused", "cancelled"]
const MAX_IMPORT_ROWS = 500

const importRowSchema = subscriptionActionSchema.extend({
  status: z.enum(["active", "paused", "cancelled"]).optional(),
})

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

export type ImportResult =
  | { success: true; imported: number; skipped: number }
  | { success: false; error: string; imported: number; skipped: number }

/** CSV'den ayrıştırılmış satırları toplu olarak ekler; geçersiz satırlar atlanır. */
export async function importSubscriptions(
  rows: unknown[]
): Promise<ImportResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Oturum bulunamadı.", imported: 0, skipped: 0 }
  }

  const candidates = rows.slice(0, MAX_IMPORT_ROWS)
  const valid: SubscriptionInsert[] = []
  let skipped = 0

  for (const row of candidates) {
    const parsed = importRowSchema.safeParse(row)
    if (!parsed.success) {
      skipped++
      continue
    }
    valid.push({
      user_id: user.id,
      ...parsed.data,
      cancel_url: parsed.data.cancel_url || null,
      notes: parsed.data.notes || null,
      color: parsed.data.color || null,
    })
  }

  if (valid.length === 0) {
    return {
      success: false,
      error: "İçe aktarılacak geçerli satır bulunamadı.",
      imported: 0,
      skipped,
    }
  }

  const { error } = await supabase.from("subscriptions").insert(valid)
  if (error) {
    return { success: false, error: error.message, imported: 0, skipped }
  }

  revalidateAll()
  return { success: true, imported: valid.length, skipped }
}

/** Abonelik durumunu değiştirir (aktif / duraklat / iptal). RLS ile korunur. */
export async function setSubscriptionStatus(
  id: string,
  status: SubscriptionStatus
): Promise<ActionResult> {
  if (!STATUSES.includes(status)) {
    return { success: false, error: "Geçersiz durum." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Oturum bulunamadı." }

  const { error } = await supabase
    .from("subscriptions")
    .update({ status })
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}
