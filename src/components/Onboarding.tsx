"use client";

interface OnboardingProps {
  hasTransactions: boolean;
  hasBudget: boolean;
}

export default function Onboarding({
  hasTransactions,
  hasBudget,
}: OnboardingProps) {
  if (hasTransactions && hasBudget) return null;

  const steps = [
    {
      done: hasBudget,
      label: "Set your monthly budget",
      hint: "Enter a dollar amount in the Monthly Budget card above",
    },
    {
      done: hasTransactions,
      label: "Add your first transaction",
      hint: "Type a description and amount above, or import a CSV from your bank",
    },
  ];

  const allDone = steps.every((s) => s.done);
  if (allDone) return null;

  return (
    <section className="mb-12">
      <div className="glass-card overflow-hidden border-dashed border-white/20 p-6">
        <h2 className="mb-1 text-base font-semibold text-white">
          Get started with Money Matrix
        </h2>
        <p className="mb-4 text-sm text-zinc-400">
          Complete these steps to start tracking your spending.
        </p>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.done
                    ? "bg-green-500/20 text-green-400"
                    : "bg-white/10 text-zinc-400"
                }`}
              >
                {step.done ? "\u2713" : i + 1}
              </span>
              <div>
                <p
                  className={`text-sm font-medium ${
                    step.done ? "text-zinc-500 line-through" : "text-zinc-200"
                  }`}
                >
                  {step.label}
                </p>
                {!step.done && (
                  <p className="text-xs text-zinc-500">{step.hint}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
