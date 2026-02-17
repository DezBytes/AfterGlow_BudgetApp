"use client";

import { useState, useEffect, useMemo } from "react";
import {
  STORAGE_KEY,
  BUDGET_STORAGE_KEY,
  CATEGORY_BUDGETS_KEY,
  CATEGORIES,
  CATEGORY_COLORS,
  categorizeDescription,
  cleanDescription,
  type Transaction,
} from "@/lib/constants";

import SummaryCards from "@/components/SummaryCards";
import BudgetLimits from "@/components/BudgetLimits";
import RecurringExpenses from "@/components/RecurringExpenses";
import FilterBar from "@/components/FilterBar";
import SpendingChart from "@/components/SpendingChart";
import SpendingTrends from "@/components/SpendingTrends";
import TransactionList from "@/components/TransactionList";
import TransactionForm from "@/components/TransactionForm";
import DeleteModal from "@/components/DeleteModal";
import Onboarding from "@/components/Onboarding";

export default function Home() {
  const [startingBalance, setStartingBalance] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [totalSavings, setTotalSavings] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [deletingTx, setDeletingTx] = useState<{ id: string; description: string } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const normalized = parsed.map(
          (tx: {
            id: string;
            date?: string;
            description: string;
            amount: number;
            category?: string;
          }) => {
            let category =
              tx.category &&
              CATEGORIES.includes(tx.category as (typeof CATEGORIES)[number])
                ? tx.category
                : "Other";
            // Migrate: deposits categorized as "Other" should be "Income"
            if (tx.amount < 0 && category === "Other") {
              category = "Income";
            }
            return {
              ...tx,
              date: tx.date != null ? tx.date : "",
              category,
            };
          }
        );
        setTransactions(normalized);
      } catch {
        // Keep empty if parse fails
      }
    }
    const budgetStored = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (budgetStored) {
      try {
        const { monthlyBudget, totalSavings, startingBalance } =
          JSON.parse(budgetStored);
        if (monthlyBudget != null) setMonthlyBudget(String(monthlyBudget));
        if (totalSavings != null) setTotalSavings(String(totalSavings));
        if (startingBalance != null) setStartingBalance(String(startingBalance));
      } catch {
        // Keep initial if parse fails
      }
    }
    const catBudgetsStored = localStorage.getItem(CATEGORY_BUDGETS_KEY);
    if (catBudgetsStored) {
      try {
        setCategoryBudgets(JSON.parse(catBudgetsStored));
      } catch {
        // Keep empty if parse fails
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
        JSON.stringify({ monthlyBudget, totalSavings, startingBalance })
      );
    }
  }, [monthlyBudget, totalSavings, startingBalance, hasLoaded]);

  // Save category budgets to localStorage
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem(
        CATEGORY_BUDGETS_KEY,
        JSON.stringify(categoryBudgets)
      );
    }
  }, [categoryBudgets, hasLoaded]);

  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    if (!filterMonth) return transactions;
    const [yearStr, monthStr] = filterMonth.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1;
    return transactions.filter((tx) => {
      if (!tx.date) return false;
      const d = new Date(tx.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [transactions, filterMonth]);

  // Monthly spending total (only expenses, not income credits)
  const monthlySpent = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const budgetRemaining = Number(monthlyBudget) - monthlySpent;
  const budgetUsedPct =
    Number(monthlyBudget) > 0
      ? (monthlySpent / Number(monthlyBudget)) * 100
      : 0;

  // Get available months from transaction data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    for (const tx of transactions) {
      if (tx.date) {
        const d = new Date(tx.date);
        months.add(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        );
      }
    }
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Search & category filter on top of month filter
  const displayedTransactions = useMemo(() => {
    let result = filteredTransactions;
    if (filterCategory !== "All") {
      result = result.filter((tx) => tx.category === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((tx) =>
        tx.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filteredTransactions, filterCategory, searchQuery]);

  // Spending totals per category for the selected month
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      spending[cat] = 0;
    }
    for (const tx of filteredTransactions) {
      if (tx.amount > 0) {
        const cat = tx.category || "Other";
        spending[cat] = (spending[cat] ?? 0) + tx.amount;
      }
    }
    return spending;
  }, [filteredTransactions]);

  // Detect recurring transactions (same description appearing in 2+ months)
  const recurringTransactions = useMemo(() => {
    const byDesc: Record<string, Set<string>> = {};
    for (const tx of transactions) {
      if (!tx.date || tx.amount <= 0) continue;
      const d = new Date(tx.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const descKey = tx.description.toLowerCase();
      if (!byDesc[descKey]) byDesc[descKey] = new Set();
      byDesc[descKey].add(monthKey);
    }
    const recurringDescs = new Set(
      Object.entries(byDesc)
        .filter(([, months]) => months.size >= 2)
        .map(([desc]) => desc)
    );
    const recurringKeywords = [
      "recurring",
      "autopay",
      "subscription",
      "bill payment",
      "monthly",
    ];
    const seen = new Map<
      string,
      { description: string; amount: number; category: string }
    >();
    for (const tx of filteredTransactions) {
      if (tx.amount <= 0) continue;
      const descKey = tx.description.toLowerCase();
      const isRecurring =
        recurringDescs.has(descKey) ||
        recurringKeywords.some((kw) => descKey.includes(kw));
      if (isRecurring && !seen.has(descKey)) {
        seen.set(descKey, {
          description: tx.description,
          amount: tx.amount,
          category: tx.category,
        });
      }
    }
    return Array.from(seen.values());
  }, [transactions, filteredTransactions]);

  const recurringTotal = useMemo(
    () => recurringTransactions.reduce((sum, r) => sum + r.amount, 0),
    [recurringTransactions]
  );

  // Spending trends — per-category totals by month (for line chart)
  const trendsData = useMemo(() => {
    const monthMap: Record<string, Record<string, number>> = {};
    for (const tx of transactions) {
      if (!tx.date || tx.amount <= 0) continue;
      const d = new Date(tx.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {};
        for (const cat of CATEGORIES) monthMap[monthKey][cat] = 0;
      }
      const cat = tx.category || "Other";
      monthMap[monthKey][cat] = (monthMap[monthKey][cat] ?? 0) + tx.amount;
    }
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, cats]) => {
        const [y, m] = month.split("-");
        const label = new Date(
          parseInt(y),
          parseInt(m) - 1
        ).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        return { month: label, ...cats };
      });
  }, [transactions]);

  const chartData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      byCategory[cat] = 0;
    }
    for (const tx of filteredTransactions) {
      const cat =
        tx.category &&
        CATEGORIES.includes(tx.category as (typeof CATEGORIES)[number])
          ? tx.category
          : "Other";
      if (cat === "Income") {
        // Deposits are negative internally, use absolute value for chart
        byCategory[cat] = (byCategory[cat] ?? 0) + Math.abs(tx.amount);
      } else {
        if (tx.amount <= 0) continue; // Skip non-income deposits
        byCategory[cat] = (byCategory[cat] ?? 0) + tx.amount;
      }
    }
    const totalSpending = Object.values(byCategory).reduce((a, b) => a + b, 0);
    return CATEGORIES.map((cat) => ({
      category: cat,
      total: Math.round((byCategory[cat] ?? 0) * 100) / 100,
      fill: CATEGORY_COLORS[cat],
      pct:
        totalSpending > 0
          ? Math.round(((byCategory[cat] ?? 0) / totalSpending) * 100)
          : 0,
    })).sort((a, b) => b.total - a.total);
  }, [filteredTransactions]);

  // --- Handlers ---

  const handleAddTransaction = (
    description: string,
    amount: number,
    category: string
  ) => {
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      description,
      amount,
      category,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDelete = () => {
    if (!deletingTx) return;
    setTransactions((prev) => prev.filter((tx) => tx.id !== deletingTx.id));
    setDeletingTx(null);
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Omit<Transaction, "id">>) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      )
    );
  };

  const handleExportBackup = () => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions,
      settings: { monthlyBudget, totalSavings, startingBalance },
      categoryBudgets,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `money-matrix-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
        if (data.settings) {
          if (data.settings.monthlyBudget != null)
            setMonthlyBudget(String(data.settings.monthlyBudget));
          if (data.settings.totalSavings != null)
            setTotalSavings(String(data.settings.totalSavings));
          if (data.settings.startingBalance != null)
            setStartingBalance(String(data.settings.startingBalance));
        }
        if (data.categoryBudgets) {
          setCategoryBudgets(data.categoryBudgets);
        }
        setImportMessage(
          `Restored backup from ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : "file"}`
        );
        setTimeout(() => setImportMessage(""), 5000);
      } catch {
        setImportMessage("Invalid backup file");
        setTimeout(() => setImportMessage(""), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Multi-line-aware CSV parser
  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let current = "";
    let inQuotes = false;
    let fields: string[] = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"' && text[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          fields.push(current.trim());
          current = "";
        } else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
          if (ch === "\r") i++;
          fields.push(current.trim());
          if (fields.some((f) => f !== "")) {
            rows.push(fields);
          }
          fields = [];
          current = "";
        } else {
          current += ch;
        }
      }
    }
    fields.push(current.trim());
    if (fields.some((f) => f !== "")) {
      rows.push(fields);
    }
    return rows;
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportMessage("Reading file...");

    const reader = new FileReader();
    reader.onerror = () => {
      setImportMessage("Error reading file");
      setTimeout(() => setImportMessage(""), 5000);
    };
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setImportMessage("Could not read file");
          setTimeout(() => setImportMessage(""), 5000);
          return;
        }

        const cleanText = text.replace(/^\uFEFF/, "");
        const rows = parseCSV(cleanText);

        if (rows.length < 2) {
          setImportMessage("File has no data rows");
          setTimeout(() => setImportMessage(""), 5000);
          return;
        }

        const headerFields = rows[0].map((h) =>
          h.replace(/^@/, "").trim().toLowerCase()
        );

        const colDate = headerFields.findIndex((h) => /\bdate\b/.test(h));
        const colDesc = headerFields.findIndex(
          (h) =>
            /\b(description|memo|payee|merchant|details|narrative|reference|particulars)\b/.test(
              h
            ) || h === "name"
        );
        const colDebit = headerFields.findIndex((h) =>
          /\b(debit|withdrawal|payment|charge|expense)\b/.test(h)
        );
        const colCredit = headerFields.findIndex((h) =>
          /\b(credit|deposit|income)\b/.test(h)
        );
        const colAmount = headerFields.findIndex(
          (h) =>
            /\b(amount|sum|value)\b/.test(h) &&
            !/\b(debit|credit|withdrawal|deposit)\b/.test(h)
        );
        const colType = headerFields.findIndex((h) =>
          /\b(type|dr.?cr|transaction\s*type)\b/.test(h)
        );

        if (
          colDesc === -1 &&
          colDebit === -1 &&
          colCredit === -1 &&
          colAmount === -1
        ) {
          setImportMessage(
            `Could not detect columns. Found headers: ${rows[0].join(", ")}. ` +
              `Expected columns like Date, Description, Amount (or Debit/Credit).`
          );
          setTimeout(() => setImportMessage(""), 8000);
          return;
        }

        const existingKeys = new Set(
          transactions.map(
            (tx) => `${tx.date}|${tx.description}|${tx.amount}`
          )
        );

        const imported: Transaction[] = [];
        let skippedDuplicates = 0;

        for (let r = 1; r < rows.length; r++) {
          const fields = rows[r];
          const getField = (col: number) =>
            col >= 0 && col < fields.length ? fields[col] : "";

          const postDate = getField(colDate);
          const rawDesc = getField(colDesc);

          let amount = 0;
          let hasAmount = false;

          if (colDebit >= 0 || colCredit >= 0) {
            const debitStr = getField(colDebit).replace(/[$,()]/g, "");
            const creditStr = getField(colCredit).replace(/[$,()]/g, "");
            const debit = parseFloat(debitStr);
            const credit = parseFloat(creditStr);
            if (!isNaN(debit) && debit > 0) {
              amount = debit;
              hasAmount = true;
            } else if (!isNaN(credit) && credit > 0) {
              amount = -credit;
              hasAmount = true;
            }
          } else if (colAmount >= 0) {
            let amtStr = getField(colAmount).replace(/[$,]/g, "");
            const isParenNeg = /^\(.*\)$/.test(amtStr.trim());
            if (isParenNeg) amtStr = amtStr.replace(/[()]/g, "");
            const parsed = parseFloat(amtStr);
            if (!isNaN(parsed)) {
              hasAmount = true;
              if (colType >= 0) {
                const typeVal = getField(colType).toLowerCase();
                const isCredit =
                  /\b(credit|cr|deposit|income)\b/.test(typeVal);
                amount = isCredit ? -Math.abs(parsed) : Math.abs(parsed);
              } else {
                amount = isParenNeg
                  ? Math.abs(parsed)
                  : parsed > 0
                  ? parsed
                  : parsed;
              }
            }
          }

          if (!rawDesc && !hasAmount) continue;
          if (!hasAmount) continue;

          let category = categorizeDescription(rawDesc);
          // Auto-categorize deposits as Income if not already matched
          if (amount < 0 && category === "Other") {
            category = "Income";
          }
          const desc = cleanDescription(rawDesc);

          let date = "";
          try {
            const parsed = new Date(postDate);
            if (!isNaN(parsed.getTime())) {
              date = parsed.toISOString();
            }
          } catch {
            // Leave date empty if unparseable
          }

          const displayDesc = desc || "Imported transaction";
          const key = `${date}|${displayDesc}|${amount}`;

          if (existingKeys.has(key)) {
            skippedDuplicates++;
            continue;
          }
          existingKeys.add(key);

          imported.push({
            id: crypto.randomUUID(),
            date,
            description: displayDesc,
            amount,
            category,
          });
        }

        if (imported.length > 0) {
          setTransactions((prev) => [...imported, ...prev]);
          const dupMsg =
            skippedDuplicates > 0
              ? ` (${skippedDuplicates} duplicate${skippedDuplicates === 1 ? "" : "s"} skipped)`
              : "";
          setImportMessage(
            `Imported ${imported.length} transaction${imported.length === 1 ? "" : "s"}${dupMsg}`
          );
        } else if (skippedDuplicates > 0) {
          setImportMessage(
            `All ${skippedDuplicates} transaction${skippedDuplicates === 1 ? " is" : "s are"} already imported`
          );
        } else {
          setImportMessage("No valid transactions found in file");
        }
        setTimeout(() => setImportMessage(""), 5000);
      } catch (err) {
        setImportMessage(
          `Import error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
        setTimeout(() => setImportMessage(""), 5000);
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="financial-flow-bg min-h-screen">
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <header className="mb-12">
          <h1 className="title-glow text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Money Matrix
          </h1>
        </header>

        <Onboarding
          hasTransactions={transactions.length > 0}
          hasBudget={Number(monthlyBudget) > 0}
        />

        <TransactionForm
          onSubmit={handleAddTransaction}
          onCSVImport={handleCSVImport}
          importMessage={importMessage}
        />

        <SummaryCards
          monthlySpent={monthlySpent}
          monthlyBudget={monthlyBudget}
          setMonthlyBudget={setMonthlyBudget}
          budgetRemaining={budgetRemaining}
          budgetUsedPct={budgetUsedPct}
          startingBalance={startingBalance}
          setStartingBalance={setStartingBalance}
          totalSavings={totalSavings}
          setTotalSavings={setTotalSavings}
        />

        <BudgetLimits
          categorySpending={categorySpending}
          categoryBudgets={categoryBudgets}
          setCategoryBudgets={setCategoryBudgets}
        />

        <RecurringExpenses
          recurringTransactions={recurringTransactions}
          recurringTotal={recurringTotal}
        />

        <FilterBar
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          availableMonths={availableMonths}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
        />

        <SpendingChart chartData={chartData} />

        <SpendingTrends trendsData={trendsData} />

        <TransactionList
          transactions={displayedTransactions}
          searchQuery={searchQuery}
          filterCategory={filterCategory}
          onUpdate={handleUpdateTransaction}
          onDeleteRequest={setDeletingTx}
        />
      </div>

      {deletingTx && (
        <DeleteModal
          description={deletingTx.description}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTx(null)}
        />
      )}
    </div>
  );
}
