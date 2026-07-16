import type { MassPresetId } from "../data/presets";

export type ProbeClassification = "ESCAPED" | "DEFLECTED" | "CRITICAL ORBIT" | "CAPTURED";

export type ProbePath = {
  id: string;
  d: string;
  dotPath: string;
  classification: ProbeClassification;
  labelX: number;
  labelY: number;
  createdAt: number;
};

export type ObserverTrailPoint = {
  id: string;
  x: number;
  y: number;
  age: number;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function damp(a: number, b: number, lambda: number, delta: number): number {
  return lerp(a, b, 1 - Math.exp(-lambda * delta));
}

export function scaleReferenceForMass(id: MassPresetId): string {
  if (id === "stellar") {
    return "The event horizon is roughly the width of a large city, while the optical shadow remains a geometry-scaled view.";
  }

  if (id === "sagittarius") {
    return "The event horizon spans millions of kilometers, comparable to a compact planetary-orbit scale.";
  }

  return "The event horizon is wider than our Solar System, yet the visual geometry can stay similar when the camera scales with it.";
}

function classifyProbe(distance: number): ProbeClassification {
  if (distance < 0.15) {
    return "CAPTURED";
  }

  if (distance < 0.235) {
    return "CRITICAL ORBIT";
  }

  if (distance < 0.43) {
    return "DEFLECTED";
  }

  return "ESCAPED";
}

export function createPhotonProbePath(
  clientX: number,
  clientY: number,
  width: number,
  height: number,
  centerXRatio: number,
): ProbePath {
  const centerX = width * centerXRatio;
  const centerY = height * 0.5;
  const dx = (clientX - centerX) / Math.min(width, height);
  const dy = (clientY - centerY) / Math.min(width, height);
  const distance = Math.hypot(dx, dy);
  const classification = classifyProbe(distance);
  const side = clientX < centerX ? -1 : 1;
  const tangent = side * Math.max(70, Math.min(width, height) * 0.18);
  const ring = Math.min(width, height) * 0.115;
  const id = `probe-${Date.now()}-${Math.round(clientX)}-${Math.round(clientY)}`;

  if (classification === "CAPTURED") {
    const d = [
      `M ${clientX.toFixed(1)} ${clientY.toFixed(1)}`,
      `C ${(clientX + tangent * 0.45).toFixed(1)} ${(clientY - ring).toFixed(1)},`,
      `${(centerX + side * ring * 0.5).toFixed(1)} ${(centerY + ring * 0.35).toFixed(1)},`,
      `${centerX.toFixed(1)} ${centerY.toFixed(1)}`,
    ].join(" ");
    return {
      id,
      d,
      dotPath: d,
      classification,
      labelX: centerX + side * ring * 1.25,
      labelY: centerY + ring * 0.65,
      createdAt: performance.now(),
    };
  }

  if (classification === "CRITICAL ORBIT") {
    const startX = clientX;
    const startY = clientY;
    const loopX = centerX + side * ring * 1.05;
    const loopY = centerY + dy * Math.min(width, height) * 0.35;
    const exitX = centerX - side * ring * 1.7;
    const exitY = centerY - dy * Math.min(width, height) * 0.8;
    const d = [
      `M ${startX.toFixed(1)} ${startY.toFixed(1)}`,
      `C ${(startX + tangent * 0.35).toFixed(1)} ${(startY - ring * 0.65).toFixed(1)},`,
      `${loopX.toFixed(1)} ${(loopY - ring).toFixed(1)},`,
      `${loopX.toFixed(1)} ${loopY.toFixed(1)}`,
      `A ${ring.toFixed(1)} ${ring.toFixed(1)} 0 1 ${side > 0 ? 1 : 0} ${(centerX - side * ring * 0.85).toFixed(1)} ${(centerY + ring * 0.1).toFixed(1)}`,
      `A ${ring.toFixed(1)} ${ring.toFixed(1)} 0 0 ${side > 0 ? 1 : 0} ${loopX.toFixed(1)} ${(loopY + ring * 0.2).toFixed(1)}`,
      `C ${(centerX - side * ring).toFixed(1)} ${(centerY - ring).toFixed(1)},`,
      `${exitX.toFixed(1)} ${exitY.toFixed(1)},`,
      `${(exitX - side * Math.min(width, height) * 0.18).toFixed(1)} ${(exitY - ring * 0.4).toFixed(1)}`,
    ].join(" ");
    return {
      id,
      d,
      dotPath: d,
      classification,
      labelX: loopX,
      labelY: loopY - ring * 1.25,
      createdAt: performance.now(),
    };
  }

  if (classification === "DEFLECTED") {
    const exitX = side > 0 ? width + 60 : -60;
    const exitY = clientY - dy * Math.min(width, height) * 0.9;
    const d = [
      `M ${clientX.toFixed(1)} ${clientY.toFixed(1)}`,
      `C ${(centerX + side * ring * 2).toFixed(1)} ${(centerY + dy * 120).toFixed(1)},`,
      `${(centerX - side * ring * 3.2).toFixed(1)} ${(centerY - dy * 120).toFixed(1)},`,
      `${exitX.toFixed(1)} ${exitY.toFixed(1)}`,
    ].join(" ");
    return {
      id,
      d,
      dotPath: d,
      classification,
      labelX: centerX - side * ring * 2.4,
      labelY: centerY - dy * Math.min(width, height) * 0.55,
      createdAt: performance.now(),
    };
  }

  const exitX = side > 0 ? width + 60 : -60;
  const exitY = clientY - dy * Math.min(width, height) * 0.18;
  const d = [
    `M ${clientX.toFixed(1)} ${clientY.toFixed(1)}`,
    `C ${(clientX + tangent).toFixed(1)} ${(clientY - dy * 80).toFixed(1)},`,
    `${(centerX + side * Math.min(width, height) * 0.32).toFixed(1)} ${(centerY - dy * 52).toFixed(1)},`,
    `${exitX.toFixed(1)} ${exitY.toFixed(1)}`,
  ].join(" ");

  return {
    id,
    d,
    dotPath: d,
    classification,
    labelX: centerX + side * ring * 3.6,
    labelY: clientY - 22,
    createdAt: performance.now(),
  };
}
