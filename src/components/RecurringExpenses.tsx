"use client";

import { formatCurrency } from "@/lib/constants";

interface RecurringItem {
  description: string;
  amount: number;
  category: string;
}

interface RecurringExpensesProps {
  recurringTransactions: RecurringItem[];
  recurringTotal: number;
}

export default function RecurringExpenses({
  recurringTransactions,
  recurringTotal,
}: RecurringExpensesProps) {
  if (recurringTransactions.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Recurring Expenses
        <span className="ml-2 text-sm font-normal text-zinc-400">
          {formatCurrency(recurringTotal)} / month
        </span>
      </h2>
      <div className="glass-card glass-card-glow overflow-hidden transition-all duration-300">
        <ul className="divide-y divide-white/5">
          {recurringTransactions.map((r, i) => (
            <li
              key={i}
              className="flex items-center justify-between px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-200">
                  {r.description}
                </span>
                <span className="text-xs text-zinc-500">{r.category}</span>
              </div>
              <span className="text-sm font-semibold text-neon-cyan">
                {formatCurrency(r.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
