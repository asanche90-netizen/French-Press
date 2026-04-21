const CIRCLES = [
  { cx: 55, r: 3 },
  { cx: 95, r: 5 },
  { cx: 140, r: 8 },
  { cx: 190, r: 12 },
  { cx: 245, r: 17 },
];

export default function GrindIllustration() {
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
      {/* baseline */}
      <line
        x1="30"
        y1="150"
        x2="260"
        y2="150"
        stroke="var(--color-hairline)"
      />

      {/* grind circles */}
      {CIRCLES.map((c, i) => {
        const isZone = i >= 3;
        return (
          <circle
            key={i}
            cx={c.cx}
            cy={110}
            r={c.r}
            fill={isZone ? "currentColor" : "none"}
            stroke="currentColor"
            style={
              {
                transformBox: "fill-box",
                transformOrigin: "center",
                opacity: 0,
                animation: `pop-in 420ms cubic-bezier(0.2, 1.2, 0.4, 1) ${
                  i * 180
                }ms forwards`,
              } as React.CSSProperties
            }
          />
        );
      })}

      {/* french press zone bracket */}
      <g
        style={{
          opacity: 0,
          animation: "pop-in 420ms ease-out 1100ms forwards",
        }}
      >
        <path d="M167 65 L167 58 L260 58 L260 65" />
        <text
          x="213.5"
          y="48"
          textAnchor="middle"
          className="fill-muted"
          style={{ fontSize: "10px", letterSpacing: "0.12em" }}
          stroke="none"
        >
          FRENCH PRESS
        </text>
      </g>

      {/* end labels */}
      <text
        x="55"
        y="175"
        textAnchor="middle"
        className="fill-muted"
        style={{ fontSize: "10px", letterSpacing: "0.12em" }}
        stroke="none"
      >
        FINE
      </text>
      <text
        x="245"
        y="175"
        textAnchor="middle"
        className="fill-muted"
        style={{ fontSize: "10px", letterSpacing: "0.12em" }}
        stroke="none"
      >
        COARSE
      </text>
    </svg>
  );
}
