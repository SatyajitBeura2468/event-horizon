import { useMemo } from "react";
import * as THREE from "three";
import type { QualityMode } from "../lib/performance";

type StarfieldProps = {
  quality: QualityMode;
};

export function Starfield({ quality }: StarfieldProps) {
  const positions = useMemo(() => {
    const count = quality === "ultra" ? 180 : 90;
    const data = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const seed = Math.sin(i * 91.17) * 43758.5453;
      const seed2 = Math.sin(i * 37.31 + 4.9) * 24634.6345;
      data[i * 3] = (seed - Math.floor(seed)) * 2.6 - 1.3;
      data[i * 3 + 1] = (seed2 - Math.floor(seed2)) * 1.8 - 0.9;
      data[i * 3 + 2] = 0.08;
    }

    return data;
  }, [quality]);

  return (
    <points renderOrder={3} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#dfe6ec"
        size={quality === "ultra" ? 0.0045 : 0.0035}
        transparent
        opacity={0.32}
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
