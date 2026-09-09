"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLang } from "@/components/providers/LanguageProvider";
import { formatDA, formatDate } from "@/lib/format";
import type { TrendPoint } from "@/types";

export function SalesChart({ data }: { data: TrendPoint[] }) {
  const { lang } = useLang();

  const chartData = data.map((p) => ({
    ...p,
    label: formatDate(p.date, lang, { day: "2-digit", month: "short" }),
  }));

  return (
    <div className="h-64 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8C7A5B" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#8C7A5B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#57534E" }}
            tickLine={false}
            axisLine={{ stroke: "#E0D8C8" }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#57534E" }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(v)}
          />
          <Tooltip
            formatter={(value: number) => [formatDA(value, lang), ""]}
            labelStyle={{ color: "#1A1A1A", fontWeight: 600 }}
            contentStyle={{
              background: "#FAFAFA",
              border: "1px solid #E0D8C8",
              borderRadius: 2,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#8C7A5B"
            strokeWidth={2}
            fill="url(#salesFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
