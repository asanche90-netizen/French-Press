type Screen = "home" | "brew" | "complete";

type Props = {
  onNavigate: (screen: Screen) => void;
};

export default function Brew({ onNavigate }: Props) {
  return (
    <section className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-medium tracking-tight text-ink">Brew</h1>
      <p className="text-muted">Scaffold placeholder screen.</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="rounded-md border border-hairline px-6 py-3 text-ink hover:bg-hairline/40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onNavigate("complete")}
          className="rounded-md bg-accent px-6 py-3 text-cream hover:opacity-90"
        >
          Finish
        </button>
      </div>
    </section>
  );
}
