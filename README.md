# Event Horizon Observatory

<div align="center">

### A real-time Schwarzschild black-hole instrument

Trace bent light, cross the photon sphere, study relativistic accretion, and hear the simulation respond in a full-screen interactive observatory.

[**Enter the live observatory**](https://you-are-working-inside-exactly-one.vercel.app)

![React](https://img.shields.io/badge/React-19-111827?style=flat-square&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-111827?style=flat-square&logo=threedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-typed-3178C6?style=flat-square&logo=typescript&logoColor=white)
![GLSL](https://img.shields.io/badge/GLSL-relativistic%20transfer-DC6C2B?style=flat-square)
![Web Audio](https://img.shields.io/badge/Web%20Audio-sonification-4D9CA3?style=flat-square)

</div>

---

## The phenomenon is the interface

Event Horizon Observatory opens directly on a living, procedural view of a non-rotating black hole. There is no landing screen between the observer and the physics. Telemetry occupies a thin edge rail, scale annotations float around the shadow, and a retractable command deck stays outside the focal region.

The latest renderer replaces cut-off disk segments and unstable volume slices with one continuous optical-transfer model. A smooth impact-parameter deflection field handles the lensed starfield, while ordered rear-disk, shadow, and foreground-disk compositing reconstructs the strongly bent flow without a detached ellipse. The result remains coherent from face-on to edge-on observation.

## What is simulated

- **Schwarzschild-inspired optical transfer** bends background viewing directions continuously toward the compact object without exposing discrete ray-march slices.
- **Ordered radiative compositing** layers the rear disk, lensed far side, circular shadow, and foreground plasma in their correct visual order.
- **Keplerian plasma flow** advects broad eddies, fine turbulence, spiral density waves, and sheared filaments at radius-dependent orbital rates.
- **Relativistic Doppler beaming** brightens and blueshifts approaching material while dimming the receding side.
- **Gravitational redshift** cools emission formed deeper in the potential well before it reaches the observer.
- **Continuous secondary disk images** reveal the physically flat far side above and below the shadow without abrupt cuts.
- **Near-critical light paths** form a deliberately restrained photon-ring diagnostic rather than an oversized decorative halo.
- **Lensed procedural starlight** follows the escaped ray direction, so the background distorts with the optics.
- **Photon Probe** launches impact-parameter experiments that escape, deflect, orbit briefly, or enter the capture region.
- **Spatial sonification** maps accretion state, observer proximity, and simulation time into an opt-in ambient instrument.

> Sound is a sonification of simulation parameters. It is not presented as sound propagating through the vacuum around a black hole.

## Live physics console

Open the advanced deck to tune the GPU model without interrupting the simulation:

| Parameter | Effect |
| --- | --- |
| Lensing | Scales strong-field optical deflection and the apparent secondary image |
| Disk heat | Changes the emitted thermal spectrum from ember to white-hot plasma |
| Turbulence | Blends from a calm disk into multi-scale filaments and spiral structure |
| Plasma | Controls projected density, optical depth, and filament contrast |
| Exposure | Adjusts the final filmic response without flattening local contrast |

The main deck also provides face-on, orbital, edge-on, and free-look cameras; three accretion states; time dilation controls; Photon Probe; sound; relativistic layer toggles; three mass references; and cinematic observation sequences.

## Instrument layout

| Surface | Purpose |
| --- | --- |
| Observatory rail | Guide, science notes, adaptive quality, controls, and fullscreen |
| Telemetry rail | Event horizon, photon sphere, ISCO, light-crossing time, orbital period, and time dilation |
| Scene annotations | Quiet scale and radius references around the focal region |
| Command deck | View, inclination, accretion, time, probe, sound, and advanced controls |
| Advanced deck | Live physics, mass targets, relativistic layers, cinematic moments, volume, and reset |

The deck collapses with `C`, shifts the simulation upward when expanded, reduces itself on tablets, and becomes a compact touch interface on phones. Keyboard focus, reduced-motion support, semantic labels, and a WebGL fallback are built in.

## Physical reference model

For a Schwarzschild black hole of mass `M`:

| Quantity | Relationship |
| --- | --- |
| Schwarzschild radius | `Rs = 2GM/c^2` |
| Photon sphere | `r = 1.5 Rs` |
| Innermost stable circular orbit | `r = 3 Rs` |
| Apparent shadow diameter | `3 sqrt(3) Rs` |
| Light-crossing time | `Rs / c` |
| ISCO orbital period | `2 pi sqrt(r^3 / GM)` at `r = 3 Rs` |
| Static time-dilation factor | `1 / sqrt(1 - Rs/r)` |

Changing between a 10-solar-mass stellar remnant, Sagittarius A\*, and M87\* recomputes dimensional telemetry while leaving the scale-invariant optical geometry intact.

### Scientific boundary

This is a physics-informed educational visualization, not numerical-relativity software.

- The transfer shader is a real-time Schwarzschild-inspired optical approximation, not a full null-geodesic solver through a spacetime metric.
- The plasma model approximates emissivity and optical depth; it does not solve general-relativistic magnetohydrodynamics or covariant radiative transfer.
- The secondary image uses a continuous transfer approximation to keep the strongly lensed disk stable at interactive frame rates.
- Photon Probe is an illustrative 2D path classifier.
- The dark center is the lensed black-hole shadow, not a glowing event horizon.
- The accretion disk remains physically flat even when lensing displays its far side above and below the shadow.

These limits are also stated inside the Science panel so visual drama never masquerades as unsupported precision.

## Controls

| Input | Action |
| --- | --- |
| Drag | Orbit around the black hole with inertia |
| Scroll / trackpad | Approach or retreat |
| `C` | Toggle the command deck |
| `H` | Open the guide |
| `G` | Toggle the spacetime grid |
| `P` | Arm Photon Probe |
| `M` | Toggle immersion mode |
| `Space` | Pause or resume simulation time |
| `R` | Reset the complete observation |
| `Escape` | Close the uppermost surface or leave immersion |

Audio begins only after an explicit user gesture, following browser autoplay policy.

## Architecture

```text
src/
|-- components/   command deck, telemetry, drawers, guide, fallback
|-- data/         camera, mass, accretion, time, and science presets
|-- hooks/        shortcuts, adaptive quality, reduced motion, Web Audio
|-- lib/          Schwarzschild metrics, probe paths, formatting, performance
|-- scene/        GPU canvas, camera rig, lensing grid, probes, orbit memory
`-- shaders/      hybrid black-hole optics and procedural starfield GLSL
```

High-frequency render state remains in React Three Fiber refs and GLSL uniforms, avoiding React renders inside the animation loop. Adaptive quality continuously watches frame pacing, clamps device pixel ratio, and falls back to the balanced shader path when the GPU is under pressure.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

### Production validation

```bash
npm run lint
npm run build
npm run preview
```

## Performance and accessibility

- Balanced and Ultra render modes with adaptive shader fallback
- Dynamic DPR clamp and mobile-specific defaults
- Reduced-motion behavior via `prefers-reduced-motion`
- Responsive desktop, tablet, and phone control layouts
- Semantic controls, accessible labels, and visible keyboard focus
- Touch-sized primary commands
- WebGL capability fallback
- No sound before explicit activation
- No essential information communicated by color alone

## References

- [NASA SVS - Black Hole with Accretion Disk Visualization](https://svs.gsfc.nasa.gov/14619/)
- [NASA SVS - Black Hole Accretion Disk Visualization](https://svs.gsfc.nasa.gov/13326/)
- [NASA Science - Anatomy of a Black Hole](https://science.nasa.gov/universe/black-holes/anatomy/)
- [Three.js documentation](https://threejs.org/docs/)
- [React Three Fiber documentation](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [The Book of Shaders](https://thebookofshaders.com/)

This independent educational project is not affiliated with or endorsed by NASA.

## License

Released under the [MIT License](LICENSE).

<div align="center">

Built by [Satyajit Beura](https://github.com/SatyajitBeura2468) for anyone curious about what light does when spacetime stops behaving intuitively.

</div>
