import { starfieldFragment } from "./starfieldFragment";

export const blackHoleFragment = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uObserverInclination;
uniform float uObserverAzimuth;
uniform float uZoom;
uniform float uAccretion;
uniform float uQuality;
uniform float uReducedMotion;
uniform float uDiskEnabled;
uniform float uPhotonRingEnabled;
uniform float uDopplerEnabled;
uniform float uLensingGridEnabled;
uniform float uCenterShift;

varying vec2 vUv;

${starfieldFragment}

const float PI = 3.14159265359;

vec2 rotate2d(vec2 p, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c) * p;
}

float ringBand(float value, float inner, float outer, float softness) {
  return smoothstep(inner, inner + softness, value) * (1.0 - smoothstep(outer - softness, outer, value));
}

float lineGrid(vec2 p, float scale, float width) {
  vec2 cell = abs(fract(p * scale - 0.5) - 0.5) / fwidth(p * scale);
  float line = min(cell.x, cell.y);
  return 1.0 - smoothstep(width, width + 1.0, line);
}

vec3 diskPalette(float heat, float turbulence) {
  vec3 ember = vec3(0.34, 0.055, 0.018);
  vec3 amber = vec3(1.0, 0.43, 0.095);
  vec3 gold = vec3(1.0, 0.76, 0.28);
  vec3 whiteHot = vec3(1.0, 0.94, 0.72);
  vec3 color = mix(ember, amber, smoothstep(0.05, 0.7, heat));
  color = mix(color, gold, smoothstep(0.45, 0.96, heat) * 0.55);
  color = mix(color, whiteHot, pow(max(heat, 0.0), 4.0) * 0.58);
  return color * (0.82 + 0.28 * turbulence);
}

void main() {
  vec2 uv = vUv;
  vec2 center = vec2(uCenterShift, 0.5);
  vec2 p = uv - center;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  p.x *= aspect;
  p /= max(uZoom, 0.2);

  float r = length(p);
  vec2 dir = r > 0.0001 ? p / r : vec2(0.0, 1.0);
  float inclination = radians(uObserverInclination);
  float sinInc = sin(inclination);
  float cosInc = max(cos(inclination), 0.12);
  float time = uTime * mix(1.0, 0.08, uReducedMotion);

  float lensPull = 0.052 / (r * r + 0.022);
  float criticalBoost = smoothstep(0.42, 0.11, abs(r - 0.255)) * 0.035;
  vec2 lensed = p + dir * (lensPull + criticalBoost);
  vec2 starP = rotate2d(lensed, uObserverAzimuth * 0.16) + vec2(sin(uObserverAzimuth), cos(uObserverAzimuth)) * 0.045;
  vec3 color = proceduralStars(starP, time, mix(0.88, 1.15, uQuality), uQuality);

  float shadowRadius = 0.214;
  float photonRadius = 0.242;
  float aa = max(fwidth(r), 0.0015);

  if (uLensingGridEnabled > 0.5) {
    vec2 gridP = lensed * (1.0 + 0.18 / (r + 0.16));
    float grid = lineGrid(gridP + vec2(uObserverAzimuth * 0.04, 0.0), 5.5, 0.78);
    float fade = smoothstep(1.05, 0.24, r) * smoothstep(0.16, 0.36, r);
    float invertRing = 1.0 - smoothstep(0.008, 0.024, abs(r - 0.34));
    color += vec3(0.62, 0.65, 0.66) * grid * fade * 0.18;
    color += vec3(1.0, 0.67, 0.25) * invertRing * 0.13;
  }

  vec2 diskP = rotate2d(p, uObserverAzimuth);
  vec2 diskCoord = vec2(diskP.x, diskP.y / cosInc);
  float diskR = length(diskCoord);
  float diskTheta = atan(diskCoord.y, diskCoord.x);
  float inner = 0.29;
  float outer = mix(0.67, 0.78, uAccretion);
  float diskThickness = mix(0.014, 0.027, uAccretion) * mix(1.0, 1.5, sinInc);
  float diskShape = ringBand(diskR, inner, outer, 0.035);
  float vertical = exp(-pow(abs(diskP.y) / (diskThickness + 0.012 * (1.0 - cosInc)), 2.0));
  float primaryDisk = diskShape * vertical;

  float backLift = shadowRadius * (0.72 + 0.22 * sinInc);
  float upperArc = exp(-pow((diskP.y - backLift) / (0.032 + 0.025 * sinInc), 2.0));
  float lowerArc = exp(-pow((diskP.y + backLift * 0.84) / (0.03 + 0.018 * sinInc), 2.0));
  float arcRadial = ringBand(abs(diskP.x) + 0.24 * abs(diskP.y), inner * 0.75, outer * 0.92, 0.045);
  float lensedDisk = (upperArc * 0.82 + lowerArc * 0.48) * arcRadial * sinInc;
  float diskMask = max(primaryDisk, lensedDisk) * uDiskEnabled;

  float advect = diskTheta * 4.0 + time * (0.45 + uAccretion * 0.74) / max(diskR, 0.22);
  float turbulent = fbm(vec2(advect, diskR * 12.0 - time * 0.38));
  float innerHeat = smoothstep(outer, inner, diskR);
  float approaching = 0.5 + 0.5 * sin(diskTheta + uObserverAzimuth + 0.35);
  float beam = mix(1.0, 0.58 + 1.72 * approaching * sinInc, uDopplerEnabled);
  float brokenGaps = 0.74 + 0.26 * smoothstep(0.2, 0.95, turbulent);
  vec3 diskColor = diskPalette(innerHeat * beam, turbulent);
  color = mix(color, diskColor * beam, clamp(diskMask * brokenGaps * (0.82 + uAccretion * 0.18), 0.0, 1.0));

  float photonCore = exp(-pow((r - photonRadius) / 0.0065, 2.0));
  float photonHalo = exp(-pow((r - photonRadius) / 0.019, 2.0));
  float photonAsym = 0.72 + 0.48 * (0.5 + 0.5 * sin(atan(p.y, p.x) + uObserverAzimuth)) * sinInc;
  vec3 photonColor = vec3(1.0, 0.86, 0.46) * photonCore + vec3(1.0, 0.42, 0.14) * photonHalo * 0.32;
  color += photonColor * photonAsym * uPhotonRingEnabled;

  float shadow = 1.0 - smoothstep(shadowRadius - aa * 1.6, shadowRadius + aa * 1.6, r);
  float innerVoid = 1.0 - smoothstep(shadowRadius * 0.78, shadowRadius * 1.02, r);
  color = mix(color, vec3(0.0), max(shadow, innerVoid));

  float rimOccult = exp(-pow((r - shadowRadius) / 0.012, 2.0));
  color += vec3(0.012, 0.011, 0.010) * rimOccult;

  float vignette = smoothstep(1.16, 0.18, length((uv - 0.5) * vec2(aspect, 1.0)));
  color *= mix(0.64, 1.0, vignette);

  float grain = hash21(uv * uResolution.xy + time * 24.0) - 0.5;
  color += grain * 0.012;

  color = color / (color + vec3(1.0));
  color = pow(max(color, 0.0), vec3(0.82));

  gl_FragColor = vec4(color, 1.0);
}
`;
