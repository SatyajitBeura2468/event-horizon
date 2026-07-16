# Event Horizon Observatory

<div align="center">

### A living visual laboratory for the edge of a black hole

An interactive Schwarzschild black-hole observatory built with React, Three.js, and custom GLSL. Explore gravitational lensing, photon paths, observer motion, scale, and light itself through a calm, cinematic control surface.

<a href="https://event-horizon-observatory.vercel.app">Open the live observatory</a>

![React](https://img.shields.io/badge/React-19-111827?style=flat-square&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-111827?style=flat-square&logo=threedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-typed-3178C6?style=flat-square&logo=typescript&logoColor=white)
![GLSL](https://img.shields.io/badge/GLSL-custom%20shaders-7C3AED?style=flat-square)

</div>

## What this is

Event Horizon Observatory opens directly into a procedural visual scene of a non-rotating Schwarzschild black hole. The dark shadow, photon-ring region, warped starfield, lensed accretion disk, Doppler brightening, and observatory telemetry are designed to make difficult ideas feel observable.

It is an educational visualisation using simplified, physics-informed optical approximations. It is not a research-grade numerical relativity solver or a full general-relativistic ray tracer.

## Explore the observatory

- **Observer mode:** drag, orbit, zoom, and move through Face-On, Orbital, Edge-On, and Free Look views.
- **Photon Probe:** release illustrative light packets and watch them escape, deflect, orbit critically, or fall into the shadow.
- **Lensing Reveal:** expose a restrained coordinate grid and Einstein-ring diagnostic cue.
- **Orbit Memory:** leave a subtle record of your recent observer path, then clear it when you want a clean view.
- **Scale Revelation:** compare a 10-solar-mass stellar remnant with Sagittarius A* and M87*.
- **Immersion Mode:** fade the interface away for a quiet observation or a screenshot.
- **Cinematic moments:** start Approach the Shadow, Edge-On Distortion, or Inside the Einstein Ring.
- **Adaptive rendering:** choose Balanced or Ultra quality, with reduced-motion and WebGL fallback support.

## Controls

| Input | Action |
| --- | --- |
| Drag | Orbit around the black hole |
| Scroll | Approach or retreat |
| `H` | Toggle the guide |
| `C` | Toggle the control dock |
| `G` | Toggle the lensing grid |
| `P` | Toggle Photon Probe |
| `M` | Toggle Immersion Mode |
| `Space` | Pause or resume simulation time |
| `R` | Reset the observation |
| `Escape` | Close drawers or leave immersion |

## Technology

The project uses Vite, React, TypeScript, React Three Fiber, Drei, React Postprocessing, Three.js, custom GLSL shader materials, and a small physics layer for Schwarzschild telemetry and photon-probe approximations.

```text
src/
├── components/   observatory HUD, controls, drawers, loaders, fallbacks
├── data/         presets and science copy
├── hooks/        keyboard shortcuts, quality, reduced motion
├── lib/          physics, formatting, performance, black-hole maths
├── scene/        black hole, starfield, lensing grid, probe, camera
└── shaders/      black-hole and starfield GLSL programs
```

## Local development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

For a production check:

```bash
npm run build
npm run lint
npm run preview
```

## Scientific boundaries

The visual model is intentionally clear about what it represents:

- The event horizon emits no light. The dark region shown is the larger lensed black-hole shadow.
- The disk is physically flat, but lensing can show light from its far side above and below the shadow.
- Doppler brightening is strongest on material moving toward the observer.
- Mass presets update physical telemetry while the visual scene stays readable at observatory scale.
- Photon Probe is a geodesic-inspired 2D teaching aid, not a numerical general-relativity calculation.

Reference material includes NASA Scientific Visualization Studio, NASA Science, Three.js, React Three Fiber, Drei, React Postprocessing, and The Book of Shaders. This independent project is not affiliated with NASA.

## License

Source code is released under the repository's [MIT License](LICENSE).

<div align="center">

Built by [Satyajit Beura](https://github.com/SatyajitBeura2468) for anyone curious about what light does when space stops being intuitive.

</div>
