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
      <div className="telemetry-panel__status">
        <span aria-hidden="true" />
        Observation live
      </div>
      <dl>
        <div>
          <dt>Object</dt>
          <dd>Schwarzschild Black Hole</dd>
        </div>
        <div>
          <dt>Target</dt>
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
          <dt>ISCO Period</dt>
          <dd>{formatSeconds(metrics.iscoOrbitalPeriodSeconds)}</dd>
        </div>
        <div>
          <dt>Time dilation</dt>
          <dd>{metrics.iscoTimeDilation.toFixed(3)}×</dd>
        </div>
        <div>
          <dt>Mass</dt>
          <dd>{formatMass(metrics.solarMasses)}</dd>
        </div>
      </dl>
    </aside>
  );
}
