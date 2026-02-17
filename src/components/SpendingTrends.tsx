"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CATEGORIES, CATEGORY_COLORS, formatCurrency } from "@/lib/constants";

interface SpendingTrendsProps {
  trendsData: Record<string, unknown>[];
}

export default function SpendingTrends({ trendsData }: SpendingTrendsProps) {
  if (trendsData.length <= 1) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Spending Trends
      </h2>
      <div className="glass-card glass-card-glow overflow-hidden p-6 transition-all duration-300">
        <div className="h-72 w-full min-w-0 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendsData}
              margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
            >
              <XAxis
                dataKey="month"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickFormatter={(v) => `$${Math.round(v)}`}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(26, 8, 48, 0.95)",
                  border: "1px solid rgba(0, 245, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#e8e4f0",
                }}
                formatter={(value: number | undefined) => [
                  formatCurrency(value ?? 0),
                  undefined,
                ]}
              />
              <Legend />
              {CATEGORIES.map((cat) => (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={CATEGORY_COLORS[cat]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
