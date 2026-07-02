import { z } from "zod"

const CYCLES = ["weekly", "monthly", "quarterly", "yearly"] as const
const TYPES = ["income", "expense"] as const

/**
 * İstemci form şeması — hem tek seferlik hem tekrarlı girişi tek formda karşılar.
 * `is_recurring` false ise `occurred_on`, true ise `name`+`start_date`+`billing_cycle` zorunlu olur.
 */
export const transactionFormSchema = z
  .object({
    type: z.enum(TYPES),
    is_recurring: z.boolean(),
    name: z.string().max(120).optional(),
    amount: z
      .string()
      .min(1, { message: "Tutar gerekli." })
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
        message: "Geçerli bir tutar gir.",
      }),
    currency: z.string().min(1, { message: "Para birimi seç." }),
    category: z.string().min(1, { message: "Kategori seç." }).max(60),
    occurred_on: z.string().optional(),
    billing_cycle: z.enum(CYCLES).optional(),
    start_date: z.string().optional(),
    notes: z.string().max(500, { message: "En fazla 500 karakter." }).optional(),
  })
  .refine((v) => v.is_recurring || v.occurred_on, {
    message: "Tarih seç.",
    path: ["occurred_on"],
  })
  .refine((v) => !v.is_recurring || (v.name && v.name.trim().length > 0), {
    message: "Ad gerekli.",
    path: ["name"],
  })
  .refine((v) => !v.is_recurring || v.start_date, {
    message: "Başlangıç tarihi seç.",
    path: ["start_date"],
  })
  .refine((v) => !v.is_recurring || v.billing_cycle, {
    message: "Döngü seç.",
    path: ["billing_cycle"],
  })

export type TransactionFormValues = z.infer<typeof transactionFormSchema>

/** Sunucu şeması — tek seferlik defter kaydı (`transactions` tablosu). */
export const transactionActionSchema = z.object({
  type: z.enum(TYPES),
  amount: z.number().min(0).max(1_000_000),
  currency: z.string().min(1).max(8),
  category: z.string().min(1).max(60),
  occurred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).nullable().optional(),
})

export type TransactionActionInput = z.infer<typeof transactionActionSchema>

/** Sunucu şeması — tekrarlı gelir/gider kuralı (`recurring_rules` tablosu). */
export const recurringRuleActionSchema = z.object({
  type: z.enum(TYPES),
  name: z.string().min(1).max(120),
  amount: z.number().min(0).max(1_000_000),
  currency: z.string().min(1).max(8),
  category: z.string().min(1).max(60),
  billing_cycle: z.enum(CYCLES),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).nullable().optional(),
})

export type RecurringRuleActionInput = z.infer<typeof recurringRuleActionSchema>
