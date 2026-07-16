import { useCallback, useEffect, useRef, useState } from "react";

type AudioParameters = {
  accretion: number;
  timeSpeed: number;
  zoom: number;
};

type AudioGraph = {
  context: AudioContext;
  master: GainNode;
  drone: OscillatorNode;
  overtone: OscillatorNode;
  droneGain: GainNode;
  noiseGain: GainNode;
};

function createNoiseBuffer(context: AudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let index = 0; index < data.length; index += 1) {
    const white = Math.random() * 2 - 1;
    last = last * 0.985 + white * 0.015;
    data[index] = last * 2.4;
  }

  return buffer;
}

export function useObservatoryAudio(parameters: AudioParameters) {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(0.42);
  const graphRef = useRef<AudioGraph | null>(null);
  const parametersRef = useRef(parameters);
  parametersRef.current = parameters;

  const ensureGraph = useCallback(() => {
    if (graphRef.current) {
      return graphRef.current;
    }

    const AudioContextCtor = window.AudioContext;
    const context = new AudioContextCtor();
    const master = context.createGain();
    const compressor = context.createDynamicsCompressor();
    const droneGain = context.createGain();
    const noiseGain = context.createGain();
    const drone = context.createOscillator();
    const overtone = context.createOscillator();
    const overtoneGain = context.createGain();
    const noise = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();

    master.gain.value = 0;
    compressor.threshold.value = -28;
    compressor.knee.value = 20;
    compressor.ratio.value = 5;
    drone.type = "sine";
    overtone.type = "triangle";
    drone.frequency.value = 43;
    overtone.frequency.value = 86.4;
    droneGain.gain.value = 0.07;
    overtoneGain.gain.value = 0.012;
    noiseGain.gain.value = 0.012;
    noise.buffer = createNoiseBuffer(context);
    noise.loop = true;
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 260;
    noiseFilter.Q.value = 0.7;

    drone.connect(droneGain).connect(master);
    overtone.connect(overtoneGain).connect(master);
    noise.connect(noiseFilter).connect(noiseGain).connect(master);
    master.connect(compressor).connect(context.destination);
    drone.start();
    overtone.start();
    noise.start();

    graphRef.current = { context, master, drone, overtone, droneGain, noiseGain };
    return graphRef.current;
  }, []);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const now = graph.context.currentTime;
    const proximity = 1.72 - parameters.zoom;
    const baseFrequency = 38 + parameters.accretion * 9 + proximity * 4;
    graph.drone.frequency.setTargetAtTime(baseFrequency, now, 0.8);
    graph.overtone.frequency.setTargetAtTime(baseFrequency * 2.008, now, 0.8);
    graph.droneGain.gain.setTargetAtTime(0.045 + parameters.accretion * 0.035, now, 0.5);
    graph.noiseGain.gain.setTargetAtTime(0.004 + parameters.accretion * 0.018 * Math.min(parameters.timeSpeed, 1.8), now, 0.5);
  }, [parameters.accretion, parameters.timeSpeed, parameters.zoom]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.master.gain.setTargetAtTime(enabled ? volume * 0.34 : 0, graph.context.currentTime, 0.18);
  }, [enabled, volume]);

  useEffect(() => () => {
    const graph = graphRef.current;
    if (graph) void graph.context.close();
  }, []);

  const toggle = useCallback(() => {
    const graph = ensureGraph();
    if (graph.context.state === "suspended") void graph.context.resume();
    setEnabled((current) => !current);
  }, [ensureGraph]);

  const ping = useCallback(() => {
    if (!enabled) return;
    const graph = ensureGraph();
    const now = graph.context.currentTime;
    const oscillator = graph.context.createOscillator();
    const gain = graph.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(720, now);
    oscillator.frequency.exponentialRampToValueAtTime(130, now + 0.82);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.86);
    oscillator.connect(gain).connect(graph.master);
    oscillator.start(now);
    oscillator.stop(now + 0.9);
  }, [enabled, ensureGraph]);

  return { enabled, volume, setVolume, toggle, ping };
}
