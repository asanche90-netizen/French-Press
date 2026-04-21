const BUBBLES = [
  { cx: 105, cy: 90, delay: 0, rise: 42 },
  { cx: 145, cy: 100, delay: 300, rise: 55 },
  { cx: 180, cy: 85, delay: 150, rise: 38 },
  { cx: 125, cy: 110, delay: 550, rise: 48 },
  { cx: 165, cy: 110, delay: 750, rise: 35 },
  { cx: 140, cy: 80, delay: 900, rise: 50 },
];

const GROUNDS = [
  { cx: 95, cy: 115 },
  { cx: 105, cy: 120 },
  { cx: 115, cy: 110 },
  { cx: 122, cy: 118 },
  { cx: 130, cy: 112 },
  { cx: 138, cy: 120 },
  { cx: 146, cy: 114 },
  { cx: 154, cy: 118 },
  { cx: 160, cy: 112 },
  { cx: 168, cy: 120 },
  { cx: 176, cy: 114 },
  { cx: 184, cy: 118 },
  { cx: 100, cy: 125 },
  { cx: 112, cy: 128 },
  { cx: 128, cy: 126 },
  { cx: 144, cy: 128 },
  { cx: 160, cy: 126 },
  { cx: 176, cy: 128 },
];

export default function BloomIllustration() {
  return (
    <svg
      viewBox="0 0 280 200"
      width="280"
      height="200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent"
      aria-hidden="true"
    >
      {/* outer press rim */}
      <ellipse cx="140" cy="130" rx="70" ry="22" />
      {/* inner rim (thickness) */}
      <ellipse
        cx="140"
        cy="130"
        rx="63"
        ry="18"
        stroke="var(--color-hairline)"
      />

      {/* grounds — small dots scattered on the surface */}
      {GROUNDS.map((g, i) => (
        <circle key={i} cx={g.cx} cy={g.cy} r="1.2" fill="currentColor" stroke="none" />
      ))}

      {/* bubbles rising */}
      {BUBBLES.map((b, i) => (
        <circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r="3"
          stroke="currentColor"
          style={
            {
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: `bubble-rise 2.4s ease-out ${b.delay}ms forwards`,
              "--rise": `-${b.rise}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  );
}
