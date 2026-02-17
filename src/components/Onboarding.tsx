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
      hint: "Scroll down to the Monthly Budget card and enter a dollar amount",
    },
    {
      done: hasTransactions,
      label: "Add your first transaction",
      hint: "Use the form below to type a description and amount, or import a CSV from your bank",
    },
  ];

  const allDone = steps.every((s) => s.done);
  if (allDone) return null;

  return (
    <section className="mb-12">
      <div className="glass-card overflow-hidden border-2 border-dashed border-neon-cyan/30 p-8">
        <h2 className="mb-2 text-xl font-bold text-white">
          Welcome to Money Matrix
        </h2>
        <p className="mb-6 text-sm text-zinc-400">
          Follow these steps to start tracking your spending. This guide will
          disappear once you&apos;re set up.
        </p>
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  step.done
                    ? "bg-green-500/20 text-green-400"
                    : "bg-neon-cyan/20 text-neon-cyan"
                }`}
              >
                {step.done ? "\u2713" : i + 1}
              </span>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    step.done ? "text-zinc-500 line-through" : "text-white"
                  }`}
                >
                  {step.label}
                </p>
                {!step.done && (
                  <p className="mt-0.5 text-xs text-zinc-400">{step.hint}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
