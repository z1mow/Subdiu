"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

/** Oturumu kapatır ve giriş sayfasına yönlendirir. */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
