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

          <aside
            className="assessment-notice"
            aria-label="Saved activity workflow"
          >
            <span className="assessment-notice-icon" aria-hidden="true">
              1
            </span>

            <div>
              <strong>Build from saved activities</strong>
              <p>
                Load a saved word and activity settings, preview your Wordle and
                download a playable HTML file. Review generation activity on the
                dashboard.
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
        <div className="page-container">
          <h2 id="wordle-help-heading" className="sr-only">
            Wordle activity information
          </h2>

          <div className="help-grid">
            <article>
              <span className="help-icon" aria-hidden="true">
                /θ/
              </span>
              <h3>Phoneme-first design</h3>
              <p>
                The activity uses phoneme symbols as the primary input rather
                than standard English spelling. This supports pronunciation and
                sound-awareness teaching.
              </p>
            </article>

            <article>
              <span className="help-icon" aria-hidden="true">
                ?
              </span>
              <h3>Helpful equivalences</h3>
              <p>
                Learners can hover over or focus on phoneme controls to see
                English-letter guidance, such as “/θ/ — TH as in thin”.
              </p>
            </article>

            <article>
              <span className="help-icon" aria-hidden="true">
                ↓
              </span>
              <h3>One portable file</h3>
              <p>
                The Download playable HTML button creates one file containing
                its own layout, styles and gameplay JavaScript.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
