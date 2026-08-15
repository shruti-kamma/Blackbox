// Abstract three-node ecosystem visual — People / Policy / Partnerships
// converging on Opportunity — used by both the hero and the signature
// People-Policy-Partnerships section, per the brief's explicit request
// for an abstract visual instead of stock photography. Subtle pulse on
// the center node; global prefers-reduced-motion handling in
// packages/config/tailwind/theme.css already neutralizes it for users
// who need that.
export function EcosystemVisual({ className }: { className?: string }) {
  const nodes = [
    { label: "People", x: 100, y: 40 },
    { label: "Policy", x: 40, y: 150 },
    { label: "Partnerships", x: 160, y: 150 },
  ];

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="People, Policy and Partnerships converging on Opportunity">
      {nodes.map((node) => (
        <line
          key={node.label}
          x1={node.x}
          y1={node.y}
          x2={100}
          y2={110}
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
      ))}
      {nodes.map((node) => (
        <g key={node.label}>
          <circle cx={node.x} cy={node.y} r="26" fill="var(--color-muted)" stroke="var(--color-border)" />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontWeight="600"
            fill="var(--color-foreground)"
          >
            {node.label}
          </text>
        </g>
      ))}
      <circle cx="100" cy="110" r="34" fill="url(#ecosystem-gradient)" className="animate-pulse" />
      <text x="100" y="110" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="var(--color-primary-foreground)">
        Opportunity
      </text>
      <defs>
        <linearGradient id="ecosystem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-secondary)" />
          <stop offset="100%" stopColor="var(--color-primary)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
