import { Crosshair, Eye, Pause, Play, RotateCcw, Satellite, Trash2 } from "lucide-react";
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
import type { VisualLayers } from "../scene/BlackHoleCanvas";
import type { QualityMode } from "../lib/performance";

type ControlDockProps = {
  open: boolean;
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
  photonProbeActive: boolean;
  onPhotonProbeToggle: () => void;
  onMoment: (moment: (typeof blackHoleMoments)[number]) => void;
  onReset: () => void;
  onClearOrbitMemory: () => void;
  quality: QualityMode;
};

const layerLabels: Record<keyof VisualLayers, string> = {
  accretionDisk: "Accretion Disk",
  photonRing: "Photon Ring",
  doppler: "Doppler Beaming",
  lensingGrid: "Lensing Grid",
  orbitMemory: "Orbit Memory",
};

export function ControlDock({
  open,
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
  photonProbeActive,
  onPhotonProbeToggle,
  onMoment,
  onReset,
  onClearOrbitMemory,
  quality,
}: ControlDockProps) {
  return (
    <aside className={`control-dock ${open ? "control-dock--open" : ""}`} aria-label="Observation controls">
      <div className="control-dock__inner">
        <div className="dock-heading">
          <Satellite size={17} aria-hidden="true" />
          <span>Observer Controls</span>
          <small>{quality}</small>
        </div>

        <section className="control-group" aria-labelledby="preset-label">
          <h2 id="preset-label">Observation Preset</h2>
          <div className="segmented-grid">
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
        </section>

        <section className="control-group" aria-labelledby="inclination-label">
          <div className="control-row">
            <h2 id="inclination-label">Inclination</h2>
            <span>{Math.round(observer.inclination)} deg</span>
          </div>
          <input
            aria-labelledby="inclination-label"
            type="range"
            min="0"
            max="85"
            value={observer.inclination}
            onChange={(event) =>
              onObserverChange({ ...observer, preset: "free", inclination: Number(event.currentTarget.value) })
            }
          />
        </section>

        <section className="control-group" aria-labelledby="mass-label">
          <h2 id="mass-label">System Mass</h2>
          <div className="mass-stack">
            {(Object.keys(massPresets) as MassPresetId[]).map((preset) => (
              <button
                type="button"
                key={preset}
                className={massPreset === preset ? "is-selected" : ""}
                onClick={() => onMassPresetChange(preset)}
              >
                <span>{massPresets[preset].label}</span>
                <small>{massPresets[preset].shortLabel}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="control-group" aria-labelledby="accretion-label">
          <h2 id="accretion-label">Accretion Rate</h2>
          <div className="segmented-grid segmented-grid--three">
            {(Object.keys(accretionRates) as AccretionRate[]).map((rate) => (
              <button
                type="button"
                key={rate}
                className={accretionRate === rate ? "is-selected" : ""}
                onClick={() => onAccretionRateChange(rate)}
              >
                {accretionRates[rate].label}
              </button>
            ))}
          </div>
        </section>

        <section className="control-group" aria-labelledby="time-label">
          <h2 id="time-label">Simulation Time</h2>
          <div className="segmented-grid">
            {(Object.keys(timeModes) as TimeMode[]).map((mode) => (
              <button
                type="button"
                key={mode}
                className={timeMode === mode ? "is-selected" : ""}
                onClick={() => onTimeModeChange(mode)}
              >
                {mode === "pause" ? <Pause size={13} aria-hidden="true" /> : mode === "1x" ? <Play size={13} aria-hidden="true" /> : null}
                {timeModes[mode].label}
              </button>
            ))}
          </div>
        </section>

        <section className="control-group" aria-labelledby="layers-label">
          <div className="control-row">
            <h2 id="layers-label">Visual Layers</h2>
            <Eye size={15} aria-hidden="true" />
          </div>
          <div className="toggle-stack">
            {(Object.keys(layerLabels) as (keyof VisualLayers)[]).map((layer) => (
              <label key={layer} className="toggle-line">
                <input
                  type="checkbox"
                  checked={layers[layer]}
                  onChange={(event) => onLayerChange(layer, event.currentTarget.checked)}
                />
                <span>{layerLabels[layer]}</span>
              </label>
            ))}
          </div>
          <button type="button" className="quiet-command" onClick={onClearOrbitMemory}>
            <Trash2 size={14} aria-hidden="true" />
            Clear orbit memory
          </button>
        </section>

        <section className="control-group" aria-labelledby="probe-label">
          <h2 id="probe-label">Photon Probe</h2>
          <button
            type="button"
            className={`probe-command ${photonProbeActive ? "is-selected" : ""}`}
            onClick={onPhotonProbeToggle}
            aria-pressed={photonProbeActive}
          >
            <Crosshair size={16} aria-hidden="true" />
            {photonProbeActive ? "Probe Armed" : "Activate Probe"}
          </button>
        </section>

        <section className="control-group" aria-labelledby="moments-label">
          <h2 id="moments-label">Black-Hole Moments</h2>
          <div className="moment-stack">
            {blackHoleMoments.map((moment) => (
              <button type="button" key={moment.id} onClick={() => onMoment(moment)}>
                {moment.label}
              </button>
            ))}
          </div>
        </section>

        <button type="button" className="reset-command" onClick={onReset}>
          <RotateCcw size={16} aria-hidden="true" />
          Reset Observation
        </button>
      </div>
    </aside>
  );
}
