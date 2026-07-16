import { X } from "lucide-react";
import { approximationNotice, referenceLinks, scienceSections } from "../data/scienceContent";

type ScienceDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function ScienceDrawer({ open, onClose }: ScienceDrawerProps) {
  return (
    <aside className={`drawer science-drawer ${open ? "drawer--open" : ""}`} aria-hidden={!open} aria-label="Science drawer">
      <div className="drawer__header">
        <div>
          <span>Scientific Basis</span>
          <h2>What the observatory is approximating</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close science drawer">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="drawer__notice">{approximationNotice}</p>
      <div className="science-sections">
        {scienceSections.map((section) => (
          <section key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
      <div className="reference-list">
        <h3>References</h3>
        {referenceLinks.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
