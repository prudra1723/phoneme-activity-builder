import type { Metadata } from "next";

import WordleBuilder from "@/components/WordleBuilder";

export const metadata: Metadata = {
  title: "Phoneme Wordle Builder",
  description:
    "Create, preview and download a single-word phoneme-based Wordle classroom activity.",
};

export default function WordlePage() {
  return (
    <main id="main-content" className="builder-page">
      <section className="page-banner">
        <div className="page-container builder-banner-content">
          <div>
            <p className="eyebrow">Single phoneme activity</p>
            <h1>Phoneme Wordle Builder</h1>
            <p>
              Configure one phoneme-based word, review the activity and download
              it as a standalone playable HTML file.
            </p>
          </div>

          <aside className="assessment-notice" aria-label="Assessment scope">
            <span className="assessment-notice-icon" aria-hidden="true">
              1
            </span>

            <div>
              <strong>Assessment 1 scope</strong>
              <p>
                This version uses one phoneme word. Database-driven word lists
                will be added in Assessment 2.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section
        className="builder-section"
        aria-labelledby="builder-section-heading"
      >
        <div className="page-container">
          <div className="builder-introduction">
            <div>
              <p className="eyebrow">Configure and preview</p>
              <h2 id="builder-section-heading">
                Create your classroom activity
              </h2>
            </div>

            <ol className="builder-steps" aria-label="Builder workflow">
              <li>
                <span>1</span>
                Configure
              </li>
              <li>
                <span>2</span>
                Preview
              </li>
              <li>
                <span>3</span>
                Download
              </li>
            </ol>
          </div>

          <WordleBuilder />
        </div>
      </section>

      <section
        className="wordle-help-section"
        aria-labelledby="wordle-help-heading"
      >
        <div className="page-container help-grid">
          <article>
            <span className="help-icon" aria-hidden="true">
              /θ/
            </span>
            <h2 id="wordle-help-heading">Phoneme-first design</h2>
            <p>
              The activity uses phoneme symbols as the primary input rather than
              standard English spelling. This supports pronunciation and
              sound-awareness teaching.
            </p>
          </article>

          <article>
            <span className="help-icon" aria-hidden="true">
              ?
            </span>
            <h2>Helpful equivalences</h2>
            <p>
              Learners can hover over or focus on phoneme controls to see
              English-letter guidance, such as “/θ/ — TH as in thin”.
            </p>
          </article>

          <article>
            <span className="help-icon" aria-hidden="true">
              ↓
            </span>
            <h2>One portable file</h2>
            <p>
              The Generate button downloads one HTML file containing its own
              layout, styles and gameplay JavaScript.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
