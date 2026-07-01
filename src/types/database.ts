/**
 * Supabase şema tipleri — ADIM 1'deki SQL şemasıyla birebir eşleşir.
 * (İleride `supabase gen types typescript` ile otomatik de üretilebilir.)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          default_currency: string
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          price: number
          currency: string
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          category: string
          first_billing_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          logo_url: string | null
          color: string | null
          cancel_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          price: number
          currency?: string
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          category?: string
          first_billing_date: string
          status?: Database["public"]["Enums"]["subscription_status"]
          logo_url?: string | null
          color?: string | null
          cancel_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          price?: number
          currency?: string
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          category?: string
          first_billing_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          logo_url?: string | null
          color?: string | null
          cancel_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      subscriptions_view: {
        Row: {
          id: string
          user_id: string
          name: string
          price: number
          currency: string
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          category: string
          first_billing_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          logo_url: string | null
          color: string | null
          cancel_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
          next_billing_date: string
          monthly_price: number
          yearly_price: number
        }
        Relationships: []
      }
    }
    Functions: {
      calc_next_billing_date: {
        Args: {
          p_first: string
          p_cycle: Database["public"]["Enums"]["billing_cycle"]
        }
        Returns: string
      }
    }
    Enums: {
      billing_cycle: "weekly" | "monthly" | "quarterly" | "yearly"
      subscription_status: "active" | "paused" | "cancelled"
    }
    CompositeTypes: Record<string, never>
  }
}
