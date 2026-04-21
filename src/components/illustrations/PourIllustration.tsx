export default function PourIllustration() {
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
      {/* ===== French press on left ===== */}
      {/* plunger handle (top knob) */}
      <line x1="70" y1="22" x2="70" y2="38" />
      <line x1="62" y1="38" x2="78" y2="38" />
      {/* plunger shaft */}
      <line x1="70" y1="38" x2="70" y2="62" />
      {/* lid */}
      <path d="M48 62 L92 62 L92 70 L48 70 Z" />
      {/* spout (slight curve on upper right) */}
      <path d="M92 65 Q 105 68 108 76" />
      {/* glass body */}
      <path d="M50 70 L50 155 Q 50 165 60 165 L82 165 Q 92 165 92 155 L92 70" />
      {/* base plate */}
      <line x1="45" y1="168" x2="97" y2="168" />

      {/* press content (draining) */}
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "center bottom",
          animation:
            "press-drain 2.2s cubic-bezier(0.4, 0.0, 0.2, 1) 200ms forwards",
        }}
      >
        <rect
          x="53"
          y="90"
          width="36"
          height="72"
          fill="currentColor"
          opacity="0.85"
          stroke="none"
          rx="2"
        />
      </g>

      {/* ===== stream ===== */}
      <path
        d="M 108 78 Q 140 90 170 110 Q 180 118 185 130"
        stroke="currentColor"
        strokeDasharray="1"
        pathLength="1"
        strokeDashoffset="1"
        fill="none"
        style={
          {
            animation: "stream-flow 1.8s ease-in-out 100ms forwards",
            "--dash": "1",
          } as React.CSSProperties
        }
      />

      {/* ===== mug on right ===== */}
      {/* mug body */}
      <path d="M170 100 L170 160 Q 170 172 182 172 L218 172 Q 230 172 230 160 L230 100 Z" />
      {/* mug rim */}
      <line x1="168" y1="100" x2="232" y2="100" />
      {/* mug handle */}
      <path d="M230 112 Q 252 115 252 135 Q 252 155 230 155" />

      {/* mug content (filling) */}
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "center bottom",
          animation:
            "mug-fill 1.9s cubic-bezier(0.3, 0.0, 0.4, 1) 500ms forwards",
        }}
      >
        <path
          d="M172 108 L172 160 Q 172 170 182 170 L218 170 Q 228 170 228 160 L228 108 Z"
          fill="currentColor"
          opacity="0.85"
          stroke="none"
        />
      </g>
    </svg>
  );
}
