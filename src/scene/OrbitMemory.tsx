import type { ObserverTrailPoint } from "../lib/blackHoleMath";

type OrbitMemoryProps = {
  enabled: boolean;
  points: ObserverTrailPoint[];
};

export function OrbitMemory({ enabled, points }: OrbitMemoryProps) {
  if (!enabled || points.length < 2) {
    return null;
  }

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg className="orbit-memory" aria-hidden="true">
      <path className="orbit-memory__trail" d={path} />
      {points.slice(-8).map((point) => (
        <circle
          key={point.id}
          className="orbit-memory__sample"
          cx={point.x}
          cy={point.y}
          r={Math.max(1.5, 4 - point.age * 0.4)}
        />
      ))}
    </svg>
  );
}
