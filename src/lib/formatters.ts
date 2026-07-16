const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export function formatKilometers(meters: number): string {
  const km = meters / 1000;

  if (km >= 1_000_000) {
    return `${compactFormatter.format(km)} km`;
  }

  return `${numberFormatter.format(km)} km`;
}

export function formatMass(solarMasses: number): string {
  if (solarMasses >= 1_000_000_000) {
    return `${numberFormatter.format(solarMasses / 1_000_000_000)} billion solar masses`;
  }

  if (solarMasses >= 1_000_000) {
    return `${numberFormatter.format(solarMasses / 1_000_000)} million solar masses`;
  }

  return `${numberFormatter.format(solarMasses)} solar masses`;
}

export function formatSeconds(seconds: number): string {
  if (seconds >= 3600) {
    return `${numberFormatter.format(seconds / 3600)} h`;
  }

  if (seconds >= 60) {
    return `${numberFormatter.format(seconds / 60)} min`;
  }

  if (seconds >= 1) {
    return `${numberFormatter.format(seconds)} s`;
  }

  return `${numberFormatter.format(seconds * 1000)} ms`;
}

export function formatDegrees(value: number): string {
  return `${Math.round(value)} deg`;
}
