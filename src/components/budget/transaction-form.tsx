"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { tr } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BILLING_CYCLES,
  CURRENCIES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { toISODate } from "@/lib/subscriptions"
import {
  createRecurringRule,
  createTransaction,
  updateRecurringRule,
} from "@/lib/actions/transactions"
import {
  transactionFormSchema,
  type RecurringRuleActionInput,
  type TransactionActionInput,
  type TransactionFormValues,
} from "@/lib/validations/transaction"
import type { RecurringRule } from "@/types"

/** ISO `yyyy-mm-dd` metnini yerel Date'e çevirir (saat dilimi kaymasını önler). */
function parseISODate(value?: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

type TransactionFormProps = {
  mode: "create" | "edit"
  recurringRule?: RecurringRule
  defaultCurrency?: string
  onSuccess: () => void
}

export function TransactionForm({
  mode,
  recurringRule,
  defaultCurrency = "TRY",
  onSuccess,
}: TransactionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: recurringRule
      ? {
          type: recurringRule.type,
          is_recurring: true,
          name: recurringRule.name,
          amount: String(recurringRule.amount),
          currency: recurringRule.currency,
          category: recurringRule.category,
          occurred_on: "",
          billing_cycle: recurringRule.billing_cycle,
          start_date: recurringRule.start_date,
          notes: recurringRule.notes ?? "",
        }
      : {
          type: "expense",
          is_recurring: false,
          name: "",
          amount: "",
          currency: defaultCurrency,
          category: "",
          occurred_on: toISODate(new Date()),
          billing_cycle: "monthly",
          start_date: toISODate(new Date()),
          notes: "",
        },
  })

  const type = form.watch("type")
  const isRecurring = form.watch("is_recurring")
  const dateField: "start_date" | "occurred_on" = isRecurring
    ? "start_date"
    : "occurred_on"
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  function pickType(next: "income" | "expense") {
    form.setValue("type", next, { shouldValidate: true })
    form.setValue("category", "")
  }

  async function onSubmit(values: TransactionFormValues) {
    setLoading(true)

    let result
    if (values.is_recurring) {
      const payload: RecurringRuleActionInput = {
        type: values.type,
        name: (values.name ?? "").trim(),
        amount: Number(values.amount),
        currency: values.currency,
        category: values.category,
        billing_cycle: values.billing_cycle!,
        start_date: values.start_date!,
        notes: values.notes?.trim() || null,
      }
      result =
        mode === "edit" && recurringRule
          ? await updateRecurringRule(recurringRule.id, payload)
          : await createRecurringRule(payload)
    } else {
      const payload: TransactionActionInput = {
        type: values.type,
        amount: Number(values.amount),
        currency: values.currency,
        category: values.category,
        occurred_on: values.occurred_on!,
        notes: values.notes?.trim() || null,
      }
      result = await createTransaction(payload)
    }

    setLoading(false)

    if (!result.success) {
      toast.error("Kaydedilemedi", { description: result.error })
      return
    }
    toast.success(
      values.is_recurring
        ? mode === "edit"
          ? "Kural güncellendi"
          : "Tekrarlı kural eklendi"
        : "Kayıt eklendi"
    )
    onSuccess()
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => pickType("income")}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              type === "income"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "hover:bg-muted"
            )}
          >
            Gelir
          </button>
          <button
            type="button"
            onClick={() => pickType("expense")}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              type === "expense"
                ? "border-destructive bg-destructive/10 text-destructive"
                : "hover:bg-muted"
            )}
          >
            Gider
          </button>
        </div>

        {mode === "create" && (
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <div className="space-y-0.5">
              <Label htmlFor="is_recurring">Tekrarlı mı?</Label>
              <p className="text-xs text-muted-foreground">
                Maaş, kira gibi düzenli tekrar eden bir kalemse aç.
              </p>
            </div>
            <Switch
              id="is_recurring"
              checked={isRecurring}
              onCheckedChange={(checked) =>
                form.setValue("is_recurring", checked, { shouldValidate: true })
              }
            />
          </div>
        )}

        {isRecurring && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad</FormLabel>
                <FormControl>
                  <Input placeholder="Maaş, Kira…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tutar</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Para birimi</FormLabel>
                <Select
                  items={CURRENCIES}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seç" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  items={categories.map((c) => ({ value: c, label: c }))}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seç" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {isRecurring && (
            <FormField
              control={form.control}
              name="billing_cycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Döngü</FormLabel>
                  <Select
                    items={BILLING_CYCLES}
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seç" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BILLING_CYCLES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name={dateField}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{isRecurring ? "Başlangıç tarihi" : "Tarih"}</FormLabel>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    />
                  }
                >
                  <CalendarIcon className="size-4" />
                  {field.value ? formatDate(field.value) : "Tarih seç"}
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={parseISODate(field.value)}
                    onSelect={(date) => {
                      field.onChange(date ? toISODate(date) : "")
                      setDateOpen(false)
                    }}
                    locale={tr}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Not <span className="text-muted-foreground">(isteğe bağlı)</span>
              </FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {mode === "edit" ? "Değişiklikleri kaydet" : "Ekle"}
        </Button>
      </form>
    </Form>
  )
}
