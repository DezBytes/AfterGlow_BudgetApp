"use client";

import { formatCurrency } from "@/lib/constants";
import CurrencyInput from "@/components/CurrencyInput";

interface SummaryCardsProps {
  monthlySpent: number;
  monthlyBudget: string;
  setMonthlyBudget: (v: string) => void;
  budgetRemaining: number;
  budgetUsedPct: number;
  startingBalance: string;
  setStartingBalance: (v: string) => void;
  totalSavings: string;
  setTotalSavings: (v: string) => void;
}

const inputBase =
  "ml-0.5 min-w-[4rem] max-w-full border-0 bg-transparent p-0 font-inherit text-inherit outline-none placeholder:text-white/40 focus:ring-0";

export default function SummaryCards({
  monthlySpent,
  monthlyBudget,
  setMonthlyBudget,
  budgetRemaining,
  budgetUsedPct,
  startingBalance,
  setStartingBalance,
  totalSavings,
  setTotalSavings,
}: SummaryCardsProps) {
  return (
    <section className="mb-12 grid gap-6 grid-cols-2 lg:grid-cols-4">
      <div className="glass-card glass-card-glow transition-all duration-300">
        <div className="p-6">
          <p className="mb-2 text-sm font-medium text-zinc-400">
            Spent This Month
          </p>
          <p className="text-2xl font-bold text-neon-cyan sm:text-3xl">
            {formatCurrency(monthlySpent)}
          </p>
        </div>
      </div>
      <div className="glass-card glass-card-glow-violet transition-all duration-300">
        <div className="p-6">
          <p className="mb-2 text-sm font-medium text-zinc-400">
            Monthly Budget
          </p>
          <span className="inline-flex items-baseline text-2xl font-bold text-electric-violet sm:text-3xl">
            $
            <CurrencyInput
              value={monthlyBudget}
              onChange={setMonthlyBudget}
              placeholder="0"
              className={inputBase}
            />
          </span>
        </div>
      </div>
      <div
        className="glass-card transition-all duration-300 overflow-hidden"
        style={{
          borderColor:
            budgetRemaining >= 0
              ? "rgba(0, 255, 136, 0.2)"
              : "rgba(239, 68, 68, 0.3)",
        }}
      >
        <div className="p-6">
          <p className="mb-2 text-sm font-medium text-zinc-400">
            Budget Remaining
          </p>
          <p
            className={`text-2xl font-bold sm:text-3xl ${
              budgetRemaining >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {Number(monthlyBudget) > 0
              ? formatCurrency(budgetRemaining)
              : "\u2014"}
          </p>
          {Number(monthlyBudget) > 0 && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(budgetUsedPct, 100)}%`,
                    backgroundColor:
                      budgetUsedPct > 100
                        ? "#ef4444"
                        : budgetUsedPct > 75
                        ? "#eab308"
                        : "#00ff88",
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {Math.round(budgetUsedPct)}% used
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="glass-card glass-card-glow-cyan overflow-hidden">
        <div className="p-6">
          <p className="mb-2 text-sm font-medium text-gray-400">
            Current Bank Balance
          </p>
          <span className="inline-flex items-baseline text-2xl font-bold text-cyan-400">
            $
            <CurrencyInput
              value={startingBalance}
              onChange={setStartingBalance}
              placeholder="0.00"
              className="ml-0.5 min-w-[4rem] max-w-full bg-transparent outline-none border-b border-transparent focus:border-cyan-400/30 transition-colors"
            />
          </span>
        </div>
      </div>
      <div className="glass-card glass-card-glow transition-all duration-300 col-span-2 lg:col-span-4">
        <div className="flex items-center justify-between p-6">
          <p className="text-sm font-medium text-zinc-400">Total Savings</p>
          <span className="inline-flex items-baseline text-2xl font-bold text-neon-cyan sm:text-3xl">
            $
            <CurrencyInput
              value={totalSavings}
              onChange={setTotalSavings}
              placeholder="0"
              className={inputBase}
            />
          </span>
        </div>
      </div>
    </section>
  );
}
