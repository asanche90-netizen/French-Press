export default function RatioIllustration() {
  return (
    <svg
      viewBox="0 0 280 180"
      width="280"
      height="180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent"
      aria-hidden="true"
    >
      {/* base plate */}
      <line x1="90" y1="160" x2="190" y2="160" />
      {/* fulcrum column */}
      <line x1="140" y1="160" x2="140" y2="110" />

      {/* tilting beam group */}
      <g
        style={{
          transformOrigin: "140px 96px",
          transformBox: "view-box",
          animation: "balance-tilt 2.2s cubic-bezier(0.4, 0.1, 0.3, 1) forwards",
        }}
      >
        {/* beam */}
        <line x1="50" y1="96" x2="230" y2="96" />
        {/* left pan hangers */}
        <line x1="75" y1="96" x2="75" y2="112" />
        <line x1="75" y1="112" x2="62" y2="128" />
        <line x1="75" y1="112" x2="88" y2="128" />
        {/* left pan */}
        <line x1="58" y1="128" x2="92" y2="128" />
        {/* right pan hangers */}
        <line x1="205" y1="96" x2="205" y2="112" />
        <line x1="205" y1="112" x2="192" y2="128" />
        <line x1="205" y1="112" x2="218" y2="128" />
        {/* right pan */}
        <line x1="188" y1="128" x2="222" y2="128" />

        {/* pivot notch */}
        <circle cx="140" cy="96" r="3" fill="currentColor" stroke="none" />
      </g>

      {/* labels */}
      <text
        x="75"
        y="150"
        textAnchor="middle"
        className="fill-muted"
        style={{ fontSize: "10px", letterSpacing: "0.12em" }}
        stroke="none"
      >
        COFFEE
      </text>
      <text
        x="205"
        y="150"
        textAnchor="middle"
        className="fill-muted"
        style={{ fontSize: "10px", letterSpacing: "0.12em" }}
        stroke="none"
      >
        WATER
      </text>
    </svg>
  );
}
