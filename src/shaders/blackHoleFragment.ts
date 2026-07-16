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
uniform float uRedshiftEnabled;
uniform float uLensingGridEnabled;
uniform float uCenterShift;
uniform float uLensingStrength;
uniform float uDiskHeat;
uniform float uTurbulence;
uniform float uPlasmaDensity;
uniform float uExposure;

varying vec2 vUv;

${starfieldFragment}

vec2 rotate2d(vec2 point, float angle) {
  float sine = sin(angle);
  float cosine = cos(angle);
  return mat2(cosine, -sine, sine, cosine) * point;
}

float windowBand(float value, float inner, float outer, float feather) {
  return smoothstep(inner, inner + feather, value)
    * (1.0 - smoothstep(outer - feather, outer, value));
}

float gridLines(vec2 point, float scale, float width) {
  vec2 derivative = max(fwidth(point * scale), vec2(0.001));
  vec2 cell = abs(fract(point * scale - 0.5) - 0.5) / derivative;
  return 1.0 - smoothstep(width, width + 1.0, min(cell.x, cell.y));
}

vec3 thermalPalette(float temperature) {
  vec3 ember = vec3(0.12, 0.006, 0.002);
  vec3 redOrange = vec3(0.88, 0.045, 0.006);
  vec3 tungsten = vec3(1.0, 0.31, 0.025);
  vec3 warmWhite = vec3(1.0, 0.79, 0.42);
  vec3 whiteHot = vec3(1.0, 0.97, 0.84);
  vec3 color = mix(ember, redOrange, smoothstep(0.02, 0.3, temperature));
  color = mix(color, tungsten, smoothstep(0.22, 0.56, temperature));
  color = mix(color, warmWhite, smoothstep(0.48, 0.82, temperature));
  return mix(color, whiteHot, smoothstep(0.78, 1.3, temperature));
}

float plasmaTexture(float radius, float theta, float time) {
  float orbitalRate = pow(0.285 / max(radius, 0.285), 1.5);
  vec2 flow = vec2(
    theta * 2.7 - time * (0.28 + orbitalRate * 0.72),
    log(radius + 0.18) * 15.0 + time * 0.045
  );
  float broad = fbm(flow * 1.35);
  float fine = fbm(flow * 3.2 + vec2(time * 0.06, -time * 0.03));
  float spiral = 0.5 + 0.5 * sin(
    theta * 13.0 - time * (0.8 + orbitalRate * 1.9) + radius * 31.0 + broad * 4.0
  );
  float shear = pow(0.5 + 0.5 * sin(
    theta * 31.0 - time * (1.15 + orbitalRate * 2.2) + radius * 82.0 + fine * 5.0
  ), 4.0);
  float filament = 0.38 + broad * 0.46 + fine * 0.18 + spiral * 0.16 + shear * 0.38;
  return mix(1.0, clamp(filament, 0.3, 1.42), clamp(uTurbulence, 0.0, 1.35));
}

vec3 diskEmission(float radius, float theta, float horizontalPosition, float time) {
  float inner = 0.285;
  float radialHeat = pow(inner / max(radius, inner), 0.68);
  float innerBoundary = smoothstep(inner, inner + 0.075, radius);
  float emittedTemperature = clamp(radialHeat * (0.58 + innerBoundary * 0.72) * uDiskHeat, 0.0, 1.4);

  float approaching = smoothstep(-0.78, 0.78, horizontalPosition);
  float doppler = mix(1.0, mix(0.68, 1.34, approaching), uDopplerEnabled);
  float gravitationalShift = sqrt(max(1.0 - 0.17 / max(radius, 0.175), 0.08));
  gravitationalShift = mix(1.0, gravitationalShift, uRedshiftEnabled);
  float observedTemperature = emittedTemperature * gravitationalShift * doppler;
  float beaming = mix(1.0, pow(doppler, 2.0), uDopplerEnabled);
  float texture = plasmaTexture(radius, theta, time);

  vec3 color = thermalPalette(observedTemperature) * (0.42 + observedTemperature * 0.98);
  color *= texture * beaming;
  return color;
}

void main() {
  vec2 center = vec2(uCenterShift, 0.48);
  vec2 screen = vUv - center;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  screen.x *= aspect;
  screen /= max(uZoom, 0.3);

  float radius = length(screen);
  vec2 radialDirection = radius > 0.0001 ? screen / radius : vec2(0.0, 1.0);
  float inclination = radians(clamp(uObserverInclination, 0.0, 89.0));
  float sineInclination = sin(inclination);
  float cosineInclination = max(cos(inclination), 0.085);
  float time = uTime * mix(1.0, 0.08, uReducedMotion);

  float shadowRadius = 0.18 * mix(0.92, 1.08, clamp(uLensingStrength, 0.72, 1.28));
  float photonRadius = shadowRadius * 1.075;
  float pixelWidth = max(fwidth(radius), 0.0012);

  // Stable Schwarzschild-inspired sky deflection. The radial transfer grows
  // toward the critical curve without marching through discrete volume slices.
  float impact = max(radius, 0.035);
  float weakDeflection = 0.024 * uLensingStrength / impact;
  float criticalDistance = max(abs(radius - photonRadius), 0.004);
  float strongDeflection = -log(criticalDistance + 0.012) * 0.0075
    * smoothstep(0.54, photonRadius, radius) * uLensingStrength;
  vec2 lensedSky = screen + radialDirection * (weakDeflection + strongDeflection);
  vec2 skyCoordinates = rotate2d(lensedSky, uObserverAzimuth * 0.13)
    + vec2(sin(uObserverAzimuth), cos(uObserverAzimuth)) * 0.028;
  vec3 color = proceduralStars(skyCoordinates, time, mix(0.92, 1.16, uQuality), uQuality);

  if (uLensingGridEnabled > 0.5) {
    float grid = gridLines(lensedSky + vec2(uObserverAzimuth * 0.035, 0.0), 6.5, 0.72);
    float gridFade = smoothstep(0.82, 0.22, radius) * smoothstep(shadowRadius * 0.96, photonRadius * 1.75, radius);
    color += vec3(0.23, 0.55, 0.58) * grid * gridFade * 0.12;
  }

  float innerRadius = 0.285;
  float outerRadius = mix(0.59, 0.68, clamp(uAccretion, 0.0, 1.2));
  vec2 diskCoordinate = vec2(screen.x, screen.y / cosineInclination);
  float diskRadius = length(diskCoordinate);
  float diskTheta = atan(diskCoordinate.y, diskCoordinate.x);
  float radialFeather = max(fwidth(diskRadius) * 1.5, 0.012);
  float radialWindow = windowBand(diskRadius, innerRadius, outerRadius, radialFeather);

  // The projected primary image is one continuous annulus. The rear half is
  // restrained at high inclination because its light is represented by the
  // strongly lensed transfer band below.
  float rearHalf = smoothstep(-0.015, 0.055, screen.y);
  float rearVisibility = mix(0.6, 0.08, sineInclination);
  float density = mix(0.62, 0.94, clamp(uPlasmaDensity, 0.2, 1.35));
  float opacityTexture = mix(1.0, 0.58 + plasmaTexture(diskRadius, diskTheta, time) * 0.42, clamp(uTurbulence, 0.0, 1.0));
  float primaryOpacity = radialWindow * density * opacityTexture;
  float rearOpacity = primaryOpacity * rearHalf * rearVisibility * uDiskEnabled;
  float foregroundOpacity = primaryOpacity * (1.0 - rearHalf) * uDiskEnabled;
  vec3 primaryEmission = diskEmission(diskRadius, diskTheta, screen.x / outerRadius, time);

  // Continuous far-side transfer: it hugs the critical curve at the center
  // and joins the primary disk smoothly at both outer edges.
  float normalizedArcX = screen.x / max(outerRadius * 0.985, 0.01);
  float arcDomain = max(1.0 - normalizedArcX * normalizedArcX, 0.0);
  float arcCurve = shadowRadius * 1.045 * sqrt(arcDomain);
  float arcSupport = (1.0 - smoothstep(0.965, 1.0, abs(normalizedArcX)))
    * smoothstep(0.22, 0.72, sineInclination);
  float arcWidth = mix(0.006, 0.011, clamp(uPlasmaDensity, 0.2, 1.35))
    * mix(0.72, 1.0, sineInclination);
  float upperArc = exp(-pow((screen.y - arcCurve) / max(arcWidth, 0.004), 2.0)) * arcSupport;
  float arcApproach = smoothstep(-1.0, 1.0, normalizedArcX);
  float arcDoppler = mix(1.0, mix(0.7, 1.32, arcApproach), uDopplerEnabled);
  float arcHeat = clamp((1.02 - abs(normalizedArcX) * 0.28) * uDiskHeat * arcDoppler, 0.0, 1.35);
  float arcTexture = 0.74 + 0.26 * fbm(vec2(
    normalizedArcX * 3.8 - time * 0.055,
    normalizedArcX * 8.5 + time * 0.025
  ));
  vec3 arcEmission = thermalPalette(arcHeat) * arcTexture * (0.78 + arcHeat * 0.62)
    * mix(0.78, 1.06, clamp(uLensingStrength, 0.72, 1.28));

  color = mix(color, primaryEmission, clamp(rearOpacity, 0.0, 1.0));
  color = mix(color, arcEmission, clamp(upperArc * 0.94 * uDiskEnabled, 0.0, 1.0));

  // The shadow is an invariant circular silhouette at every camera angle.
  float shadow = 1.0 - smoothstep(shadowRadius - pixelWidth * 1.15, shadowRadius + pixelWidth * 1.15, radius);
  color = mix(color, vec3(0.0), shadow);

  float photonCore = exp(-pow((radius - photonRadius) / max(pixelWidth * 1.2, 0.0022), 2.0));
  float photonHalo = exp(-pow((radius - photonRadius) / 0.012, 2.0));
  float photonAsymmetry = mix(0.72, 1.25, smoothstep(-1.0, 1.0, radialDirection.x) * sineInclination);
  float photonOcclusion = 1.0 - smoothstep(0.05, 0.25, foregroundOpacity);
  color += vec3(1.0, 0.68, 0.24) * photonCore * photonAsymmetry * photonOcclusion * uPhotonRingEnabled * 0.2;
  color += vec3(0.78, 0.18, 0.035) * photonHalo * photonAsymmetry * photonOcclusion * uPhotonRingEnabled * 0.042;

  // Foreground plasma is between the observer and the shadow. Compositing it
  // last prevents the black silhouette from punching a Saturn-like circular
  // hole through the near side of the disk.
  color = mix(color, primaryEmission, clamp(foregroundOpacity, 0.0, 1.0));

  float vignette = smoothstep(1.14, 0.16, length((vUv - 0.5) * vec2(aspect, 1.0)));
  color *= mix(0.58, 1.0, vignette);
  float grain = hash21(vUv * uResolution + time * 17.0) - 0.5;
  color += grain * mix(0.0015, 0.003, uQuality);

  color = vec3(1.0) - exp(-max(color, 0.0) * uExposure);
  color = pow(max(color, 0.0), vec3(0.86));
  gl_FragColor = vec4(color, 1.0);
}
`;
