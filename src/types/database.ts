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
      recurring_rules: {
        Row: {
          id: string
          user_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          name: string
          amount: number
          currency: string
          category: string
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          name: string
          amount: number
          currency?: string
          category?: string
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          start_date: string
          status?: Database["public"]["Enums"]["subscription_status"]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          name?: string
          amount?: number
          currency?: string
          category?: string
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          amount: number
          currency: string
          category: string
          occurred_on: string
          notes: string | null
          subscription_id: string | null
          recurring_rule_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          amount: number
          currency?: string
          category?: string
          occurred_on: string
          notes?: string | null
          subscription_id?: string | null
          recurring_rule_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          amount?: number
          currency?: string
          category?: string
          occurred_on?: string
          notes?: string | null
          subscription_id?: string | null
          recurring_rule_id?: string | null
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
      generate_due_transactions_for_current_user: {
        Args: Record<string, never>
        Returns: number
      }
    }
    Enums: {
      billing_cycle: "weekly" | "monthly" | "quarterly" | "yearly"
      subscription_status: "active" | "paused" | "cancelled"
      transaction_type: "income" | "expense"
    }
    CompositeTypes: Record<string, never>
  }
}
