import { z } from "zod"

const CYCLES = ["weekly", "monthly", "quarterly", "yearly"] as const

/** İstemci form şeması — fiyat metin girdisi olarak alınır. */
export const subscriptionFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Ad gerekli." })
    .max(120, { message: "En fazla 120 karakter." }),
  price: z
    .string()
    .min(1, { message: "Tutar gerekli." })
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
      message: "Geçerli bir tutar gir.",
    }),
  currency: z.string().min(1, { message: "Para birimi seç." }),
  billing_cycle: z.enum(CYCLES),
  category: z
    .string()
    .min(1, { message: "Kategori seç." })
    .max(60, { message: "En fazla 60 karakter." }),
  first_billing_date: z.string().min(1, { message: "Tarih seç." }),
  cancel_url: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/.+/i.test(v), {
      message: "Geçerli bir bağlantı gir (http…).",
    })
    .optional(),
  notes: z.string().max(500, { message: "En fazla 500 karakter." }).optional(),
  color: z.string().optional(),
})

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>

/** Sunucu (server action) şeması — fiyat sayı, alanlar temizlenmiş. */
export const subscriptionActionSchema = z.object({
  name: z.string().min(1).max(120),
  price: z.number().min(0).max(1_000_000),
  currency: z.string().min(1).max(8),
  billing_cycle: z.enum(CYCLES),
  category: z.string().min(1).max(60),
  first_billing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cancel_url: z.string().max(2048).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  color: z.string().max(32).nullable().optional(),
})

export type SubscriptionActionInput = z.infer<typeof subscriptionActionSchema>
