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
  CATEGORIES,
  CURRENCIES,
  POPULAR_SERVICES,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { toISODate } from "@/lib/subscriptions"
import {
  createSubscription,
  updateSubscription,
} from "@/lib/actions/subscriptions"
import {
  subscriptionFormSchema,
  type SubscriptionFormValues,
} from "@/lib/validations/subscription"
import type { SubscriptionActionInput } from "@/lib/validations/subscription"
import type { SubscriptionView } from "@/types"

/** ISO `yyyy-mm-dd` metnini yerel Date'e çevirir (saat dilimi kaymasını önler). */
function parseISODate(value: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

type SubscriptionFormProps = {
  mode: "create" | "edit"
  subscription?: SubscriptionView
  defaultCurrency?: string
  onSuccess: () => void
}

export function SubscriptionForm({
  mode,
  subscription,
  defaultCurrency = "TRY",
  onSuccess,
}: SubscriptionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: subscription
      ? {
          name: subscription.name,
          price: String(subscription.price),
          currency: subscription.currency,
          billing_cycle: subscription.billing_cycle,
          category: subscription.category,
          first_billing_date: subscription.first_billing_date,
          cancel_url: subscription.cancel_url ?? "",
          notes: subscription.notes ?? "",
          color: subscription.color ?? "",
        }
      : {
          name: "",
          price: "",
          currency: defaultCurrency,
          billing_cycle: "monthly",
          category: "",
          first_billing_date: toISODate(new Date()),
          cancel_url: "",
          notes: "",
          color: "",
        },
  })

  function pickService(service: (typeof POPULAR_SERVICES)[number]) {
    form.setValue("name", service.name, { shouldValidate: true })
    form.setValue("category", service.category, { shouldValidate: true })
    form.setValue("color", service.color)
  }

  async function onSubmit(values: SubscriptionFormValues) {
    setLoading(true)
    const payload: SubscriptionActionInput = {
      name: values.name.trim(),
      price: Number(values.price),
      currency: values.currency,
      billing_cycle: values.billing_cycle,
      category: values.category,
      first_billing_date: values.first_billing_date,
      cancel_url: values.cancel_url?.trim() || null,
      notes: values.notes?.trim() || null,
      color: values.color || null,
    }

    const result =
      mode === "edit" && subscription
        ? await updateSubscription(subscription.id, payload)
        : await createSubscription(payload)

    setLoading(false)

    if (!result.success) {
      toast.error(mode === "edit" ? "Güncellenemedi" : "Eklenemedi", {
        description: result.error,
      })
      return
    }

    toast.success(
      mode === "edit" ? "Abonelik güncellendi" : "Abonelik eklendi"
    )
    onSuccess()
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {mode === "create" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Hızlı ekle
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SERVICES.map((service) => (
                <button
                  key={service.name}
                  type="button"
                  onClick={() => pickService(service)}
                  className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: service.color }}
                  />
                  {service.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Servis adı</FormLabel>
              <FormControl>
                <Input placeholder="Netflix, Spotify…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="price"
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
            name="billing_cycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ödeme döngüsü</FormLabel>
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
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  items={CATEGORIES.map((c) => ({ value: c, label: c }))}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seç" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
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
        </div>

        <FormField
          control={form.control}
          name="first_billing_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>İlk ödeme tarihi</FormLabel>
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
          name="cancel_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                İptal bağlantısı{" "}
                <span className="text-muted-foreground">(isteğe bağlı)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  inputMode="url"
                  placeholder="https://…"
                  {...field}
                />
              </FormControl>
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
                <Textarea
                  rows={2}
                  placeholder="Aile planı, 4 kişilik…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {mode === "edit" ? "Değişiklikleri kaydet" : "Abonelik ekle"}
        </Button>
      </form>
    </Form>
  )
}
