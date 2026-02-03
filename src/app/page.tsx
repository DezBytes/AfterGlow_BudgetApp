"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

const STORAGE_KEY = "financial-flow-transactions";
const BUDGET_STORAGE_KEY = "financial-flow-budget";

const CATEGORIES = [
  "Utilities",
  "Insurance",
  "Groceries",
  "Gas",
  "Dining",
  "Entertainment",
  "Shopping",
  "Unnecessary",
  "Other",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Utilities: "#a855f7",
  Insurance: "#7c3aed",
  Groceries: "#00ff88",
  Gas: "#00f5ff",
  Dining: "#ff9500",
  Entertainment: "#e040fb",
  Shopping: "#00bfff",
  Unnecessary: "#ff69b4",
  Other: "#94a3b8",
};

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

export default function Home() {
  const [startingBalance, setStartingBalance] = useState(0);
  const [transactions, setTransactions] = useState<
    { id: string; date: string; description: string; amount: number; category: string }[]
  >([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [monthlyBudget, setMonthlyBudget] = useState("3200");
  const [totalSavings, setTotalSavings] = useState("4890");
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure each transaction has a date field (for legacy data)
        const normalized = parsed.map(
          (tx: {
            id: string;
            date?: string;
            description: string;
            amount: number;
            category?: string;
          }) => ({
            ...tx,
            date: tx.date != null ? tx.date : "",
            category: tx.category && CATEGORIES.includes(tx.category as typeof CATEGORIES[number]) ? tx.category : "Other",
          })
        );
        setTransactions(normalized);
      } catch {
        // Keep empty if parse fails
      }
    }
    const budgetStored = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (budgetStored) {
      try {
        const { monthlyBudget: mb, totalSavings: ts } = JSON.parse(budgetStored);
        if (mb != null) setMonthlyBudget(String(mb));
        if (ts != null) setTotalSavings(String(ts));
      } catch {
        // Keep initial if parse fails
      }
    }
    setHasLoaded(true);
  }, []);

  // Save to localStorage when transactions change
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, hasLoaded]);

  // Save budget and savings to localStorage when they change
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem(
        BUDGET_STORAGE_KEY,
        JSON.stringify({ monthlyBudget, totalSavings })
      );
    }
  }, [monthlyBudget, totalSavings, hasLoaded]);

  const totalBalance = Number(startingBalance) - transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const chartData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      byCategory[cat] = 0;
    }
    for (const tx of transactions) {
      const cat = tx.category && CATEGORIES.includes(tx.category as typeof CATEGORIES[number]) ? tx.category : "Other";
      byCategory[cat] = (byCategory[cat] ?? 0) + Math.abs(tx.amount);
    }
    return CATEGORIES.map((cat) => ({
      category: cat,
      total: byCategory[cat] ?? 0,
      fill: CATEGORY_COLORS[cat],
    }));
  }, [transactions]);

  const budgetNum = Number(monthlyBudget) || 0;
  const yDomainMax = Math.floor(budgetNum) + 1000;
  const yTicks = (() => {
    const step = yDomainMax <= 2000 ? 500 : yDomainMax <= 5000 ? 1000 : 2000;
    const ticks: number[] = [];
    for (let t = 0; t <= yDomainMax; t += step) {
      ticks.push(t);
    }
    if (ticks[ticks.length - 1] !== yDomainMax) {
      ticks.push(yDomainMax);
    }
    return ticks;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount === "" || isNaN(Number(amount))) return;
    const numAmount = Number(amount);
    const newTx = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      description: description.trim(),
      amount: numAmount,
      category,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setDescription("");
    setAmount("");
  };

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  return (
    <div className="financial-flow-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="title-glow text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Financial Flow
          </h1>
        </header>

        {/* Add Transaction Form */}
        <section className="mb-12">
          <form
            onSubmit={handleSubmit}
            className="glass-card glass-card-glow flex flex-col gap-4 p-6 transition-all duration-300 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-zinc-400"
              >
                Description
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Groceries"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-colors focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30"
              />
            </div>
            <div className="sm:w-36">
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-zinc-400"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition-colors focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:w-36">
              <label
                htmlFor="amount"
                className="mb-1 block text-sm font-medium text-zinc-400"
              >
                Amount
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-colors focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-neon-cyan/20 px-6 py-2.5 font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/30 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
            >
              Add Transaction
            </button>
          </form>
        </section>

        {/* Summary Cards */}
        <section className="mb-12 grid gap-6 sm:grid-cols-3">
          <div className="glass-card glass-card-glow transition-all duration-300">
            <div className="p-6">
              <p className="mb-2 text-sm font-medium text-zinc-400">
                Total Balance
              </p>
              <p
                className={`text-2xl font-bold sm:text-3xl ${
                  totalBalance >= 0 ? "text-neon-cyan" : "text-electric-violet"
                }`}
              >
                {formatCurrency(totalBalance)}
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
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="0"
                  className="ml-0.5 min-w-[4rem] max-w-full border-0 bg-transparent p-0 font-inherit text-inherit outline-none placeholder:text-white/40 [appearance:textfield] focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </span>
            </div>
          </div>
          <div className="glass-card glass-card-glow-cyan overflow-hidden">
  <div className="p-6">
    <p className="mb-2 text-sm font-medium text-gray-400">
      Current Bank Balance
    </p>
    <span className="inline-flex items-baseline text-2xl font-bold text-cyan-400">
      $
      <input
        type="number"
        step="0.01"
        value={startingBalance}
        onChange={(e) => setStartingBalance(Number(e.target.value))}
        placeholder="0.00"
        className="ml-0.5 min-w-[4rem] max-w-full bg-transparent outline-none border-b border-transparent focus:border-cyan-400/30 transition-colors"
      />
    </span>
  </div>
</div>
          <div className="glass-card glass-card-glow transition-all duration-300">
            <div className="p-6">
              <p className="mb-2 text-sm font-medium text-zinc-400">
                Total Savings
              </p>
              <span className="inline-flex items-baseline text-2xl font-bold text-neon-cyan sm:text-3xl">
                $
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalSavings}
                  onChange={(e) => setTotalSavings(e.target.value)}
                  placeholder="0"
                  className="ml-0.5 min-w-[4rem] max-w-full border-0 bg-transparent p-0 font-inherit text-inherit outline-none placeholder:text-white/40 [appearance:textfield] focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </span>
            </div>
          </div>
        </section>

        {/* Spending by Category Chart */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Spending by Category
          </h2>
          <div className="glass-card glass-card-glow overflow-hidden p-6 transition-all duration-300">
            <div className="h-72 w-full min-w-0 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 16, right: 50, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="category"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    domain={[0, yDomainMax]}
                    ticks={yTicks}
                    allowDecimals={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickFormatter={(v) =>
                      `$${Math.round(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                    }
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(26, 8, 48, 0.95)",
                      border: "1px solid rgba(0, 245, 255, 0.2)",
                      borderRadius: "8px",
                      color: "#e8e4f0",
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(value: number | undefined) => [
                      formatCurrency(value ?? 0),
                      "Total",
                    ]}
                    labelFormatter={(label) => label}
                  />
                  <ReferenceLine
                    y={Number(monthlyBudget) || 0}
                    stroke="#ff3b30"
                    strokeWidth={2}
                    label={{
                      value: "Budget Limit",
                      fill: "#ff3b30",
                      fontSize: 12,
                      position: "insideTopRight",
                    }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Recent Transactions
          </h2>
          <div className="glass-card glass-card-glow overflow-hidden transition-all duration-300">
            <ul className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-zinc-200">
                      {tx.description}
                    </span>
                    {tx.category && (
                      <span className="ml-2 text-xs text-zinc-500">
                        {tx.category}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`font-semibold ${
                        tx.amount >= 0 ? "text-neon-cyan" : "text-electric-violet"
                      }`}
                    >
                      {formatCurrency(tx.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(tx.id)}
                      aria-label={`Delete ${tx.description}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/10 hover:text-red-400 focus:outline-none focus:ring-1 focus:ring-white/20"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
