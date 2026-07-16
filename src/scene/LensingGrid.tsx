import { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { ObserverSnapshot } from "./CameraRig";

type LensingGridProps = {
  enabled: boolean;
  observer: ObserverSnapshot;
};

export function LensingGrid({ enabled, observer }: LensingGridProps) {
  const ringPoints = useMemo(() => {
    return Array.from({ length: 128 }, (_, index) => {
      const angle = (index / 127) * Math.PI * 2;
      return [Math.cos(angle) * 0.34, Math.sin(angle) * 0.34, 0.11] as [number, number, number];
    });
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <group rotation-z={observer.azimuth * 0.06} renderOrder={4}>
      <Line
        points={ringPoints}
        color="#f4c36f"
        lineWidth={1}
        transparent
        opacity={0.34}
        depthWrite={false}
        depthTest={false}
      />
    </group>
  );
}
