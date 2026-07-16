import { useEffect } from "react";

export type ShortcutHandlers = {
  toggleGuide: () => void;
  toggleControls: () => void;
  toggleGrid: () => void;
  togglePhotonProbe: () => void;
  toggleImmersion: () => void;
  togglePause: () => void;
  resetObservation: () => void;
  closeTopLayer: () => void;
};

export function useKeyboardShortcuts(handlers: ShortcutHandlers): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();

      if (tag === "input" || tag === "select" || tag === "textarea" || target?.isContentEditable) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "h") {
        event.preventDefault();
        handlers.toggleGuide();
      }

      if (key === "c") {
        event.preventDefault();
        handlers.toggleControls();
      }

      if (key === "g") {
        event.preventDefault();
        handlers.toggleGrid();
      }

      if (key === "p") {
        event.preventDefault();
        handlers.togglePhotonProbe();
      }

      if (key === "m") {
        event.preventDefault();
        handlers.toggleImmersion();
      }

      if (event.code === "Space") {
        event.preventDefault();
        handlers.togglePause();
      }

      if (key === "r") {
        event.preventDefault();
        handlers.resetObservation();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        handlers.closeTopLayer();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
