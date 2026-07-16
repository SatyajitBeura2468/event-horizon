export const starfieldFragment = `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float hash31(vec3 p) {
  p = fract(p * vec3(0.1031, 0.11369, 0.13787));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = rot * p * 2.02 + 17.13;
    amplitude *= 0.5;
  }

  return value;
}

vec3 proceduralStars(vec2 p, float time, float density, float quality) {
  vec3 color = vec3(0.0);
  float layers = mix(2.0, 3.0, quality);

  for (int layer = 0; layer < 3; layer++) {
    float layerEnabled = step(float(layer), layers - 0.5);
    float scale = mix(42.0, 118.0, float(layer) / 2.0) * density;
    vec2 cell = floor(p * scale);
    vec2 local = fract(p * scale) - 0.5;
    float seed = hash31(vec3(cell, float(layer) * 13.7));
    vec2 starOffset = vec2(hash21(cell + 7.1), hash21(cell + 17.8)) - 0.5;
    float dist = length(local - starOffset * 0.62);
    float sparkle = smoothstep(0.045, 0.0, dist) * step(0.972 - quality * 0.011, seed);
    float shimmer = 0.82 + 0.18 * sin(time * (0.35 + seed) + seed * 18.0);
    vec3 starColor = mix(vec3(0.52, 0.58, 0.64), vec3(1.0, 0.96, 0.86), seed);
    color += starColor * sparkle * shimmer * layerEnabled * (0.28 + 0.32 * float(layer));
  }

  float dust = fbm(p * 1.8 + vec2(0.0, time * 0.006));
  color += vec3(0.018, 0.021, 0.026) * smoothstep(0.58, 0.95, dust);
  return color;
}
`;
