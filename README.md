# Event Horizon Observatory

<div align="center">

### A cinematic Schwarzschild black-hole laboratory

Explore lensing, photon capture, accretion physics, relativistic beaming, gravitational redshift, and observer motion through a quiet, full-screen scientific instrument.

[**Launch the live observatory →**](https://you-are-working-inside-exactly-one.vercel.app)

![React](https://img.shields.io/badge/React-19-111827?style=flat-square&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-111827?style=flat-square&logo=threedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-typed-3178C6?style=flat-square&logo=typescript&logoColor=white)
![GLSL](https://img.shields.io/badge/GLSL-procedural-DC6C2B?style=flat-square)
![Web Audio](https://img.shields.io/badge/Web%20Audio-sonification-4D9CA3?style=flat-square)

</div>

---

## The experience

Event Horizon Observatory opens directly into a procedural view of a non-rotating Schwarzschild black hole. There is no landing page and no game-like menu: the phenomenon is the interface.

The second-generation observatory keeps the black hole completely unobstructed. Physical telemetry lives on a thin edge rail, measurement annotations sit in the scene, and a retractable command deck stays below the focal region. The result is usable like an instrument and immersive like an exhibit.

### What you can observe

- **Strong-field lensing** — a screen-space Schwarzschild deflection model combines the weak-field `4GM/(bc²)` behavior with a softened near-critical curve around the photon sphere.
- **A thermally structured accretion disk** — radial temperature falloff, inner-boundary cooling, turbulent filaments, orbital advection, and a black-body-inspired color ramp create a more coherent disk.
- **Relativistic asymmetry** — inclination-sensitive Doppler beaming brightens approaching material while gravitational redshift warms emission deeper in the potential well.
- **The photon-ring region** — a narrow diagnostic ring marks near-critical light paths around `r = 1.5 Rs`.
- **Photon Probe** — launch teaching rays that escape, deflect, briefly orbit, or cross the capture zone based on their impact parameter.
- **Observer motion** — drag with inertia, scroll to change observation scale, or move instantly between face-on, orbital, and edge-on views.
- **Scale revelation** — switch between a stellar remnant, Sagittarius A*, and M87* while the observatory recomputes physical telemetry.
- **Spatial sonification** — an opt-in Web Audio engine turns accretion intensity, time rate, and observer proximity into a restrained ambient instrument; probe launches receive a short transient.

> **Sound note:** space around the black hole is not being presented as audible. The soundtrack is a sonification of simulation parameters, not a claim that sound propagates through vacuum.

## Instrument design

The interface is designed around one rule: **never cover the phenomenon you are trying to understand.**

| Surface | Purpose |
| --- | --- |
| Top observatory rail | Guide, science notes, adaptive quality, controls, and fullscreen |
| Edge telemetry rail | Event horizon, photon sphere, ISCO, light-crossing time, orbital period, and time dilation |
| Scene annotations | Scale-invariant `Rs`, photon-sphere, and ISCO markers |
| Bottom command deck | View, inclination, accretion, time, probe, and sound |
| Advanced deck | Mass targets, relativistic layers, cinematic observations, volume, trail, and reset |

The deck collapses completely with `C`, reduces itself on tablets, and becomes a compact touch command bar on phones. Keyboard focus, readable labels, reduced-motion support, and a WebGL fallback are built in.

## Physics model

For a Schwarzschild black hole of mass `M`:

| Quantity | Model |
| --- | --- |
| Schwarzschild radius | `Rs = 2GM/c²` |
| Photon sphere | `r = 1.5 Rs` |
| Innermost stable circular orbit | `r = 3 Rs` |
| Apparent shadow diameter | `3√3 Rs` |
| Light-crossing time | `Rs / c` |
| ISCO orbital period | `2π√(r³ / GM)` at `r = 3 Rs` |
| Static time-dilation factor at ISCO | `1 / √(1 - Rs/r)` |

The GPU fragment shader then maps those relationships into a scale-invariant visual field. It models lens deflection, accretion emissivity, orbital texture advection, Doppler contrast, gravitational spectral shift, the dark shadow, and a procedural lensed starfield in real time.

### Scientific boundary

This is a **physics-informed educational visualization**, not a numerical-relativity code or a research-grade general-relativistic ray tracer.

- It does not integrate null geodesics through a full spacetime metric per pixel.
- It does not solve radiative transfer, magnetohydrodynamics, or plasma evolution.
- Photon Probe is a geodesic-inspired 2D teaching model.
- The visible dark region is the lensed black-hole shadow, not a glowing event horizon.
- The accretion disk is physically flat even when lensing shows its far side above and below the shadow.

The UI labels approximations directly so visual drama never masquerades as unsupported scientific precision.

## Controls

| Input | Action |
| --- | --- |
| Drag | Orbit around the black hole |
| Scroll / trackpad | Approach or retreat |
| `C` | Toggle the command deck |
| `H` | Open the guide |
| `G` | Toggle the spacetime grid |
| `P` | Arm Photon Probe |
| `M` | Toggle immersion mode |
| `Space` | Pause or resume simulation time |
| `R` | Reset the observation |
| `Escape` | Close the uppermost surface or leave immersion |

Sound begins only after a user gesture, in accordance with browser autoplay policy.

## Architecture

```text
src/
├── components/    command deck, telemetry, drawers, guide, fallback
├── data/          mass, view, accretion, time, and science presets
├── hooks/         shortcuts, adaptive quality, reduced motion, Web Audio
├── lib/           Schwarzschild metrics, probe paths, formatting, performance
├── scene/         canvas, camera, lensing grid, photon probe, orbit memory
└── shaders/       black-hole and procedural-starfield GLSL
```

The high-frequency render state stays inside React Three Fiber refs and shader uniforms rather than React component state. Adaptive quality controls device pixel ratio and postprocessing; mobile defaults to a lighter path, while Ultra enables multisampling and higher-detail shader behavior.

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

- Adaptive DPR and Balanced/Ultra render modes
- Mobile-specific quality defaults
- Reduced-motion behavior via `prefers-reduced-motion`
- Semantic controls and visible keyboard focus
- Touch-sized primary commands and responsive deck reduction
- WebGL capability fallback
- No audio until explicit user activation
- No essential information communicated by color alone

## References

- [NASA SVS — Black Hole with Accretion Disk Visualization](https://svs.gsfc.nasa.gov/14619/)
- [NASA SVS — Black Hole Accretion Disk Visualization](https://svs.gsfc.nasa.gov/13326/)
- [NASA Science — Anatomy of a Black Hole](https://science.nasa.gov/universe/black-holes/anatomy/)
- [Three.js documentation](https://threejs.org/docs/)
- [React Three Fiber documentation](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [The Book of Shaders](https://thebookofshaders.com/)

This independent educational project is not affiliated with or endorsed by NASA.

## License

Released under the [MIT License](LICENSE).

<div align="center">

Built by [Satyajit Beura](https://github.com/SatyajitBeura2468) for anyone curious about what light does when spacetime stops being intuitive.

</div>
