import { X } from "lucide-react";
import type { QualityMode } from "../lib/performance";

type QualityControlProps = {
  open: boolean;
  mode: QualityMode;
  onModeChange: (mode: QualityMode) => void;
  frameMs: number;
  dpr: number;
  constrained: boolean;
  mobileDefault: boolean;
  onClose: () => void;
};

export function QualityControl({
  open,
  mode,
  onModeChange,
  frameMs,
  dpr,
  constrained,
  mobileDefault,
  onClose,
}: QualityControlProps) {
  return (
    <aside className={`drawer quality-drawer ${open ? "drawer--open" : ""}`} aria-hidden={!open} aria-label="Quality controls">
      <div className="drawer__header">
        <div>
          <span>Rendering Quality</span>
          <h2>Optics and performance</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close quality controls">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="quality-options">
        <button type="button" className={mode === "balanced" ? "is-selected" : ""} onClick={() => onModeChange("balanced")}>
          <strong>Balanced</strong>
          <span>Lower DPR, leaner bloom, reduced star density, core shader intact.</span>
        </button>
        <button type="button" className={mode === "ultra" ? "is-selected" : ""} onClick={() => onModeChange("ultra")}>
          <strong>Ultra</strong>
          <span>Higher DPR, richer turbulence, denser starfield, smoother bloom.</span>
        </button>
      </div>
      <dl className="quality-readout">
        <div>
          <dt>Average frame</dt>
          <dd>{frameMs.toFixed(1)} ms</dd>
        </div>
        <div>
          <dt>Device pixel ratio</dt>
          <dd>{dpr.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Adaptive clamp</dt>
          <dd>{constrained ? "Active" : "Clear"}</dd>
        </div>
        <div>
          <dt>Mobile default</dt>
          <dd>{mobileDefault ? "Balanced" : "Ultra"}</dd>
        </div>
      </dl>
    </aside>
  );
}
