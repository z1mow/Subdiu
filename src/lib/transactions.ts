import { convertToBase } from "@/lib/subscriptions"
import type { Rates } from "@/lib/exchange"
import type { Transaction } from "@/types"

export type MonthlyIncomeExpense = {
  income: number
  expense: number
  net: number
  /** Tüm kayıtlar temel para birimine çevrilebildi mi (false → bazı kurlar eksik). */
  complete: boolean
}

/** Verilen ay için (varsayılan: içinde bulunulan ay) gelir/gider/net toplamını temel para biriminde döndürür. */
export function monthlyIncomeExpense(
  transactions: Transaction[],
  rates: Rates | null,
  monthDate: Date = new Date()
): MonthlyIncomeExpense {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()

  let income = 0
  let expense = 0
  let complete = true

  for (const t of transactions) {
    const d = new Date(t.occurred_on)
    if (d.getFullYear() !== year || d.getMonth() !== month) continue

    const amount = convertToBase(t.amount, t.currency, rates)
    if (amount === null) {
      complete = false
      continue
    }
    if (t.type === "income") income += amount
    else expense += amount
  }

  return {
    income: Math.round(income * 100) / 100,
    expense: Math.round(expense * 100) / 100,
    net: Math.round((income - expense) * 100) / 100,
    complete,
  }
}

/** İşlemleri tarihe göre en yeniden eskiye sıralayıp ilk n tanesini döndürür. */
export function recentTransactions(
  transactions: Transaction[],
  limit = 5
): Transaction[] {
  return transactions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.occurred_on).getTime() - new Date(a.occurred_on).getTime()
    )
    .slice(0, limit)
}
