import { HOME_TREE_LABELS } from "@/lib/home-content";

export function LivingTreePreview() {
  return (
    <section className="mh-tree" aria-labelledby="home-tree-heading">
      <div className="mh-container">
        <p className="mh-eyebrow">Anı ağacı</p>
        <h2 id="home-tree-heading" className="mh-section-title">
          Her mesaj bir yaprak
        </h2>
        <p className="mh-section-lead">
          Misafirleriniz bıraktığı her anı ağacınızı büyütür — mesaj, fotoğraf,
          video ve quiz bir arada.
        </p>
        <div className="mh-divider" />

        <div className="mh-tree__visual" aria-hidden>
          <div className="mh-tree__trunk" />
          <div className="mh-tree__orb mh-tree__orb--1" />
          <div className="mh-tree__orb mh-tree__orb--2" />
          <div className="mh-tree__orb mh-tree__orb--3" />
          <div className="mh-tree__orb mh-tree__orb--4" />
          <div className="mh-tree__orb mh-tree__orb--5" />
          <div className="mh-tree__labels">
            {HOME_TREE_LABELS.map((label) => (
              <span key={label} className="mh-tree__label">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
