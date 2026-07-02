"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import {
  recurringRuleActionSchema,
  transactionActionSchema,
  type RecurringRuleActionInput,
  type TransactionActionInput,
} from "@/lib/validations/transaction"
import type { SubscriptionStatus } from "@/types"

const STATUSES: SubscriptionStatus[] = ["active", "paused", "cancelled"]

export type ActionResult =
  | { success: true }
  | { success: false; error: string }

function revalidateAll() {
  revalidatePath("/dashboard")
}

/** Tek seferlik gelir/gider kaydı ekler. */
export async function createTransaction(
  input: TransactionActionInput
): Promise<ActionResult> {
  const parsed = transactionActionSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Form bilgileri geçersiz." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Oturum bulunamadı." }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    ...parsed.data,
    notes: parsed.data.notes || null,
  })

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}

/** Tek seferlik gelir/gider kaydını günceller. */
export async function updateTransaction(
  id: string,
  input: TransactionActionInput
): Promise<ActionResult> {
  const parsed = transactionActionSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Form bilgileri geçersiz." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Oturum bulunamadı." }

  const { error } = await supabase
    .from("transactions")
    .update({ ...parsed.data, notes: parsed.data.notes || null })
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}

/** Tek seferlik gelir/gider kaydını siler. */
export async function deleteTransaction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Oturum bulunamadı." }

  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}

/**
 * Tekrarlı gelir/gider kuralı (maaş, kira…) ekler ve hemen ardından o kullanıcı
 * için geçmişe dönük üretimi tetikler — başlangıç tarihi geçmişteyse, o tarihten
 * bugüne kadarki dönemler beklemeden defterde belirir.
 */
export async function createRecurringRule(
  input: RecurringRuleActionInput
): Promise<ActionResult> {
  const parsed = recurringRuleActionSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Form bilgileri geçersiz." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Oturum bulunamadı." }

  const { error } = await supabase.from("recurring_rules").insert({
    user_id: user.id,
    ...parsed.data,
    notes: parsed.data.notes || null,
  })

  if (error) return { success: false, error: error.message }

  await supabase.rpc("generate_due_transactions_for_current_user")

  revalidateAll()
  return { success: true }
}

/** Tekrarlı gelir/gider kuralını günceller. */
export async function updateRecurringRule(
  id: string,
  input: RecurringRuleActionInput
): Promise<ActionResult> {
  const parsed = recurringRuleActionSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Form bilgileri geçersiz." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Oturum bulunamadı." }

  const { error } = await supabase
    .from("recurring_rules")
    .update({ ...parsed.data, notes: parsed.data.notes || null })
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}

/** Tekrarlı kuralın durumunu değiştirir (aktif / duraklat / iptal). */
export async function setRecurringRuleStatus(
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
    .from("recurring_rules")
    .update({ status })
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  if (status === "active") {
    await supabase.rpc("generate_due_transactions_for_current_user")
  }

  revalidateAll()
  return { success: true }
}

/** Tekrarlı gelir/gider kuralını siler (geçmiş defter kayıtları korunur, bağlantısı null'lanır). */
export async function deleteRecurringRule(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Oturum bulunamadı." }

  const { error } = await supabase
    .from("recurring_rules")
    .delete()
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true }
}
