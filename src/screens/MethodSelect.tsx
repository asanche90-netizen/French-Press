import type { BrewMethod } from "../lib/types";

type Props = {
  onSelect: (method: BrewMethod) => void;
};

const METHODS: {
  value: BrewMethod;
  label: string;
  description: string;
}[] = [
  {
    value: "french-press",
    label: "French Press",
    description: "Full-bodied immersion brew.",
  },
  {
    value: "pour-over",
    label: "Pour Over",
    description: "Clean, bright, hands-on.",
  },
  {
    value: "drip",
    label: "Drip",
    description: "Effortless, machine-driven.",
  },
];

export default function MethodSelect({ onSelect }: Props) {
  return (
    <div className="min-h-dvh bg-cream text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5">
        <header className="flex items-center justify-center py-3">
          <h1 className="text-sm font-medium tracking-wide text-ink">
            Coffee Buddy
          </h1>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-4 pb-12">
          <div className="mb-2 flex flex-col gap-1 text-center">
            <h2 className="text-3xl font-light tracking-tight text-ink">
              Pick your method.
            </h2>
            <p className="text-sm text-muted">
              Three ways to brew. Each one has its own flow.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {METHODS.map((m) => (
              <li key={m.value}>
                <button
                  type="button"
                  onClick={() => onSelect(m.value)}
                  className="flex w-full flex-col gap-1 rounded-2xl border border-hairline bg-cream px-5 py-5 text-left transition-colors hover:border-ink hover:bg-hairline/30 active:bg-hairline/50"
                >
                  <span className="text-xl font-medium text-ink">
                    {m.label}
                  </span>
                  <span className="text-sm text-muted">{m.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
