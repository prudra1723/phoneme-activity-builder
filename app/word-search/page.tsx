import type { Metadata } from "next";

import WordSearchBuilder from "@/components/WordSearchBuilder";

export const metadata: Metadata = {
  title: "Phoneme Word Search Builder",
  description:
    "Create, preview and download a playable phoneme-based Word Search classroom activity.",
};

export default function WordSearchPage() {
  return (
    <main id="main-content" className="builder-page">
      <section className="page-banner word-search-banner">
        <div className="page-container builder-banner-content">
          <div>
            <p className="eyebrow">Five-word phoneme activity</p>

            <h1>Phoneme Word Search Builder</h1>

            <p>
              Create a classroom word search containing approximately five
              phoneme-based words, supported by English equivalences and
              accessible hints.
            </p>
          </div>

          <aside
            className="assessment-notice"
            aria-label="Assessment 1 project scope"
          >
            <span className="assessment-notice-icon" aria-hidden="true">
              5
            </span>

            <div>
              <strong>Assessment 1 scope</strong>

              <p>
                This frontend version uses five fixed phoneme words.
                Database-driven word lists and more advanced generation will be
                introduced in Assessment 2.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section
        className="builder-section"
        aria-labelledby="word-search-builder-heading"
      >
        <div className="page-container">
          <div className="builder-introduction">
            <div>
              <p className="eyebrow">Configure and preview</p>

              <h2 id="word-search-builder-heading">
                Create your phoneme word search
              </h2>
            </div>

            <ol
              className="builder-steps"
              aria-label="Activity builder workflow"
            >
              <li>
                <span aria-hidden="true">1</span>
                Configure
              </li>

              <li>
                <span aria-hidden="true">2</span>
                Preview
              </li>

              <li>
                <span aria-hidden="true">3</span>
                Download
              </li>
            </ol>
          </div>

          <WordSearchBuilder />
        </div>
      </section>

      <section
        className="activity-help-section"
        aria-labelledby="word-search-help-heading"
      >
        <div className="page-container help-grid">
          <article>
            <span
              className="help-icon word-search-help-icon"
              aria-hidden="true"
            >
              ⌕
            </span>

            <h2 id="word-search-help-heading">Find phoneme-based words</h2>

            <p>
              Learners search an interactive grid for five words represented
              using phoneme symbols rather than standard English spelling.
            </p>
          </article>

          <article>
            <span
              className="help-icon word-search-help-icon"
              aria-hidden="true"
            >
              /ʃ/
            </span>

            <h2>Phoneme equivalence hints</h2>

            <p>
              Mouse hover and keyboard focus reveal useful labels such as “/ʃ/ —
              SH as in ship” to support sound and spelling recognition.
            </p>
          </article>

          <article>
            <span
              className="help-icon word-search-help-icon"
              aria-hidden="true"
            >
              ✓
            </span>

            <h2>Accessible feedback</h2>

            <p>
              Found words are identified through text, symbols and colour so
              learner progress never depends on colour alone.
            </p>
          </article>

          <article>
            <span
              className="help-icon word-search-help-icon"
              aria-hidden="true"
            >
              ↓
            </span>

            <h2>Standalone HTML output</h2>

            <p>
              Teachers can download the completed activity as one playable HTML
              file that runs in a normal web browser without the React builder.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
