import Link from "next/link";

const features = [
  {
    icon: "/θ/",
    title: "Phoneme-based learning",
    description:
      "Create classroom activities using phoneme symbols and clear English equivalents.",
  },
  {
    icon: "◫",
    title: "Live activity preview",
    description:
      "Review the activity while configuring it, before downloading the final output.",
  },
  {
    icon: "↓",
    title: "Standalone HTML",
    description:
      "Download each activity as one playable HTML file that opens in a normal browser.",
  },
];

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="page-container hero-grid">
          <div className="hero-content">
            <p className="eyebrow">Speech Pathology Classroom Tools</p>

            <h1 id="hero-heading">
              Build engaging activities with <span>phonemes at the centre</span>
            </h1>

            <p className="hero-description">
              A simple frontend builder for teachers and Speech Pathology
              students to create, preview and download phoneme-based Wordle and
              Word Search activities.
            </p>

            <div className="hero-actions">
              <Link href="/wordle" className="button button-primary">
                Create a Wordle
                <span aria-hidden="true">→</span>
              </Link>

              <Link href="/word-search" className="button button-secondary">
                Create a Word Search
              </Link>
            </div>
          </div>

          <div className="hero-preview" aria-label="Example phoneme activity">
            <div className="preview-window">
              <div className="preview-toolbar" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              <div className="preview-content">
                <p className="preview-label">Today&apos;s phoneme word</p>
                <p className="preview-word">/θɪn/</p>
                <p className="preview-hint">TH as in “thin”</p>

                <div className="example-wordle-grid" aria-hidden="true">
                  {["θ", "ɪ", "n", "θ", "ɪ", "n", "θ", "ɪ", "n"].map(
                    (symbol, index) => (
                      <span
                        key={`${symbol}-${index}`}
                        className={
                          index < 3
                            ? "example-tile correct"
                            : index < 6
                              ? "example-tile present"
                              : "example-tile"
                        }
                      >
                        {symbol}
                      </span>
                    ),
                  )}
                </div>

                <div className="example-feedback">
                  <span aria-hidden="true">✓</span>
                  Correct! /θɪn/ means “thin”.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" aria-labelledby="features-heading">
        <div className="page-container">
          <div className="section-heading">
            <p className="eyebrow">Designed for the classroom</p>
            <h2 id="features-heading">One builder, two phoneme activities</h2>
            <p>
              Configure the activity, review the result and download a playable
              file without requiring specialist software.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <span className="feature-icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="activity-section"
        aria-labelledby="activities-heading"
      >
        <div className="page-container">
          <div className="section-heading">
            <p className="eyebrow">Choose an activity</p>
            <h2 id="activities-heading">Start building</h2>
          </div>

          <div className="activity-grid">
            <article className="activity-card wordle-card">
              <div className="activity-card-content">
                <span className="activity-number">01</span>
                <p className="activity-type">Single-answer activity</p>
                <h3>Phoneme Wordle</h3>
                <p>
                  Create a Wordle-style activity using one phoneme word, custom
                  hints and a selectable number of guesses.
                </p>

                <ul>
                  <li>Phoneme keyboard and hover hints</li>
                  <li>Live classroom preview</li>
                  <li>English answer feedback</li>
                </ul>

                <Link href="/wordle" className="text-link">
                  Open Wordle builder
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            <article className="activity-card word-search-card">
              <div className="activity-card-content">
                <span className="activity-number">02</span>
                <p className="activity-type">Five-word activity</p>
                <h3>Phoneme Word Search</h3>
                <p>
                  Generate a small word search using phoneme-based words and
                  supportive English-language hints.
                </p>

                <ul>
                  <li>Approximately five target words</li>
                  <li>Interactive phoneme grid</li>
                  <li>Downloadable browser activity</li>
                </ul>

                <Link href="/word-search" className="text-link">
                  Open Word Search builder
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="workflow-section" aria-labelledby="workflow-heading">
        <div className="page-container">
          <div className="section-heading">
            <p className="eyebrow">A clear teacher workflow</p>
            <h2 id="workflow-heading">Create an activity in three steps</h2>
          </div>

          <ol className="workflow-list">
            <li>
              <span>1</span>
              <div>
                <h3>Configure</h3>
                <p>Select the phoneme word, hints and activity preferences.</p>
              </div>
            </li>

            <li>
              <span>2</span>
              <div>
                <h3>Preview</h3>
                <p>Review the playable result and make any required changes.</p>
              </div>
            </li>

            <li>
              <span>3</span>
              <div>
                <h3>Download</h3>
                <p>Generate one standalone HTML file for classroom use.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="home-callout">
        <div className="page-container callout-content">
          <div>
            <p className="eyebrow">Assessment 1</p>
            <h2>Frontend design built for later expansion</h2>
            <p>
              This version focuses on interface design, usability and
              accessibility. Database-driven word lists will be introduced in
              the next assessment.
            </p>
          </div>

          <Link href="/about" className="button button-light">
            Learn about the project
          </Link>
        </div>
      </section>
    </main>
  );
}
