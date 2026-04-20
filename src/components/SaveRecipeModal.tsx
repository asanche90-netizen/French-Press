import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  summary: string;
  onCancel: () => void;
  onSave: (name: string) => void;
};

export default function SaveRecipeModal({ open, summary, onCancel, onSave }: Props) {
  if (!open) return null;
  return <Modal summary={summary} onCancel={onCancel} onSave={onSave} />;
}

function Modal({
  summary,
  onCancel,
  onSave,
}: {
  summary: string;
  onCancel: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Save recipe"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-ink/40 animate-[fade-in_180ms_ease-out]"
      />
      <div className="relative w-full max-w-[360px] rounded-2xl bg-cream p-6 shadow-2xl animate-[fade-in_180ms_ease-out]">
        <h2 className="text-lg font-medium text-ink">Save recipe</h2>
        <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-muted">
          {summary}
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name your recipe"
          maxLength={40}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          className="mt-5 w-full rounded-lg border border-hairline bg-transparent px-3 py-2.5 text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
        <p className="mt-1.5 text-xs text-muted">E.g. Morning Ethiopian</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-hairline py-3 text-sm font-medium text-ink hover:bg-hairline/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 rounded-full bg-ink py-3 text-sm font-medium text-cream transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
