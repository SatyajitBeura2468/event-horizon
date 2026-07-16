export function Loader() {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader__ring" />
      <span>Calibrating observatory optics</span>
    </div>
  );
}
