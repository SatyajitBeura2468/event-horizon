export type ObservationPresetId = "face-on" | "orbital" | "edge-on" | "free";
export type MassPresetId = "stellar" | "sagittarius" | "m87";
export type AccretionRate = "quiet" | "active" | "extreme";
export type TimeMode = "pause" | "0.5x" | "1x" | "3x";

export type ObserverTarget = {
  preset: ObservationPresetId;
  inclination: number;
  azimuth: number;
  zoom: number;
};

export const observationPresets: Record<ObservationPresetId, ObserverTarget & { label: string }> = {
  "face-on": {
    label: "Face-On",
    preset: "face-on",
    inclination: 8,
    azimuth: 0,
    zoom: 1.05,
  },
  orbital: {
    label: "Orbital",
    preset: "orbital",
    inclination: 75,
    azimuth: 0.55,
    zoom: 0.98,
  },
  "edge-on": {
    label: "Edge-On",
    preset: "edge-on",
    inclination: 83,
    azimuth: -0.12,
    zoom: 0.92,
  },
  free: {
    label: "Free Look",
    preset: "free",
    inclination: 58,
    azimuth: 0.3,
    zoom: 1,
  },
};

export const massPresets: Record<MassPresetId, { label: string; solarMasses: number; shortLabel: string }> = {
  stellar: {
    label: "Stellar Remnant",
    shortLabel: "10 Msun",
    solarMasses: 10,
  },
  sagittarius: {
    label: "Sagittarius A*",
    shortLabel: "4.3M Msun",
    solarMasses: 4_300_000,
  },
  m87: {
    label: "M87*",
    shortLabel: "6.5B Msun",
    solarMasses: 6_500_000_000,
  },
};

export const accretionRates: Record<AccretionRate, { label: string; shaderValue: number }> = {
  quiet: { label: "Quiet", shaderValue: 0.45 },
  active: { label: "Active", shaderValue: 0.78 },
  extreme: { label: "Extreme", shaderValue: 1.15 },
};

export const timeModes: Record<TimeMode, { label: string; speed: number }> = {
  pause: { label: "Pause", speed: 0 },
  "0.5x": { label: "0.5x", speed: 0.5 },
  "1x": { label: "1x", speed: 1 },
  "3x": { label: "3x", speed: 3 },
};

export const blackHoleMoments = [
  {
    id: "approach-shadow",
    label: "Approach the Shadow",
    observer: { preset: "free" as const, inclination: 38, azimuth: 0.18, zoom: 1.42 },
    sentence:
      "The dark region is the lensed shadow, larger than the event horizon because near-horizon light paths are lost or redirected.",
  },
  {
    id: "edge-distortion",
    label: "Edge-On Distortion",
    observer: { preset: "edge-on" as const, inclination: 84, azimuth: -0.1, zoom: 1.02 },
    sentence:
      "A flat disk can appear above and below the shadow when light from the far side bends around the black hole.",
  },
  {
    id: "einstein-ring",
    label: "Inside the Einstein Ring",
    observer: { preset: "free" as const, inclination: 56, azimuth: 0.4, zoom: 1.56 },
    sentence:
      "Near the photon sphere, tiny changes in impact parameter decide whether light escapes, loops, or disappears into the shadow.",
  },
] as const;
