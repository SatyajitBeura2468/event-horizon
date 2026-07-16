export const approximationNotice =
  "An interactive educational visualisation using simplified, physics-informed optical approximations. It is not full general-relativistic ray tracing or a research-grade simulation.";

export const scienceSections = [
  {
    title: "What You Are Seeing",
    body:
      "This scene represents a non-rotating Schwarzschild black hole with a flat luminous accretion disk, a dark lensed shadow, a narrow photon-ring region, and a distorted background starfield.",
  },
  {
    title: "Event Horizon and Shadow",
    body:
      "The event horizon emits no light. The visible dark region is the black-hole shadow, which appears larger than the actual horizon because gravitational lensing removes or redirects nearby light paths.",
  },
  {
    title: "Photon Ring",
    body:
      "The narrow bright region traces rays whose closest approach sits near the photon sphere. It is deliberately restrained: a true photon ring is far thinner than a display pixel and much fainter than the primary disk image.",
  },
  {
    title: "Accretion Disk",
    body:
      "The disk remains physically flat. It can appear both above and below the black hole because light from the far side can bend around the shadow before reaching the observer.",
  },
  {
    title: "Gravitational Lensing",
    body:
      "A continuous impact-parameter deflection field bends background directions toward the compact object. A stable transfer approximation reconstructs the strongly lensed far-side disk above the shadow without detached ellipses or screen-space seams.",
  },
  {
    title: "Doppler Beaming",
    body:
      "Disk material moving toward the observer is shown brighter and hotter than material moving away. This is a simplified relativistic beaming cue tied to viewing angle.",
  },
  {
    title: "Gravitational Redshift",
    body:
      "Emission produced deeper in the gravitational potential is shifted toward longer wavelengths before it reaches the observer. The redshift layer applies this as a restrained spectral cue rather than claiming full radiative transfer.",
  },
  {
    title: "The Photon Probe",
    body:
      "Photon Probe uses an illustrative 2D geodesic-inspired approximation. Rays far from the shadow escape, near-critical rays may loop briefly, and paths entering the capture zone fade into the shadow.",
  },
  {
    title: "What This Simulation Approximates",
    body:
      "The shader evaluates a scale-invariant Schwarzschild-inspired optical transfer field, procedural plasma emissivity, and approximate relativistic frequency shifts per pixel. It does not solve the Einstein field equations, magnetohydrodynamics, or research-grade covariant radiative transfer.",
  },
  {
    title: "About the Sound",
    body:
      "The audio is an optional sonification driven by accretion intensity, time rate, and observer proximity. It is an interpretive instrument: sound is not presented as propagating through the vacuum around the black hole.",
  },
  {
    title: "Sources and Credits",
    body:
      "Scientific visual references include NASA Scientific Visualization Studio materials. This independent educational project is not affiliated with, endorsed by, or sponsored by NASA.",
  },
] as const;

export const referenceLinks = [
  {
    label: "NASA SVS: Black Hole with Accretion Disk Visualization",
    href: "https://svs.gsfc.nasa.gov/14619/",
  },
  {
    label: "NASA SVS: Black Hole Accretion Disk Visualization",
    href: "https://svs.gsfc.nasa.gov/13326/",
  },
  {
    label: "NASA Science: Anatomy of a Black Hole",
    href: "https://science.nasa.gov/universe/black-holes/anatomy/",
  },
  {
    label: "NASA image and media guidance",
    href: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
  },
  {
    label: "Three.js documentation",
    href: "https://threejs.org/docs/",
  },
  {
    label: "React Three Fiber documentation",
    href: "https://r3f.docs.pmnd.rs/getting-started/introduction",
  },
  {
    label: "Drei repository and documentation",
    href: "https://github.com/pmndrs/drei",
  },
  {
    label: "React Postprocessing repository",
    href: "https://github.com/pmndrs/react-postprocessing",
  },
  {
    label: "The Book of Shaders",
    href: "https://thebookofshaders.com/",
  },
] as const;
