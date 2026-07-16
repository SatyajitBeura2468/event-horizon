import { useEffect, useMemo, useState } from "react";
import { getSafeDevicePixelRatio, isLikelyMobileDevice, type QualityMode } from "../lib/performance";

export type AdaptiveQualityState = {
  mode: QualityMode;
  setMode: (mode: QualityMode) => void;
  dpr: number;
  averageFrameMs: number;
  constrained: boolean;
  mobileDefault: boolean;
};

export function useAdaptiveQuality(): AdaptiveQualityState {
  const mobileDefault = useMemo(() => isLikelyMobileDevice(), []);
  const [mode, setMode] = useState<QualityMode>(mobileDefault ? "balanced" : "ultra");
  const [averageFrameMs, setAverageFrameMs] = useState(16.7);
  const [constrained, setConstrained] = useState(mobileDefault);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let rolling = 16.7;
    let raf = 0;

    const tick = (time: number) => {
      const delta = time - last;
      last = time;
      rolling = rolling * 0.94 + delta * 0.06;
      frame += 1;

      if (frame % 24 === 0) {
        setAverageFrameMs(Number(rolling.toFixed(1)));
        setConstrained(rolling > 29 || (mobileDefault && mode === "ultra"));
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [mobileDefault, mode]);

  return {
    mode,
    setMode,
    dpr: getSafeDevicePixelRatio(mode, constrained),
    averageFrameMs,
    constrained,
    mobileDefault,
  };
}
