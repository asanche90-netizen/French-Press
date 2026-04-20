type Screen = "home" | "brew" | "complete";

type Props = {
  onNavigate: (screen: Screen) => void;
};

export default function Home({ onNavigate }: Props) {
  return (
    <section className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-medium tracking-tight text-ink">Home</h1>
      <p className="text-muted">Scaffold placeholder screen.</p>
      <button
        type="button"
        onClick={() => onNavigate("brew")}
        className="rounded-md bg-accent px-6 py-3 text-cream hover:opacity-90"
      >
        Start brew
      </button>
    </section>
  );
}
