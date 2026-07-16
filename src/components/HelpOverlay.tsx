import { X } from "lucide-react";

type HelpOverlayProps = {
  open: boolean;
  onClose: () => void;
};

const shortcuts = [
  ["H", "Toggle guide"],
  ["C", "Toggle controls"],
  ["G", "Toggle lensing grid"],
  ["P", "Toggle Photon Probe"],
  ["M", "Toggle immersion"],
  ["Space", "Pause or resume"],
  ["R", "Reset observation"],
  ["Esc", "Close drawer or exit immersion"],
] as const;

export function HelpOverlay({ open, onClose }: HelpOverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <section className="guide-overlay" role="dialog" aria-modal="true" aria-labelledby="guide-title">
      <div className="guide-overlay__panel">
        <div className="drawer__header">
          <div>
            <span>Guide</span>
            <h2 id="guide-title">Operate the observatory</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close guide">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="guide-grid">
          <section>
            <h3>Primary interaction</h3>
            <p>Drag the scene to orbit around the Schwarzschild black hole. Scroll or pinch to approach and retreat.</p>
          </section>
          <section>
            <h3>Photon Probe</h3>
            <p>Activate Photon Probe, then click near the shadow to release a subtle light packet and classify its path.</p>
          </section>
          <section>
            <h3>Lensing Reveal</h3>
            <p>Toggle the grid to reveal how background coordinates bend, stretch, and invert near the critical ring.</p>
          </section>
          <section>
            <h3>Scale Revelation</h3>
            <p>Switch mass presets to update the real Schwarzschild radius, photon sphere, and ISCO while the optical geometry stays scaled.</p>
          </section>
        </div>
        <div className="shortcut-grid" aria-label="Keyboard shortcuts">
          {shortcuts.map(([key, label]) => (
            <div key={key}>
              <kbd>{key}</kbd>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
