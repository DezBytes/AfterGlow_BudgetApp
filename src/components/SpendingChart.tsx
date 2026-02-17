"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { formatCurrency } from "@/lib/constants";

interface ChartItem {
  category: string;
  total: number;
  fill: string;
  pct: number;
}

interface SpendingChartProps {
  chartData: ChartItem[];
}

export default function SpendingChart({ chartData }: SpendingChartProps) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Spending by Category
      </h2>
      <div className="glass-card glass-card-glow overflow-hidden p-6 transition-all duration-300">
        <div className="h-72 w-full min-w-0 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 24, right: 16, left: 0, bottom: 8 }}
            >
              <XAxis
                dataKey="category"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(v) => {
                  const abbr: Record<string, string> = {
                    Utilities: "Utils",
                    Groceries: "Groc",
                    Entertainment: "Ent",
                    Shopping: "Shop",
                  };
                  return abbr[v] || v;
                }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                domain={[0, "auto"]}
                allowDecimals={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickFormatter={(v) => `$${Math.round(v).toLocaleString()}`}
                width={55}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(26, 8, 48, 0.95)",
                  border: "1px solid rgba(0, 245, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#e8e4f0",
                }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(
                  value: number | undefined,
                  _name: string | undefined,
                  entry: { payload?: { pct?: number } }
                ) => [
                  `${formatCurrency(value ?? 0)} (${
                    entry.payload?.pct ?? 0
                  }%)`,
                  "Spent",
                ]}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="total"
                  position="top"
                  fill="#94a3b8"
                  fontSize={10}
                  formatter={(v: unknown) =>
                    typeof v === "number" && v > 0 ? `$${Math.round(v)}` : ""
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
