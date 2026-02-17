"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";

interface TransactionFormProps {
  onSubmit: (description: string, amount: number, category: string) => void;
  onCSVImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importMessage: string;
}

export default function TransactionForm({
  onSubmit,
  onCSVImport,
  importMessage,
}: TransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount === "" || isNaN(Number(amount))) return;
    onSubmit(description.trim(), Number(amount), category);
    setDescription("");
    setAmount("");
  };

  return (
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
        <label className="cursor-pointer rounded-lg bg-electric-violet/20 px-6 py-2.5 font-semibold text-electric-violet transition-colors hover:bg-electric-violet/30 focus-within:outline-none focus-within:ring-2 focus-within:ring-electric-violet/50">
          Import CSV
          <input
            type="file"
            accept=".csv,.txt,.CSV"
            onChange={onCSVImport}
            className="hidden"
          />
        </label>
      </form>
      {importMessage && (
        <div className="mt-3 rounded-lg border border-neon-cyan/20 bg-neon-cyan/10 px-4 py-2 text-sm font-medium text-neon-cyan">
          {importMessage}
        </div>
      )}
    </section>
  );
}
