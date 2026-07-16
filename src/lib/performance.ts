export type QualityMode = "balanced" | "ultra";

export function isLikelyMobileDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
}

export function getSafeDevicePixelRatio(mode: QualityMode, constrained: boolean): number {
  if (typeof window === "undefined") {
    return 1;
  }

  const raw = window.devicePixelRatio || 1;
  const cap = mode === "ultra" && !constrained ? 1.85 : 1.25;
  return Math.max(1, Math.min(raw, cap));
}

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
