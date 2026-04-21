import type { ReactNode } from "react";

type Props = {
  headline: string;
  body: string;
  illustration?: ReactNode;
};

export default function OneOhOneCard({ headline, body, illustration }: Props) {
  return (
    <div className="flex h-full flex-col px-6">
      <h2 className="text-[34px] font-light leading-[1.1] tracking-tight text-ink">
        {headline}
      </h2>
      <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-muted">
        {body}
      </p>
      {illustration && (
        <div className="mt-6 flex flex-1 items-center justify-center">
          {illustration}
        </div>
      )}
    </div>
  );
}
