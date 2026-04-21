import type { ReactNode } from "react";

type Props = {
  headline: string;
  body: string;
  illustration?: ReactNode;
  illustrationLabel?: string;
};

export default function OneOhOneCard({
  headline,
  body,
  illustration,
  illustrationLabel,
}: Props) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col px-6">
      <h2 className="text-[32px] font-light leading-[1.1] tracking-tight text-ink">
        {headline}
      </h2>
      <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-muted">
        {body}
      </p>
      {illustration && (
        <div
          className="mt-6 flex flex-1 items-center justify-center"
          role="img"
          aria-label={illustrationLabel}
        >
          {illustration}
        </div>
      )}
    </div>
  );
}
