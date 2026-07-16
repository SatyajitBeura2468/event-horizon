import { approximationNotice } from "../data/scienceContent";

export function FallbackExperience() {
  return (
    <main className="fallback-experience">
      <div className="fallback-experience__mark" />
      <h1>Event Horizon Observatory</h1>
      <p>{approximationNotice}</p>
      <p>
        WebGL is unavailable in this browser or device context, so the live shader observatory cannot be rendered. The
        physical telemetry and educational notes remain valid for a Schwarzschild black hole visualisation.
      </p>
    </main>
  );
}
