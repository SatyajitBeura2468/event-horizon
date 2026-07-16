type ImmersionModeProps = {
  active: boolean;
  onExit: () => void;
};

export function ImmersionMode({ active, onExit }: ImmersionModeProps) {
  if (!active) {
    return null;
  }

  return (
    <div className="immersion-mark" aria-live="polite">
      <span>OBSERVATION FIELD</span>
      <button type="button" onClick={onExit}>
        Exit immersion
      </button>
    </div>
  );
}
