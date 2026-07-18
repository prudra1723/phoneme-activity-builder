"use client";

export default function WordleBuilder() {
  return (
    <div className="builder-workspace">
      <section className="builder-panel">
        <p className="eyebrow">Activity settings</p>
        <h2>Configure Wordle</h2>
        <p>Wordle configuration controls will appear here.</p>
      </section>

      <section className="preview-panel">
        <p className="eyebrow">Live preview</p>
        <h2>Activity preview</h2>
        <p>The playable phoneme Wordle preview will appear here.</p>
      </section>
    </div>
  );
}
