"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { formatCurrency } from "@/lib/format"

type CategoryDatum = {
  category: string
  value: number
  color: string
}

export function CategoryChart({
  data,
  currency,
}: {
  data: CategoryDatum[]
  currency: string
}) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Gösterilecek veri yok.
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.category} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              content={({ active, payload }) =>
                active && payload && payload.length ? (
                  <div className="rounded-lg border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
                    <span className="font-medium">{payload[0]!.name}</span>
                    {": "}
                    {formatCurrency(Number(payload[0]!.value), currency)}
                  </div>
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full space-y-2.5">
        {data.map((d) => (
          <li key={d.category} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="flex-1 truncate">{d.category}</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(d.value, currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
