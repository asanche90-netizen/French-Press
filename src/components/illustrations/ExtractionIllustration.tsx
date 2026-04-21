export default function ExtractionIllustration() {
  const drawBase = {
    fill: "none" as const,
    stroke: "currentColor",
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
  };

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
      {/* axes */}
      <line x1="30" y1="170" x2="260" y2="170" stroke="var(--color-hairline)" />
      <line x1="30" y1="30" x2="30" y2="170" stroke="var(--color-hairline)" />

      {/* axis labels */}
      <text
        x="30"
        y="188"
        textAnchor="start"
        className="fill-muted"
        style={{ fontSize: "9px", letterSpacing: "0.1em" }}
        stroke="none"
      >
        0:00
      </text>
      <text
        x="260"
        y="188"
        textAnchor="end"
        className="fill-muted"
        style={{ fontSize: "9px", letterSpacing: "0.1em" }}
        stroke="none"
      >
        6:00
      </text>

      {/* sweetness — bell peaking early */}
      <path
        {...drawBase}
        d="M 36 165 Q 75 30 125 165"
        opacity="0.55"
        style={{
          animation: "draw-line 1.1s ease-out 0ms forwards",
        }}
      />
      {/* body — bell peaking middle */}
      <path
        {...drawBase}
        d="M 60 165 Q 140 40 220 165"
        opacity="0.8"
        style={{
          animation: "draw-line 1.1s ease-out 300ms forwards",
        }}
      />
      {/* bitterness — hockey stick at end */}
      <path
        {...drawBase}
        d="M 150 162 C 190 155 215 100 255 35"
        style={{
          animation: "draw-line 1.1s ease-out 600ms forwards",
        }}
      />

      {/* 4:00 marker — vertical dashed line, appears last */}
      <g
        style={{
          opacity: 0,
          animation: "pop-in 340ms ease-out 1700ms forwards",
        }}
      >
        <line
          x1="183"
          y1="28"
          x2="183"
          y2="170"
          stroke="var(--color-ink)"
          strokeDasharray="3 4"
          strokeWidth="1"
        />
        <text
          x="183"
          y="20"
          textAnchor="middle"
          className="fill-ink"
          style={{ fontSize: "10px", letterSpacing: "0.12em" }}
          stroke="none"
        >
          4:00
        </text>
      </g>

      {/* curve labels */}
      <g
        style={{
          opacity: 0,
          animation: "pop-in 500ms ease-out 1100ms forwards",
        }}
      >
        <text
          x="80"
          y="50"
          textAnchor="start"
          className="fill-muted"
          style={{ fontSize: "9px", letterSpacing: "0.08em" }}
          stroke="none"
        >
          sweetness
        </text>
        <text
          x="146"
          y="62"
          textAnchor="start"
          className="fill-muted"
          style={{ fontSize: "9px", letterSpacing: "0.08em" }}
          stroke="none"
        >
          body
        </text>
        <text
          x="230"
          y="75"
          textAnchor="start"
          className="fill-muted"
          style={{ fontSize: "9px", letterSpacing: "0.08em" }}
          stroke="none"
        >
          bitterness
        </text>
      </g>
    </svg>
  );
}
