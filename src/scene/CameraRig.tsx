import { MutableRefObject, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { damp } from "../lib/blackHoleMath";
import type { ObserverTarget } from "../data/presets";

export type ObserverSnapshot = {
  inclination: number;
  azimuth: number;
  zoom: number;
};

type CameraRigProps = {
  target: ObserverTarget;
  observerRef: MutableRefObject<ObserverSnapshot>;
  reducedMotion: boolean;
  onObserverChange: (observer: ObserverSnapshot) => void;
};

export function CameraRig({ target, observerRef, reducedMotion, onObserverChange }: CameraRigProps) {
  const lastEmit = useRef(0);

  useFrame((state, delta) => {
    const lambda = reducedMotion ? 16 : 2.6;
    observerRef.current.inclination = damp(observerRef.current.inclination, target.inclination, lambda, delta);
    observerRef.current.azimuth = damp(observerRef.current.azimuth, target.azimuth, lambda, delta);
    observerRef.current.zoom = damp(observerRef.current.zoom, target.zoom, lambda, delta);

    if (state.clock.elapsedTime - lastEmit.current > 0.08) {
      lastEmit.current = state.clock.elapsedTime;
      onObserverChange({ ...observerRef.current });
    }
  });

  return null;
}
