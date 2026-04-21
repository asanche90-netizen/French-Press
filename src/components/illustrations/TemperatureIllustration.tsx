export default function TemperatureIllustration() {
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
      {/* thermometer tube */}
      <rect x="132" y="36" width="16" height="116" rx="8" />
      {/* bulb */}
      <circle cx="140" cy="162" r="14" />
      {/* bulb fill */}
      <circle cx="140" cy="162" r="8" fill="currentColor" stroke="none" />
      {/* mercury column (inside tube) - subtle */}
      <line x1="140" y1="150" x2="140" y2="150" />

      {/* tick marks */}
      <line x1="116" y1="50" x2="128" y2="50" />
      <line x1="116" y1="90" x2="128" y2="90" />
      <line x1="116" y1="130" x2="128" y2="130" />

      {/* labels */}
      <text
        x="110"
        y="53"
        textAnchor="end"
        className="fill-muted"
        style={{ fontSize: "10px", letterSpacing: "0.12em" }}
        stroke="none"
      >
        LIGHT
      </text>
      <text
        x="110"
        y="93"
        textAnchor="end"
        className="fill-muted"
        style={{ fontSize: "10px", letterSpacing: "0.12em" }}
        stroke="none"
      >
        MEDIUM
      </text>
      <text
        x="110"
        y="133"
        textAnchor="end"
        className="fill-muted"
        style={{ fontSize: "10px", letterSpacing: "0.12em" }}
        stroke="none"
      >
        DARK
      </text>

      {/* traveling indicator dot */}
      <circle
        cx="140"
        cy="50"
        r="4"
        fill="currentColor"
        stroke="none"
        style={
          {
            transformBox: "view-box",
            animation:
              "temp-travel 2.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
            "--mid": "40px",
            "--end": "80px",
          } as React.CSSProperties
        }
      />
    </svg>
  );
}
