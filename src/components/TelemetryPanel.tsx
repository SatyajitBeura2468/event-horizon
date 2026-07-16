import type { BlackHoleMetrics } from "../lib/physics";
import { formatDegrees, formatKilometers, formatMass, formatSeconds } from "../lib/formatters";
import type { MassPresetId } from "../data/presets";
import { massPresets } from "../data/presets";

type TelemetryPanelProps = {
  metrics: BlackHoleMetrics;
  massPreset: MassPresetId;
  inclination: number;
};

export function TelemetryPanel({ metrics, massPreset, inclination }: TelemetryPanelProps) {
  return (
    <aside className="telemetry-panel" aria-label="Black hole physical telemetry">
      <dl>
        <div>
          <dt>Object</dt>
          <dd>Schwarzschild Black Hole</dd>
        </div>
        <div>
          <dt>Mass Preset</dt>
          <dd>{massPresets[massPreset].label}</dd>
        </div>
        <div>
          <dt>Event Horizon</dt>
          <dd>{formatKilometers(metrics.schwarzschildRadiusMeters)}</dd>
        </div>
        <div>
          <dt>Photon Sphere</dt>
          <dd>{formatKilometers(metrics.photonSphereRadiusMeters)}</dd>
        </div>
        <div>
          <dt>ISCO</dt>
          <dd>{formatKilometers(metrics.iscoRadiusMeters)}</dd>
        </div>
        <div>
          <dt>Observer Inclination</dt>
          <dd>{formatDegrees(inclination)}</dd>
        </div>
        <div>
          <dt>Light Crossing</dt>
          <dd>{formatSeconds(metrics.lightCrossingTimeSeconds)}</dd>
        </div>
        <div>
          <dt>Mass</dt>
          <dd>{formatMass(metrics.solarMasses)}</dd>
        </div>
      </dl>
    </aside>
  );
}
