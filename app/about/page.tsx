import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about the Phoneme Activity Builder, its assessment scope and how teachers can use its Wordle and Word Search tools.",
};

const projectFeatures = [
  {
    symbol: "/θ/",
    title: "Phoneme Wordle",
    description:
      "Creates a Wordle-style classroom activity using one phoneme-based word, English equivalence hints and configurable guesses.",
    link: "/wordle",
    linkLabel: "Open Wordle builder",
  },
  {
    symbol: "⌕",
    title: "Phoneme Word Search",
    description:
      "Creates an interactive word search using approximately five phoneme-based words and accessible learner feedback.",
    link: "/word-search",
    linkLabel: "Open Word Search builder",
  },
];

export default function AboutPage() {
  return (
    <main id="main-content" className="about-page">
      <section className="page-banner about-banner">
        <div className="page-container about-banner-content">
          <div>
            <p className="eyebrow">About the project</p>

            <h1>Classroom activities with phonemes at the centre</h1>

            <p>
              The Phoneme Activity Builder helps teachers and Speech Pathology
              students create, preview and download accessible phoneme-based
              learning activities.
            </p>
          </div>

          <div className="about-phoneme-display" aria-hidden="true">
            <span>/θ/</span>
            <span>/ʃ/</span>
            <span>/tʃ/</span>
          </div>
        </div>
      </section>

      <section
        className="about-overview-section"
        aria-labelledby="project-overview-heading"
      >
        <div className="page-container about-overview-grid">
          <article className="about-overview-content">
            <p className="eyebrow">Project overview</p>

            <h2 id="project-overview-heading">
              A frontend builder for teachers
            </h2>

            <p>
              This project is designed for teachers and Speech Pathology
              students rather than clients. It provides a clear workflow for
              configuring an activity, previewing the result and downloading a
              playable classroom resource.
            </p>

            <p>
              The generated activities download as individual HTML files. Each
              file contains the required layout, styling and gameplay code, so
              it can run independently in a normal web browser.
            </p>

            <div className="frontend-scope-notice">
              <span aria-hidden="true">i</span>

              <div>
                <h3>Assessment 1 is frontend only</h3>

                <p>
                  This assessment focuses on React components, responsive
                  design, usability, accessibility and standalone HTML output. A
                  database and rotating word lists will be introduced in
                  Assessment 2.
                </p>
              </div>
            </div>
          </article>

          <aside
            className="student-information-card"
            aria-labelledby="student-information-heading"
          >
            <p className="student-card-label">Project details</p>
            <h2 id="student-information-heading">Student information</h2>

            <dl>
              <div>
                <dt>Name</dt>
                <dd>Rudra Pandey</dd>
              </div>

              <div>
                <dt>Student number</dt>
                <dd>22455439</dd>
              </div>

              <div>
                <dt>Assessment</dt>
                <dd>Assessment 1</dd>
              </div>

              <div>
                <dt>Framework</dt>
                <dd>Next.js and React</dd>
              </div>

              <div>
                <dt>Project type</dt>
                <dd>Frontend builder</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section
        className="about-tools-section"
        aria-labelledby="activity-tools-heading"
      >
        <div className="page-container">
          <div className="section-heading">
            <p className="eyebrow">Activity tools</p>

            <h2 id="activity-tools-heading">
              Two ways to practise phoneme recognition
            </h2>

            <p>
              Both builders use phoneme symbols as the primary learning content
              and provide English equivalences as supportive hints.
            </p>
          </div>

          <div className="about-tools-grid">
            {projectFeatures.map((feature) => (
              <article className="about-tool-card" key={feature.title}>
                <span className="about-tool-symbol" aria-hidden="true">
                  {feature.symbol}
                </span>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <Link href={feature.link} className="text-link">
                  {feature.linkLabel}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="video-section"
        aria-labelledby="instruction-video-heading"
      >
        <div className="page-container video-layout">
          <div className="video-introduction">
            <p className="eyebrow">Website demonstration</p>

            <h2 id="instruction-video-heading">How to use the builder</h2>

            <p>
              This short video demonstrates the website navigation, Wordle and
              Word Search configuration, live previews, accessibility options,
              theme settings and standalone HTML downloads.
            </p>

            <ul className="video-topic-list">
              <li>
                <span aria-hidden="true">1</span>
                Navigate between activity builders
              </li>
              <li>
                <span aria-hidden="true">2</span>
                Configure phoneme words and hints
              </li>
              <li>
                <span aria-hidden="true">3</span>
                Preview and test an activity
              </li>
              <li>
                <span aria-hidden="true">4</span>
                Generate the playable HTML file
              </li>
            </ul>
          </div>

          <div className="video-card">
            <div className="video-card-heading">
              <div>
                <p>Demonstration video</p>
                <span>Presented by Rudra Pandey</span>
              </div>

              <span className="video-duration">Short guide</span>
            </div>

            <video
              className="instruction-video"
              controls
              preload="metadata"
              aria-label="Video explaining how to use the Phoneme Activity Builder"
            >
              <source src="/videos/how-to-use.mp4" type="video/mp4" />
              <track
                kind="captions"
                src="/videos/how-to-use-captions.vtt"
                srcLang="en"
                label="English captions"
                default
              />
              Your browser does not support HTML video. A written guide is
              provided below.
            </video>

            <details className="video-transcript">
              <summary>Read the video guide</summary>

              <ol>
                <li>
                  Use the navigation bar or hamburger menu to open an activity
                  builder.
                </li>
                <li>
                  In Wordle, choose one phoneme word, its English equivalent,
                  the number of guesses and whether hints are displayed.
                </li>
                <li>
                  In Word Search, review the five phoneme words and configure
                  the available activity options.
                </li>
                <li>
                  Use the live preview to check the activity and test its
                  interaction.
                </li>
                <li>
                  Select Generate HTML to download one playable file that can
                  open in a normal browser.
                </li>
                <li>
                  Visit Settings to select a light or dark theme and preferred
                  layout spacing.
                </li>
              </ol>
            </details>
          </div>
        </div>
      </section>

      <section
        className="design-principles-section"
        aria-labelledby="design-principles-heading"
      >
        <div className="page-container">
          <div className="section-heading">
            <p className="eyebrow">Frontend approach</p>

            <h2 id="design-principles-heading">
              Designed for usability and expansion
            </h2>
          </div>

          <div className="design-principles-grid">
            <article>
              <span aria-hidden="true">◫</span>
              <h3>Reusable components</h3>
              <p>
                Shared navigation, buttons, previews and activity controls
                reduce duplication and support future development.
              </p>
            </article>

            <article>
              <span aria-hidden="true">↔</span>
              <h3>Responsive layout</h3>
              <p>
                Pages adjust for desktop, tablet and mobile screens without
                removing essential controls or information.
              </p>
            </article>

            <article>
              <span aria-hidden="true">A</span>
              <h3>Accessible interaction</h3>
              <p>
                Semantic elements, keyboard controls, focus indicators, labels
                and text feedback support a wider range of users.
              </p>
            </article>

            <article>
              <span aria-hidden="true">＋</span>
              <h3>Future scalability</h3>
              <p>
                Activity data and HTML generation are separated from page
                layouts, preparing the project for database integration.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
