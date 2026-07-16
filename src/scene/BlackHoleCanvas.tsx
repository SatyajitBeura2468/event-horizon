import { Suspense, useCallback, useEffect, useMemo, useRef, type PointerEvent, type WheelEvent } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { blackHoleFragment } from "../shaders/blackHoleFragment";
import { blackHoleVertex } from "../shaders/blackHoleVertex";
import { createBlackHoleUniforms } from "./BlackHoleShaderMaterial";
import { CameraRig, type ObserverSnapshot } from "./CameraRig";
import { LensingGrid } from "./LensingGrid";
import { OrbitMemory } from "./OrbitMemory";
import { PhotonProbe } from "./PhotonProbe";
import { Starfield } from "./Starfield";
import { accretionRates, type AccretionRate, type ObserverTarget } from "../data/presets";
import { clamp, createPhotonProbePath, type ObserverTrailPoint, type ProbePath } from "../lib/blackHoleMath";
import type { QualityMode } from "../lib/performance";

export type VisualLayers = {
  accretionDisk: boolean;
  photonRing: boolean;
  doppler: boolean;
  redshift: boolean;
  lensingGrid: boolean;
  orbitMemory: boolean;
};

type BlackHoleCanvasProps = {
  observer: ObserverTarget;
  setObserver: (updater: ObserverTarget | ((observer: ObserverTarget) => ObserverTarget)) => void;
  accretionRate: AccretionRate;
  timeSpeed: number;
  quality: QualityMode;
  dpr: number;
  reducedMotion: boolean;
  layers: VisualLayers;
  photonProbeActive: boolean;
  probes: ProbePath[];
  setProbes: (updater: ProbePath[] | ((probes: ProbePath[]) => ProbePath[])) => void;
  trail: ObserverTrailPoint[];
  onObserverChange: (observer: ObserverSnapshot) => void;
  onProbeLaunch: () => void;
};

type ShaderPlaneProps = {
  observerRef: React.MutableRefObject<ObserverSnapshot>;
  accretionRate: AccretionRate;
  timeSpeed: number;
  quality: QualityMode;
  reducedMotion: boolean;
  layers: VisualLayers;
  centerShift: number;
};

function ShaderPlane({
  observerRef,
  accretionRate,
  timeSpeed,
  quality,
  reducedMotion,
  layers,
  centerShift,
}: ShaderPlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const uniforms = useMemo(() => createBlackHoleUniforms(), []);
  const { size } = useThree();

  useFrame((_state, delta) => {
    const material = materialRef.current;

    if (!material) {
      return;
    }

    uniforms.uResolution.value.set(size.width, size.height);
    uniforms.uTime.value += delta * timeSpeed;
    uniforms.uObserverInclination.value = observerRef.current.inclination;
    uniforms.uObserverAzimuth.value = observerRef.current.azimuth;
    uniforms.uZoom.value = observerRef.current.zoom;
    uniforms.uAccretion.value = accretionRates[accretionRate].shaderValue;
    uniforms.uQuality.value = quality === "ultra" ? 1 : 0;
    uniforms.uReducedMotion.value = reducedMotion ? 1 : 0;
    uniforms.uDiskEnabled.value = layers.accretionDisk ? 1 : 0;
    uniforms.uPhotonRingEnabled.value = layers.photonRing ? 1 : 0;
    uniforms.uDopplerEnabled.value = layers.doppler ? 1 : 0;
    uniforms.uRedshiftEnabled.value = layers.redshift ? 1 : 0;
    uniforms.uLensingGridEnabled.value = layers.lensingGrid ? 1 : 0;
    uniforms.uCenterShift.value = centerShift;
  });

  return (
    <mesh frustumCulled={false} renderOrder={1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        args={[{ uniforms, vertexShader: blackHoleVertex, fragmentShader: blackHoleFragment }]}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function Scene({
  observer,
  accretionRate,
  timeSpeed,
  quality,
  reducedMotion,
  layers,
  centerShift,
  onObserverChange,
}: Omit<BlackHoleCanvasProps, "setObserver" | "dpr" | "photonProbeActive" | "probes" | "setProbes" | "trail" | "onProbeLaunch"> & {
  centerShift: number;
}) {
  const observerRef = useRef<ObserverSnapshot>({
    inclination: observer.inclination,
    azimuth: observer.azimuth,
    zoom: observer.zoom,
  });

  return (
    <>
      <CameraRig
        target={observer}
        observerRef={observerRef}
        reducedMotion={reducedMotion}
        onObserverChange={onObserverChange}
      />
      <ShaderPlane
        observerRef={observerRef}
        accretionRate={accretionRate}
        timeSpeed={timeSpeed}
        quality={quality}
        reducedMotion={reducedMotion}
        layers={layers}
        centerShift={centerShift}
      />
      <Starfield quality={quality} />
      <LensingGrid enabled={layers.lensingGrid} observer={observerRef.current} />
      <EffectComposer multisampling={quality === "ultra" ? 4 : 0}>
        <Bloom intensity={quality === "ultra" ? 0.22 : 0.14} luminanceThreshold={0.56} luminanceSmoothing={0.16} />
        <Vignette eskil={false} offset={0.34} darkness={0.52} />
      </EffectComposer>
    </>
  );
}

export function BlackHoleCanvas({
  observer,
  setObserver,
  accretionRate,
  timeSpeed,
  quality,
  dpr,
  reducedMotion,
  layers,
  photonProbeActive,
  probes,
  setProbes,
  trail,
  onObserverChange,
  onProbeLaunch,
}: BlackHoleCanvasProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0, time: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const inertia = useRef<number | null>(null);
  const centerShift = 0.5;

  useEffect(() => {
    return () => {
      if (inertia.current !== null) {
        window.cancelAnimationFrame(inertia.current);
      }
    };
  }, []);

  const stopInertia = useCallback(() => {
    if (inertia.current !== null) {
      window.cancelAnimationFrame(inertia.current);
      inertia.current = null;
    }
  }, []);

  const launchProbe = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = stageRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const path = createPhotonProbePath(localX, localY, rect.width, rect.height, centerShift);
      setProbes((current) => [...current.slice(-4), path]);
      onProbeLaunch();

      window.setTimeout(() => {
        setProbes((current) => current.filter((probe) => probe.id !== path.id));
      }, 4200);
    },
    [centerShift, onProbeLaunch, setProbes],
  );

  const updateObserverFromDrag = useCallback(
    (dx: number, dy: number) => {
      setObserver((current) => ({
        ...current,
        preset: "free",
        azimuth: current.azimuth + dx * 0.006,
        inclination: clamp(current.inclination + dy * 0.13, 0, 85),
      }));
    },
    [setObserver],
  );

  const startInertia = useCallback(() => {
    if (reducedMotion) {
      return;
    }

    const step = () => {
      velocity.current.x *= 0.91;
      velocity.current.y *= 0.91;

      if (Math.abs(velocity.current.x) < 0.04 && Math.abs(velocity.current.y) < 0.04) {
        inertia.current = null;
        return;
      }

      updateObserverFromDrag(velocity.current.x, velocity.current.y);
      inertia.current = window.requestAnimationFrame(step);
    };

    inertia.current = window.requestAnimationFrame(step);
  }, [reducedMotion, updateObserverFromDrag]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (photonProbeActive) {
        launchProbe(event);
        return;
      }

      stopInertia();
      dragging.current = true;
      lastPointer.current = { x: event.clientX, y: event.clientY, time: performance.now() };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [launchProbe, photonProbeActive, stopInertia],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) {
        return;
      }

      const now = performance.now();
      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      const dt = Math.max(16, now - lastPointer.current.time);
      velocity.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 };
      updateObserverFromDrag(dx, dy);
      lastPointer.current = { x: event.clientX, y: event.clientY, time: now };
    },
    [updateObserverFromDrag],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) {
        return;
      }

      dragging.current = false;
      event.currentTarget.releasePointerCapture(event.pointerId);
      startInertia();
    },
    [startInertia],
  );

  const onWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      setObserver((current) => ({
        ...current,
        preset: "free",
        zoom: clamp(current.zoom - event.deltaY * 0.0012, 0.68, 1.72),
      }));
    },
    [setObserver],
  );

  return (
    <div
      ref={stageRef}
      className={`black-hole-stage ${photonProbeActive ? "black-hole-stage--probe" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      role="application"
      aria-label="Interactive Schwarzschild black hole visualisation. Drag to orbit, scroll to approach or retreat."
    >
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
        gl={{
          antialias: quality === "ultra",
          powerPreference: "high-performance",
          alpha: false,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.setClearColor("#020305", 1);
        }}
      >
        <Suspense fallback={null}>
          <Scene
            observer={observer}
            accretionRate={accretionRate}
            timeSpeed={timeSpeed}
            quality={quality}
            reducedMotion={reducedMotion}
            layers={layers}
            centerShift={centerShift}
            onObserverChange={onObserverChange}
          />
        </Suspense>
      </Canvas>
      <PhotonProbe active={photonProbeActive} probes={probes} />
      <OrbitMemory enabled={layers.orbitMemory} points={trail} />
    </div>
  );
}
