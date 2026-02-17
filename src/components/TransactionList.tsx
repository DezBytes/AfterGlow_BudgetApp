"use client";

import { useState } from "react";
import { CATEGORIES, formatDisplayAmount, type Transaction } from "@/lib/constants";

interface TransactionListProps {
  transactions: Transaction[];
  searchQuery: string;
  filterCategory: string;
  onUpdate: (id: string, updates: Partial<Omit<Transaction, "id">>) => void;
  onDeleteRequest: (tx: { id: string; description: string }) => void;
}

export default function TransactionList({
  transactions,
  searchQuery,
  filterCategory,
  onUpdate,
  onDeleteRequest,
}: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const startEditing = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditDesc(tx.description);
    setEditAmount(String(tx.amount));
    setEditCategory(tx.category);
  };

  const saveEdit = () => {
    if (!editingId || !editDesc.trim() || isNaN(Number(editAmount))) return;
    onUpdate(editingId, {
      description: editDesc.trim(),
      amount: Number(editAmount),
      category: editCategory,
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-white">
        Recent Transactions
      </h2>
      <div className="glass-card glass-card-glow overflow-hidden transition-all duration-300">
        {transactions.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-zinc-500">
            {searchQuery || filterCategory !== "All"
              ? "No matching transactions"
              : "No transactions this month"}
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {transactions.map((tx) =>
              editingId === tx.id ? (
                <li key={tx.id} className="px-6 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-neon-cyan/50"
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-neon-cyan/50"
                    >
                      {CATEGORIES.map((cat) => (
                        <option
                          key={cat}
                          value={cat}
                          className="bg-zinc-900 text-white"
                        >
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-neon-cyan/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="rounded-lg bg-neon-cyan/20 px-3 py-1.5 text-xs font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/30"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </li>
              ) : (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-zinc-200">
                      {tx.description}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditing(tx)}
                      className="ml-2 rounded px-1.5 py-0.5 text-xs text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
                      title="Click to change category"
                    >
                      {tx.category}
                    </button>
                    {tx.date && (
                      <span className="ml-2 text-xs text-zinc-600">
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`font-semibold ${
                        tx.amount < 0
                          ? "text-green-400"
                          : "text-neon-cyan"
                      }`}
                    >
                      {formatDisplayAmount(tx.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditing(tx)}
                      aria-label={`Edit ${tx.description}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white/20"
                      title="Edit transaction"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onDeleteRequest({
                          id: tx.id,
                          description: tx.description,
                        })
                      }
                      aria-label={`Delete ${tx.description}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/10 hover:text-red-400 focus:outline-none focus:ring-1 focus:ring-white/20"
                    >
                      &times;
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </section>
  );
}
