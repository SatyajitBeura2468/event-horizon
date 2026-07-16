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

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;
const float RS = 0.9;
const float PHOTON_SPHERE = 1.35;
const float CAMERA_DISTANCE = 8.5;

vec2 rotate2d(vec2 point, float angle) {
  float sine = sin(angle);
  float cosine = cos(angle);
  return mat2(cosine, -sine, sine, cosine) * point;
}

float gridLines(vec2 point, float scale, float width) {
  vec2 cell = abs(fract(point * scale - 0.5) - 0.5) / max(fwidth(point * scale), vec2(0.001));
  return 1.0 - smoothstep(width, width + 1.0, min(cell.x, cell.y));
}

vec3 thermalPalette(float temperature) {
  vec3 deepEmber = vec3(0.16, 0.008, 0.002);
  vec3 redOrange = vec3(0.92, 0.055, 0.008);
  vec3 tungsten = vec3(1.0, 0.36, 0.045);
  vec3 warmWhite = vec3(1.0, 0.86, 0.58);
  vec3 whiteHot = vec3(1.0, 0.985, 0.91);
  vec3 color = mix(deepEmber, redOrange, smoothstep(0.02, 0.28, temperature));
  color = mix(color, tungsten, smoothstep(0.18, 0.54, temperature));
  color = mix(color, warmWhite, smoothstep(0.46, 0.82, temperature));
  return mix(color, whiteHot, smoothstep(0.78, 1.24, temperature));
}

vec4 sampleAccretion(vec3 position, vec3 rayDirection, float time) {
  float diskRadius = length(position.xz);
  float innerRadius = 1.55;
  float outerRadius = mix(4.1, 4.65, clamp(uAccretion, 0.0, 1.3));
  float innerFeather = 0.12;
  float outerFeather = 0.34;
  float radialWindow = smoothstep(innerRadius, innerRadius + innerFeather, diskRadius)
    * (1.0 - smoothstep(outerRadius - outerFeather, outerRadius, diskRadius));

  float halfThickness = mix(0.024, 0.052, clamp(uAccretion, 0.0, 1.3))
    * mix(0.72, 1.28, clamp(uPlasmaDensity, 0.0, 1.35));
  float verticalProfile = exp(-pow(position.y / max(halfThickness, 0.01), 2.0));
  float angle = atan(position.z, position.x);
  float keplerian = pow(innerRadius / max(diskRadius, innerRadius), 1.5);
  float orbitalPhase = time * (0.38 + 0.62 * uAccretion) * keplerian;
  vec2 flow = rotate2d(position.xz, orbitalPhase);

  float broadEddy = fbm(flow * 2.4 + vec2(0.0, time * 0.055));
  float fineEddy = fbm(flow * 6.8 - vec2(time * 0.09, time * 0.035));
  float spiral = 0.5 + 0.5 * sin(
    angle * 11.0 - time * (1.2 + 1.8 * keplerian) + diskRadius * 8.0 + (broadEddy - 0.5) * 5.0
  );
  float filament = mix(1.0, 0.24 + broadEddy * 0.82 + fineEddy * 0.48 + spiral * 0.42, uTurbulence);
  filament = clamp(filament, 0.16, 1.65);

  float azimuthalKnots = pow(max(0.0, sin(angle * 89.0 - time * (4.0 + 8.0 * keplerian) + sin(diskRadius * 37.0))), 18.0);
  float radialKnots = pow(max(0.0, sin(diskRadius * 68.0 - angle * 7.0 + time * 1.7)), 14.0);
  float plasmaKnots = azimuthalKnots * radialKnots * smoothstep(0.2, 0.75, fineEddy) * uPlasmaDensity;

  float boundary = pow(max(1.0 - sqrt(innerRadius / max(diskRadius, innerRadius + 0.001)), 0.0), 0.22);
  float radialTemperature = pow(innerRadius / max(diskRadius, innerRadius), 0.72);
  float emittedTemperature = clamp((0.42 + 0.9 * boundary) * radialTemperature * uDiskHeat, 0.0, 1.5);

  vec3 tangent = normalize(vec3(-position.z, 0.0, position.x));
  float beta = clamp(0.57 * sqrt(innerRadius / max(diskRadius, innerRadius)), 0.0, 0.68);
  vec3 velocity = tangent * beta;
  float gamma = inversesqrt(max(1.0 - beta * beta, 0.08));
  float lineOfSightVelocity = dot(velocity, -rayDirection);
  float dopplerFactor = 1.0 / max(gamma * (1.0 - lineOfSightVelocity), 0.24);
  dopplerFactor = mix(1.0, dopplerFactor, uDopplerEnabled);
  float gravitationalShift = sqrt(max(1.0 - RS / max(diskRadius, RS + 0.02), 0.06));
  gravitationalShift = mix(1.0, gravitationalShift, uRedshiftEnabled);
  float observedTemperature = emittedTemperature * gravitationalShift * dopplerFactor;
  float beaming = mix(1.0, clamp(pow(dopplerFactor, 3.0), 0.24, 3.6), uDopplerEnabled);

  float density = radialWindow * verticalProfile * filament;
  vec3 color = thermalPalette(observedTemperature);
  color *= (0.7 + observedTemperature * 1.65) * beaming;
  float spiralRidges = pow(0.5 + 0.5 * sin(
    angle * 19.0 - time * (2.3 + 4.0 * keplerian) + diskRadius * 12.0 + (broadEddy - 0.5) * 8.0
  ), 5.0);
  float emissivityTexture = mix(
    1.0,
    (0.34 + 1.36 * smoothstep(0.24, 0.82, broadEddy)) * (0.66 + 0.9 * spiralRidges),
    clamp(uTurbulence, 0.0, 1.0)
  );
  color *= emissivityTexture;
  color += thermalPalette(min(observedTemperature * 1.28, 1.5)) * plasmaKnots * 2.4;
  float opacity = density * (0.46 + uPlasmaDensity * 1.28) + plasmaKnots * 0.8;
  return vec4(color, opacity);
}

vec4 sampleSecondaryImage(vec2 screen, float inclination, float time) {
  float sineInclination = sin(inclination);
  float apparentShadow = 0.145 * uLensingStrength / max(uZoom, 0.35);
  float apparentOuter = 0.78 / max(uZoom, 0.35);
  float normalizedX = screen.x / max(apparentOuter, 0.01);
  float support = 1.0 - smoothstep(0.88, 1.0, abs(normalizedX));
  float curve = apparentShadow * (1.04 + 0.14 * sineInclination)
    * sqrt(max(1.0 - normalizedX * normalizedX, 0.0));
  float thickness = mix(0.0045, 0.014, uPlasmaDensity) * mix(0.55, 1.0, sineInclination);
  float upperBand = exp(-pow((screen.y - curve) / max(thickness, 0.003), 2.0));
  float lowerBand = exp(-pow((screen.y + curve * 0.86) / max(thickness * 0.78, 0.003), 2.0));
  float band = (upperBand + lowerBand * 0.11) * support * smoothstep(0.2, 0.58, sineInclination);

  vec2 advected = rotate2d(
    vec2(normalizedX * 2.8, curve * 11.0),
    time * (0.06 + 0.08 * uAccretion)
  );
  float broad = fbm(advected * 2.1 + vec2(time * 0.04, 0.0));
  float fine = fbm(advected * 6.3 - vec2(0.0, time * 0.08));
  float texture = mix(1.0, 0.48 + broad * 0.62 + fine * 0.38, uTurbulence);
  float heat = clamp((1.08 - 0.55 * abs(normalizedX)) * uDiskHeat, 0.0, 1.4);
  float approach = smoothstep(-1.0, 1.0, normalizedX);
  float beaming = mix(1.0, mix(0.52, 1.65, approach), uDopplerEnabled * sineInclination);
  float redshift = mix(1.0, mix(0.68, 0.92, abs(normalizedX)), uRedshiftEnabled);
  vec3 color = thermalPalette(heat * redshift * beaming) * texture * beaming * 2.6;
  return vec4(color, band);
}

void main() {
  vec2 center = vec2(uCenterShift, 0.48);
  vec2 screen = vUv - center;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  screen.x *= aspect;
  screen /= max(uZoom, 0.24);

  float inclination = radians(clamp(uObserverInclination, 0.2, 89.0));
  float azimuth = uObserverAzimuth;
  vec3 cameraPosition = CAMERA_DISTANCE * vec3(
    sin(inclination) * sin(azimuth),
    cos(inclination),
    sin(inclination) * cos(azimuth)
  );
  vec3 forward = normalize(-cameraPosition);
  vec3 right = normalize(vec3(cos(azimuth), 0.0, -sin(azimuth)));
  vec3 cameraUp = normalize(cross(right, forward));
  vec3 rayDirection = normalize(forward + right * screen.x * 0.86 + cameraUp * screen.y * 0.86);

  vec3 position = cameraPosition;
  vec3 radiance = vec3(0.0);
  float transmittance = 1.0;
  float minimumRadius = CAMERA_DISTANCE;
  float traveled = 0.0;
  float captured = 0.0;
  float time = uTime * mix(1.0, 0.08, uReducedMotion);
  // Keep the integration dense around the strong-field region, but traverse
  // empty space aggressively. This preserves the lensing silhouette while
  // leaving enough GPU headroom for fluid texture and post-processing.
  float stepBudget = mix(36.0, 64.0, uQuality);

  for (int rayStep = 0; rayStep < 64; rayStep++) {
    if (float(rayStep) >= stepBudget) {
      break;
    }

    float radius = length(position);
    minimumRadius = min(minimumRadius, radius);

    if (radius < RS * 1.015) {
      captured = 1.0;
      break;
    }

    float stepSize = mix(0.038, 0.32, smoothstep(RS * 1.16, CAMERA_DISTANCE * 0.72, radius));
    vec3 towardCenter = -position;
    vec3 perpendicular = towardCenter - rayDirection * dot(towardCenter, rayDirection);
    float relativisticBoost = 1.0 + 0.42 * RS / max(radius - RS, 0.12);
    vec3 curvature = perpendicular * (RS / max(radius * radius * radius, 0.08))
      * relativisticBoost * uLensingStrength * 0.24;
    rayDirection = normalize(rayDirection + curvature * stepSize);
    position += rayDirection * stepSize;
    traveled += stepSize;

    float diskRadius = length(position.xz);
    float maximumDiskRadius = mix(4.1, 4.65, clamp(uAccretion, 0.0, 1.3));
    float diskReach = mix(0.048, 0.115, clamp(uPlasmaDensity, 0.0, 1.35));

    if (
      uDiskEnabled > 0.5
      && abs(position.y) < diskReach
      && diskRadius > 1.42
      && diskRadius < maximumDiskRadius + 0.35
    ) {
      vec4 plasma = sampleAccretion(position, rayDirection, time);
      float opticalDepth = plasma.a * stepSize * 0.92;
      radiance += transmittance * plasma.rgb * opticalDepth;
      transmittance *= exp(-opticalDepth * (0.46 + uPlasmaDensity * 0.72));
    }

    if (
      traveled > CAMERA_DISTANCE * 2.35
      || transmittance < 0.008
      || (traveled > CAMERA_DISTANCE && radius > CAMERA_DISTANCE * 1.04 && dot(position, rayDirection) > 0.0)
    ) {
      break;
    }
  }

  vec2 skyCoordinates = vec2(
    atan(rayDirection.z, rayDirection.x) / TWO_PI,
    asin(clamp(rayDirection.y, -1.0, 1.0)) / PI
  );
  vec3 sky = proceduralStars(skyCoordinates * vec2(2.8, 1.7), time, mix(0.94, 1.18, uQuality), uQuality);
  sky *= 0.82 + 0.18 * smoothstep(PHOTON_SPHERE, CAMERA_DISTANCE, minimumRadius);

  vec3 color = radiance + sky * transmittance * (1.0 - captured);

  vec4 secondaryImage = sampleSecondaryImage(screen, inclination, time);
  color += secondaryImage.rgb * secondaryImage.a * uDiskEnabled;

  float nearCritical = exp(-pow((minimumRadius - PHOTON_SPHERE) / 0.018, 2.0));
  float criticalVisibility = uPhotonRingEnabled * nearCritical * (0.08 + 0.16 * transmittance);
  color += vec3(1.0, 0.74, 0.3) * criticalVisibility;

  // A sub-pixel transfer stabilizer keeps the critical curve readable when
  // adaptive integration uses fewer samples. It remains dimmer than the disk.
  float stabilizedCriticalCurve = exp(-pow((length(screen) - 0.12 * uLensingStrength) / 0.0028, 2.0));
  color += vec3(1.0, 0.66, 0.24) * stabilizedCriticalCurve * uPhotonRingEnabled * 0.16;

  if (uLensingGridEnabled > 0.5) {
    float grid = gridLines(skyCoordinates + vec2(azimuth * 0.03, 0.0), 9.0, 0.7);
    float gridFocus = smoothstep(CAMERA_DISTANCE, PHOTON_SPHERE, minimumRadius);
    color += mix(vec3(0.16, 0.42, 0.46), vec3(0.96, 0.48, 0.12), gridFocus) * grid * 0.16;
  }

  float vignette = smoothstep(1.12, 0.16, length((vUv - 0.5) * vec2(aspect, 1.0)));
  color *= mix(0.58, 1.0, vignette);
  float grain = hash21(vUv * uResolution + time * 17.0) - 0.5;
  color += grain * mix(0.002, 0.004, uQuality);

  color = vec3(1.0) - exp(-max(color, 0.0) * uExposure);
  color = pow(max(color, 0.0), vec3(0.84));
  gl_FragColor = vec4(color, 1.0);
}
`;
