"use client";

import { CATEGORIES } from "@/lib/constants";

interface FilterBarProps {
  filterMonth: string;
  setFilterMonth: (v: string) => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  availableMonths: string[];
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FilterBar({
  filterMonth,
  setFilterMonth,
  filterCategory,
  setFilterCategory,
  searchQuery,
  setSearchQuery,
  availableMonths,
  onExportBackup,
  onImportBackup,
}: FilterBarProps) {
  return (
    <section className="mb-8 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="month-filter"
            className="text-sm font-medium text-zinc-400"
          >
            Month
          </label>
          <select
            id="month-filter"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30"
          >
            {availableMonths.map((m) => {
              const [y, mo] = m.split("-");
              const label = new Date(
                parseInt(y),
                parseInt(mo) - 1
              ).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              });
              return (
                <option key={m} value={m} className="bg-zinc-900 text-white">
                  {label}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="cat-filter"
            className="text-sm font-medium text-zinc-400"
          >
            Category
          </label>
          <select
            id="cat-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30"
          >
            <option value="All" className="bg-zinc-900 text-white">
              All
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-900 text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onExportBackup}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
          >
            Export Backup
          </button>
          <label className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10">
            Restore Backup
            <input
              type="file"
              accept=".json"
              onChange={onImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search transactions..."
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30"
      />
    </section>
  );
}
