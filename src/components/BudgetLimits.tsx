"use client";

import { CATEGORIES, CATEGORY_COLORS, formatCurrency } from "@/lib/constants";

interface BudgetLimitsProps {
  categorySpending: Record<string, number>;
  categoryBudgets: Record<string, number>;
  setCategoryBudgets: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export default function BudgetLimits({
  categorySpending,
  categoryBudgets,
  setCategoryBudgets,
}: BudgetLimitsProps) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-lg font-semibold text-white">Budget Limits</h2>
      <div className="glass-card glass-card-glow p-6 transition-all duration-300">
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORIES.filter((cat) => cat !== "Income").map((cat) => {
            const spent = categorySpending[cat] ?? 0;
            const limit = categoryBudgets[cat] ?? 0;
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const over = limit > 0 && spent > limit;
            return (
              <div key={cat} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-300">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${
                        over ? "text-red-400" : "text-zinc-400"
                      }`}
                    >
                      {formatCurrency(spent)}
                      {limit > 0 && ` / ${formatCurrency(limit)}`}
                    </span>
                    <span className="text-zinc-500">$</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={categoryBudgets[cat] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategoryBudgets((prev) => ({
                          ...prev,
                          [cat]: val === "" ? 0 : Number(val),
                        }));
                      }}
                      placeholder="limit"
                      className="w-16 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-right text-xs text-white outline-none focus:border-neon-cyan/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: limit > 0 ? `${pct}%` : "0%",
                      backgroundColor: over
                        ? "#ef4444"
                        : pct > 75
                        ? "#eab308"
                        : CATEGORY_COLORS[cat],
                    }}
                  />
                </div>
                {over && (
                  <span className="text-xs text-red-400">
                    Over budget by {formatCurrency(spent - limit)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
