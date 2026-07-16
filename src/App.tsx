import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BlackHoleCanvas, type VisualLayers } from "./scene/BlackHoleCanvas";
import type { ObserverSnapshot } from "./scene/CameraRig";
import { ControlDock } from "./components/ControlDock";
import { FallbackExperience } from "./components/FallbackExperience";
import { HelpOverlay } from "./components/HelpOverlay";
import { ImmersionMode } from "./components/ImmersionMode";
import { Loader } from "./components/Loader";
import { ObservatoryHUD } from "./components/ObservatoryHUD";
import { QualityControl } from "./components/QualityControl";
import { ScienceDrawer } from "./components/ScienceDrawer";
import { approximationNotice } from "./data/scienceContent";
import {
  blackHoleMoments,
  massPresets,
  observationPresets,
  timeModes,
  type AccretionRate,
  type MassPresetId,
  type ObserverTarget,
  type TimeMode,
} from "./data/presets";
import { useAdaptiveQuality } from "./hooks/useAdaptiveQuality";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { clamp, scaleReferenceForMass, type ObserverTrailPoint, type ProbePath } from "./lib/blackHoleMath";
import { detectWebGL } from "./lib/performance";
import { computeBlackHoleMetrics } from "./lib/physics";

const defaultLayers: VisualLayers = {
  accretionDisk: true,
  photonRing: true,
  doppler: true,
  lensingGrid: false,
  orbitMemory: true,
};

export default function App() {
  const reducedMotion = useReducedMotion();
  const adaptiveQuality = useAdaptiveQuality();
  const hasWebGL = useMemo(() => detectWebGL(), []);
  const [observer, setObserver] = useState<ObserverTarget>(observationPresets.orbital);
  const [observerSnapshot, setObserverSnapshot] = useState<ObserverSnapshot>({
    inclination: observationPresets.orbital.inclination,
    azimuth: observationPresets.orbital.azimuth,
    zoom: observationPresets.orbital.zoom,
  });
  const [massPreset, setMassPreset] = useState<MassPresetId>("sagittarius");
  const [accretionRate, setAccretionRate] = useState<AccretionRate>("active");
  const [timeMode, setTimeMode] = useState<TimeMode>("1x");
  const [layers, setLayers] = useState<VisualLayers>(defaultLayers);
  const [photonProbeActive, setPhotonProbeActive] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [scienceOpen, setScienceOpen] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [immersion, setImmersion] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [probes, setProbes] = useState<ProbePath[]>([]);
  const [trail, setTrail] = useState<ObserverTrailPoint[]>([]);
  const [scaleMessage, setScaleMessage] = useState<string | null>(scaleReferenceForMass("sagittarius"));
  const [momentMessage, setMomentMessage] = useState<string | null>(null);
  const lastTrailObserver = useRef(observerSnapshot);

  const metrics = useMemo(
    () => computeBlackHoleMetrics(massPresets[massPreset].solarMasses),
    [massPreset],
  );

  const timeSpeed = timeModes[timeMode].speed;

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!scaleMessage) {
      return;
    }

    const timer = window.setTimeout(() => setScaleMessage(null), 8200);
    return () => window.clearTimeout(timer);
  }, [scaleMessage]);

  useEffect(() => {
    if (!momentMessage) {
      return;
    }

    const timer = window.setTimeout(() => setMomentMessage(null), 9000);
    return () => window.clearTimeout(timer);
  }, [momentMessage]);

  useEffect(() => {
    if (!layers.orbitMemory || immersion) {
      return;
    }

    const interval = window.setInterval(() => {
      const last = lastTrailObserver.current;
      const motion =
        Math.abs(observerSnapshot.azimuth - last.azimuth) +
        Math.abs(observerSnapshot.inclination - last.inclination) * 0.018 +
        Math.abs(observerSnapshot.zoom - last.zoom);

      lastTrailObserver.current = observerSnapshot;

      if (motion > 0.32) {
        setTrail((current) =>
          current
            .map((point) => ({ ...point, age: point.age + 0.55 }))
            .filter((point) => point.age < 10),
        );
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const size = Math.min(width, height);
      const centerX = width * (width <= 760 ? 0.5 : 0.58);
      const centerY = height * 0.5;
      const radius = size * (0.18 + Math.sin((observerSnapshot.inclination / 85) * Math.PI * 0.5) * 0.08);
      const x = centerX + Math.cos(observerSnapshot.azimuth) * radius;
      const y = centerY + Math.sin(observerSnapshot.azimuth) * radius * 0.36 - (observerSnapshot.inclination - 42) * 0.45;

      setTrail((current) => [
        ...current
          .map((point) => ({ ...point, age: point.age + 0.35 }))
          .filter((point) => point.age < 10)
          .slice(-70),
        {
          id: `trail-${Date.now()}`,
          x: clamp(x, 24, width - 24),
          y: clamp(y, 42, height - 42),
          age: 0,
        },
      ]);
    }, 420);

    return () => window.clearInterval(interval);
  }, [immersion, layers.orbitMemory, observerSnapshot]);

  const closeTopLayer = useCallback(() => {
    if (immersion) {
      setImmersion(false);
      return;
    }

    if (guideOpen || scienceOpen || qualityOpen) {
      setGuideOpen(false);
      setScienceOpen(false);
      setQualityOpen(false);
    }
  }, [guideOpen, immersion, qualityOpen, scienceOpen]);

  const resetObservation = useCallback(() => {
    setObserver(observationPresets.orbital);
    setAccretionRate("active");
    setTimeMode("1x");
    setLayers(defaultLayers);
    setPhotonProbeActive(false);
    setProbes([]);
    setTrail([]);
    setMomentMessage(null);
    setScaleMessage(scaleReferenceForMass(massPreset));
  }, [massPreset]);

  const onLayerChange = useCallback((layer: keyof VisualLayers, value: boolean) => {
    setLayers((current) => ({ ...current, [layer]: value }));
  }, []);

  const onMassPresetChange = useCallback((preset: MassPresetId) => {
    setMassPreset(preset);
    setScaleMessage(scaleReferenceForMass(preset));
  }, []);

  const onMoment = useCallback((moment: (typeof blackHoleMoments)[number]) => {
    setObserver(moment.observer);
    setMomentMessage(moment.sentence);

    if (moment.id === "edge-distortion" || moment.id === "einstein-ring") {
      setLayers((current) => ({ ...current, lensingGrid: true, photonRing: true }));
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void document.documentElement.requestFullscreen();
  }, []);

  const shortcutHandlers = useMemo(
    () => ({
      toggleGuide: () => setGuideOpen((value) => !value),
      toggleControls: () => setControlsOpen((value) => !value),
      toggleGrid: () => setLayers((current) => ({ ...current, lensingGrid: !current.lensingGrid })),
      togglePhotonProbe: () => setPhotonProbeActive((value) => !value),
      toggleImmersion: () => setImmersion((value) => !value),
      togglePause: () => setTimeMode((value) => (value === "pause" ? "1x" : "pause")),
      resetObservation,
      closeTopLayer,
    }),
    [closeTopLayer, resetObservation],
  );

  useKeyboardShortcuts(shortcutHandlers);

  if (!hasWebGL) {
    return <FallbackExperience />;
  }

  return (
    <main className={`app-shell ${immersion ? "app-shell--immersive" : ""}`}>
      <p className="sr-only">{approximationNotice}</p>
      <Suspense fallback={<Loader />}>
        <BlackHoleCanvas
          observer={observer}
          setObserver={setObserver}
          accretionRate={accretionRate}
          timeSpeed={timeSpeed}
          quality={adaptiveQuality.mode}
          dpr={adaptiveQuality.dpr}
          reducedMotion={reducedMotion}
          layers={layers}
          photonProbeActive={photonProbeActive}
          probes={probes}
          setProbes={setProbes}
          trail={trail}
          onObserverChange={setObserverSnapshot}
        />
      </Suspense>

      <ObservatoryHUD
        hidden={immersion}
        controlsOpen={controlsOpen}
        onToggleControls={() => setControlsOpen((value) => !value)}
        onOpenGuide={() => setGuideOpen(true)}
        onOpenScience={() => setScienceOpen(true)}
        onOpenQuality={() => setQualityOpen(true)}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        metrics={metrics}
        massPreset={massPreset}
        inclination={observerSnapshot.inclination}
        momentMessage={momentMessage}
        scaleMessage={scaleMessage}
      />

      <ControlDock
        open={!immersion && controlsOpen}
        observer={observer}
        onObserverChange={setObserver}
        massPreset={massPreset}
        onMassPresetChange={onMassPresetChange}
        accretionRate={accretionRate}
        onAccretionRateChange={setAccretionRate}
        timeMode={timeMode}
        onTimeModeChange={setTimeMode}
        layers={layers}
        onLayerChange={onLayerChange}
        photonProbeActive={photonProbeActive}
        onPhotonProbeToggle={() => setPhotonProbeActive((value) => !value)}
        onMoment={onMoment}
        onReset={resetObservation}
        onClearOrbitMemory={() => setTrail([])}
        quality={adaptiveQuality.mode}
      />

      <ScienceDrawer open={scienceOpen && !immersion} onClose={() => setScienceOpen(false)} />
      <QualityControl
        open={qualityOpen && !immersion}
        mode={adaptiveQuality.mode}
        onModeChange={adaptiveQuality.setMode}
        frameMs={adaptiveQuality.averageFrameMs}
        dpr={adaptiveQuality.dpr}
        constrained={adaptiveQuality.constrained}
        mobileDefault={adaptiveQuality.mobileDefault}
        onClose={() => setQualityOpen(false)}
      />
      <HelpOverlay open={guideOpen && !immersion} onClose={() => setGuideOpen(false)} />
      <ImmersionMode active={immersion} onExit={() => setImmersion(false)} />
    </main>
  );
}
