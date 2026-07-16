import { useState } from "react";
import {
  ChevronDown,
  Crosshair,
  Eye,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  accretionRates,
  blackHoleMoments,
  massPresets,
  observationPresets,
  timeModes,
  type AccretionRate,
  type MassPresetId,
  type ObservationPresetId,
  type ObserverTarget,
  type TimeMode,
} from "../data/presets";
import type { QualityMode } from "../lib/performance";
import type { SimulationParameters, VisualLayers } from "../scene/BlackHoleCanvas";

type ControlDockProps = {
  open: boolean;
  onClose: () => void;
  observer: ObserverTarget;
  onObserverChange: (observer: ObserverTarget) => void;
  massPreset: MassPresetId;
  onMassPresetChange: (preset: MassPresetId) => void;
  accretionRate: AccretionRate;
  onAccretionRateChange: (rate: AccretionRate) => void;
  timeMode: TimeMode;
  onTimeModeChange: (mode: TimeMode) => void;
  layers: VisualLayers;
  onLayerChange: (layer: keyof VisualLayers, value: boolean) => void;
  physics: SimulationParameters;
  onPhysicsChange: (parameter: keyof SimulationParameters, value: number) => void;
  photonProbeActive: boolean;
  onPhotonProbeToggle: () => void;
  onMoment: (moment: (typeof blackHoleMoments)[number]) => void;
  onReset: () => void;
  onClearOrbitMemory: () => void;
  quality: QualityMode;
  soundEnabled: boolean;
  soundVolume: number;
  onSoundToggle: () => void;
  onSoundVolumeChange: (volume: number) => void;
};

const layerLabels: Record<keyof VisualLayers, string> = {
  accretionDisk: "Accretion disk",
  photonRing: "Photon ring",
  doppler: "Doppler beaming",
  redshift: "Gravitational redshift",
  lensingGrid: "Spacetime grid",
  orbitMemory: "Orbit memory",
};

const physicsControls: Array<{
  key: keyof SimulationParameters;
  label: string;
  min: number;
  max: number;
  step: number;
}> = [
  { key: "lensing", label: "Lensing", min: 0.72, max: 1.28, step: 0.01 },
  { key: "diskHeat", label: "Disk heat", min: 0.65, max: 1.4, step: 0.01 },
  { key: "turbulence", label: "Turbulence", min: 0, max: 1.35, step: 0.01 },
  { key: "plasmaDensity", label: "Plasma", min: 0.2, max: 1.35, step: 0.01 },
  { key: "exposure", label: "Exposure", min: 0.45, max: 1.65, step: 0.01 },
];

export function ControlDock({
  open,
  onClose,
  observer,
  onObserverChange,
  massPreset,
  onMassPresetChange,
  accretionRate,
  onAccretionRateChange,
  timeMode,
  onTimeModeChange,
  layers,
  onLayerChange,
  physics,
  onPhysicsChange,
  photonProbeActive,
  onPhotonProbeToggle,
  onMoment,
  onReset,
  onClearOrbitMemory,
  quality,
  soundEnabled,
  soundVolume,
  onSoundToggle,
  onSoundVolumeChange,
}: ControlDockProps) {
  const [advanced, setAdvanced] = useState(false);

  return (
    <aside className={`control-dock ${open ? "control-dock--open" : ""}`} aria-label="Observation controls">
      <div className="control-dock__inner">
        <div className="dock-grip" aria-hidden="true" />
        <div className="command-strip">
          <div className="command-cell command-cell--view">
            <span className="command-label"><Eye size={14} /> View</span>
            <div className="command-options" aria-label="Observation preset">
              {(Object.keys(observationPresets) as ObservationPresetId[]).map((preset) => (
                <button
                  type="button"
                  key={preset}
                  className={observer.preset === preset ? "is-selected" : ""}
                  onClick={() => onObserverChange(observationPresets[preset])}
                >
                  {observationPresets[preset].label}
                </button>
              ))}
            </div>
          </div>

          <div className="command-cell command-cell--inclination">
            <span className="command-label"><Gauge size={14} /> Inclination <strong>{Math.round(observer.inclination)}°</strong></span>
            <input
              aria-label="Observer inclination"
              type="range"
              min="0"
              max="85"
              value={observer.inclination}
              onChange={(event) => onObserverChange({ ...observer, preset: "free", inclination: Number(event.currentTarget.value) })}
            />
          </div>

          <div className="command-cell">
            <span className="command-label"><Sparkles size={14} /> Accretion</span>
            <div className="inline-select">
              {(Object.keys(accretionRates) as AccretionRate[]).map((rate) => (
                <button type="button" key={rate} className={accretionRate === rate ? "is-selected" : ""} onClick={() => onAccretionRateChange(rate)}>
                  {accretionRates[rate].label}
                </button>
              ))}
            </div>
          </div>

          <div className="command-cell command-cell--time">
            <span className="command-label">{timeMode === "pause" ? <Pause size={14} /> : <Play size={14} />} Time</span>
            <div className="inline-select">
              {(Object.keys(timeModes) as TimeMode[]).map((mode) => (
                <button type="button" key={mode} className={timeMode === mode ? "is-selected" : ""} onClick={() => onTimeModeChange(mode)}>
                  {timeModes[mode].label}
                </button>
              ))}
            </div>
          </div>

          <div className="command-cell command-cell--action">
            <span className="command-label"><Crosshair size={14} /> Photon probe</span>
            <button type="button" className={`command-toggle ${photonProbeActive ? "is-selected" : ""}`} onClick={onPhotonProbeToggle} aria-pressed={photonProbeActive}>
              {photonProbeActive ? "Armed" : "Launch"}
            </button>
          </div>

          <div className="command-cell command-cell--sound">
            <span className="command-label">{soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} Sound</span>
            <button type="button" className={`sound-toggle ${soundEnabled ? "is-selected" : ""}`} onClick={onSoundToggle} aria-pressed={soundEnabled} aria-label={soundEnabled ? "Mute observatory sound" : "Enable observatory sound"}>
              <span />
            </button>
          </div>

          <button type="button" className="dock-expand" onClick={() => setAdvanced((current) => !current)} aria-expanded={advanced} aria-label="Toggle advanced controls">
            <SlidersHorizontal size={16} />
            <ChevronDown size={13} className={advanced ? "is-rotated" : ""} />
          </button>
          <button type="button" className="dock-close" onClick={onClose} aria-label="Close controls"><X size={16} /></button>
        </div>

        <div className={`advanced-deck ${advanced ? "advanced-deck--open" : ""}`} aria-hidden={!advanced}>
          <section className="physics-controls">
            <div className="physics-controls__heading">
              <div><h2>Advanced physics</h2><p>Live GPU parameters</p></div>
              <button type="button" onClick={() => physicsControls.forEach((control) => onPhysicsChange(control.key, defaultPhysicsValue(control.key)))}>Reset physics</button>
            </div>
            <div className="physics-controls__grid">
              {physicsControls.map((control) => (
                <label key={control.key}>
                  <span>{control.label}<strong>{physics[control.key].toFixed(2)}</strong></span>
                  <input
                    aria-label={control.label}
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={physics[control.key]}
                    onChange={(event) => onPhysicsChange(control.key, Number(event.currentTarget.value))}
                  />
                </label>
              ))}
            </div>
          </section>
          <section>
            <h2>Target mass</h2>
            <div className="advanced-options">
              {(Object.keys(massPresets) as MassPresetId[]).map((preset) => (
                <button type="button" key={preset} className={massPreset === preset ? "is-selected" : ""} onClick={() => onMassPresetChange(preset)}>
                  <span>{massPresets[preset].label}</span><small>{massPresets[preset].shortLabel}</small>
                </button>
              ))}
            </div>
          </section>
          <section>
            <h2>Relativistic layers</h2>
            <div className="layer-options">
              {(Object.keys(layerLabels) as (keyof VisualLayers)[]).map((layer) => (
                <label key={layer}><input type="checkbox" checked={layers[layer]} onChange={(event) => onLayerChange(layer, event.currentTarget.checked)} /><span>{layerLabels[layer]}</span></label>
              ))}
            </div>
          </section>
          <section>
            <h2>Cinematic observations</h2>
            <div className="advanced-options">
              {blackHoleMoments.map((moment) => <button type="button" key={moment.id} onClick={() => onMoment(moment)}>{moment.label}</button>)}
            </div>
          </section>
          <section className="deck-utilities">
            <h2>Instrument</h2>
            <label className="volume-control">Volume <input type="range" min="0" max="1" step="0.01" value={soundVolume} disabled={!soundEnabled} onChange={(event) => onSoundVolumeChange(Number(event.currentTarget.value))} /></label>
            <span className="quality-chip">{quality} render</span>
            <div><button type="button" onClick={onClearOrbitMemory}>Clear trail</button><button type="button" onClick={onReset}><RotateCcw size={13} /> Reset</button></div>
          </section>
        </div>
      </div>
    </aside>
  );
}

function defaultPhysicsValue(parameter: keyof SimulationParameters): number {
  const defaults: SimulationParameters = {
    lensing: 1,
    diskHeat: 0.9,
    turbulence: 1.05,
    plasmaDensity: 0.5,
    exposure: 0.82,
  };

  return defaults[parameter];
}
