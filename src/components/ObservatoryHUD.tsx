import { Expand, Gauge, HelpCircle, Maximize2, Minimize2, SlidersHorizontal } from "lucide-react";
import type { BlackHoleMetrics } from "../lib/physics";
import type { MassPresetId } from "../data/presets";
import { TelemetryPanel } from "./TelemetryPanel";

type ObservatoryHUDProps = {
  hidden: boolean;
  controlsOpen: boolean;
  onToggleControls: () => void;
  onOpenGuide: () => void;
  onOpenScience: () => void;
  onOpenQuality: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  metrics: BlackHoleMetrics;
  massPreset: MassPresetId;
  inclination: number;
  momentMessage: string | null;
  scaleMessage: string | null;
};

export function ObservatoryHUD({
  hidden,
  controlsOpen,
  onToggleControls,
  onOpenGuide,
  onOpenScience,
  onOpenQuality,
  onToggleFullscreen,
  isFullscreen,
  metrics,
  massPreset,
  inclination,
  momentMessage,
  scaleMessage,
}: ObservatoryHUDProps) {
  return (
    <div className={`observatory-hud ${hidden ? "observatory-hud--hidden" : ""}`}>
      <header className="brand-lockup" aria-label="Event Horizon Observatory">
        <div className="brand-lockup__mark" aria-hidden="true" />
        <div>
          <p>EVENT HORIZON</p>
          <h1>OBSERVATORY / SCHWARZSCHILD VISUAL LAB</h1>
          <span className="active-signal" aria-label="Observation active">
            <span aria-hidden="true" /> OBSERVATION ACTIVE
          </span>
        </div>
      </header>

      <nav className="top-actions" aria-label="Observatory actions">
        <button type="button" onClick={onOpenGuide}>
          <HelpCircle size={16} aria-hidden="true" />
          Guide
        </button>
        <button type="button" onClick={onOpenScience}>
          <Expand size={16} aria-hidden="true" />
          Science
        </button>
        <button type="button" onClick={onOpenQuality}>
          <Gauge size={16} aria-hidden="true" />
          Quality
        </button>
        <button type="button" onClick={onToggleControls} aria-pressed={controlsOpen}>
          <SlidersHorizontal size={16} aria-hidden="true" />
          Controls
        </button>
        <button type="button" onClick={onToggleFullscreen}>
          {isFullscreen ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
          Fullscreen
        </button>
      </nav>

      <TelemetryPanel metrics={metrics} massPreset={massPreset} inclination={inclination} />

      <div className="interaction-hint" aria-live="polite">
        Drag to orbit · Scroll to approach
      </div>

      {(momentMessage || scaleMessage) && (
        <section className="revelation-panel" aria-live="polite">
          {momentMessage ? <p>{momentMessage}</p> : null}
          {scaleMessage ? <p>{scaleMessage}</p> : null}
        </section>
      )}
    </div>
  );
}
