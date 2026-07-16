import * as THREE from "three";

export type BlackHoleUniforms = {
  uResolution: THREE.IUniform<THREE.Vector2>;
  uTime: THREE.IUniform<number>;
  uObserverInclination: THREE.IUniform<number>;
  uObserverAzimuth: THREE.IUniform<number>;
  uZoom: THREE.IUniform<number>;
  uAccretion: THREE.IUniform<number>;
  uQuality: THREE.IUniform<number>;
  uReducedMotion: THREE.IUniform<number>;
  uDiskEnabled: THREE.IUniform<number>;
  uPhotonRingEnabled: THREE.IUniform<number>;
  uDopplerEnabled: THREE.IUniform<number>;
  uLensingGridEnabled: THREE.IUniform<number>;
  uCenterShift: THREE.IUniform<number>;
};

export function createBlackHoleUniforms(): BlackHoleUniforms {
  return {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uObserverInclination: { value: 42 },
    uObserverAzimuth: { value: 0 },
    uZoom: { value: 1 },
    uAccretion: { value: 0.78 },
    uQuality: { value: 1 },
    uReducedMotion: { value: 0 },
    uDiskEnabled: { value: 1 },
    uPhotonRingEnabled: { value: 1 },
    uDopplerEnabled: { value: 1 },
    uLensingGridEnabled: { value: 0 },
    uCenterShift: { value: 0.58 },
  };
}
