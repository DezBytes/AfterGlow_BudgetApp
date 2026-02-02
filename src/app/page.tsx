export default function Home() {
  const summaryCards = [
    {
      label: "Total Balance",
      value: "$12,450.00",
      accent: "cyan" as const,
    },
    {
      label: "Monthly Budget",
      value: "$3,200.00",
      accent: "violet" as const,
    },
    {
      label: "Total Savings",
      value: "$4,890.00",
      accent: "cyan" as const,
    },
  ];

  const transactions = [
    { name: "Starbucks", amount: "$5.40", type: "expense" as const },
    { name: "Amazon", amount: "$42.00", type: "expense" as const },
    { name: "Rent", amount: "$1,200", type: "expense" as const },
  ];

  return (
    <div className="financial-flow-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="title-glow text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Financial Flow
          </h1>
        </header>

        {/* Summary Cards */}
        <section className="mb-12 grid gap-6 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`glass-card glass-card-glow${card.accent === "violet" ? "-violet" : ""} transition-all duration-300`}
            >
              <div className="p-6">
                <p className="mb-2 text-sm font-medium text-zinc-400">
                  {card.label}
                </p>
                <p
                  className={`text-2xl font-bold sm:text-3xl ${
                    card.accent === "cyan"
                      ? "text-neon-cyan"
                      : "text-electric-violet"
                  }`}
                >
                  {card.value}
                </p>
              </div>
            </div>
          ))}
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
                  key={`${tx.name}-${tx.amount}`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.02]"
                >
                  <span className="font-medium text-zinc-200">{tx.name}</span>
                  <span className="text-neon-cyan font-semibold">
                    -{tx.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
