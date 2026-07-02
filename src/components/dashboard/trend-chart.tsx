"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

import { formatCurrency } from "@/lib/format"
import type { TrendPoint } from "@/lib/subscriptions"

export function TrendChart({
  data,
  currency,
}: {
  data: TrendPoint[]
  currency: string
}) {
  if (data.every((d) => d.total === 0)) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Gösterilecek veri yok.
      </p>
    )
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-border)", strokeDasharray: "3 3" }}
            content={({ active, payload }) =>
              active && payload && payload.length ? (
                <div className="rounded-lg border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
                  {formatCurrency(Number(payload[0]!.value), currency)}
                </div>
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#trendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
