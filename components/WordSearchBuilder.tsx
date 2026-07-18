"use client";

export default function WordSearchBuilder() {
  return (
    <div className="builder-workspace">
      <section className="builder-panel">
        <p className="eyebrow">Activity settings</p>
        <h2>Configure Word Search</h2>
        <p>Word Search configuration controls will appear here.</p>
      </section>

      <section className="preview-panel">
        <p className="eyebrow">Live preview</p>
        <h2>Word Search preview</h2>
        <p>The interactive phoneme Word Search will appear here.</p>
      </section>
    </div>
  );
}
