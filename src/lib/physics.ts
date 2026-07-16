export const G = 6.67430e-11;
export const C = 299_792_458;
export const SOLAR_MASS_KG = 1.98847e30;

export type BlackHoleMetrics = {
  solarMasses: number;
  massKg: number;
  schwarzschildRadiusMeters: number;
  photonSphereRadiusMeters: number;
  iscoRadiusMeters: number;
  lightCrossingTimeSeconds: number;
  iscoOrbitalPeriodSeconds: number;
  iscoTimeDilation: number;
  shadowDiameterMeters: number;
};

export function schwarzschildRadiusMeters(solarMasses: number): number {
  return (2 * G * solarMasses * SOLAR_MASS_KG) / (C * C);
}

export function photonSphereRadiusMeters(solarMasses: number): number {
  return 1.5 * schwarzschildRadiusMeters(solarMasses);
}

export function iscoRadiusMeters(solarMasses: number): number {
  return 3 * schwarzschildRadiusMeters(solarMasses);
}

export function computeBlackHoleMetrics(solarMasses: number): BlackHoleMetrics {
  const schwarzschildRadius = schwarzschildRadiusMeters(solarMasses);

  return {
    solarMasses,
    massKg: solarMasses * SOLAR_MASS_KG,
    schwarzschildRadiusMeters: schwarzschildRadius,
    photonSphereRadiusMeters: 1.5 * schwarzschildRadius,
    iscoRadiusMeters: 3 * schwarzschildRadius,
    lightCrossingTimeSeconds: schwarzschildRadius / C,
    iscoOrbitalPeriodSeconds:
      2 * Math.PI * Math.sqrt(Math.pow(3 * schwarzschildRadius, 3) / (G * solarMasses * SOLAR_MASS_KG)),
    iscoTimeDilation: 1 / Math.sqrt(1 - 1 / 3),
    shadowDiameterMeters: 3 * Math.sqrt(3) * schwarzschildRadius,
  };
}
