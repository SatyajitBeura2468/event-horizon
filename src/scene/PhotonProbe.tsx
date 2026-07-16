import type { ProbePath } from "../lib/blackHoleMath";

type PhotonProbeProps = {
  active: boolean;
  probes: ProbePath[];
};

export function PhotonProbe({ active, probes }: PhotonProbeProps) {
  return (
    <svg className="probe-layer" aria-hidden={!active && probes.length === 0}>
      <defs>
        <filter id="probe-glow">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {probes.map((probe) => (
        <g key={probe.id} className="probe-path">
          <path className="probe-path__wake" d={probe.d} />
          <path className="probe-path__core" d={probe.d} />
          <circle className="probe-path__packet" r="3.2" filter="url(#probe-glow)">
            <animateMotion dur="2.2s" fill="freeze" path={probe.dotPath} />
          </circle>
          <text className="probe-path__label" x={probe.labelX} y={probe.labelY}>
            {probe.classification}
          </text>
        </g>
      ))}
    </svg>
  );
}
