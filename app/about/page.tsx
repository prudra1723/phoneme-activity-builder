import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how the full-stack Phoneme Activity Builder uses Next.js, Prisma and PostgreSQL to create classroom activities.",
};

const projectFeatures = [
  {
    symbol: "/θ/",
    title: "Phoneme Wordle",
    description:
      "Loads a stored Wordle configuration, ordered phoneme answer, difficulty, hints and guess settings from the database.",
    link: "/wordle",
    linkLabel: "Open Wordle builder",
  },
  {
    symbol: "⌕",
    title: "Phoneme Word Search",
    description:
      "Generates a dynamic phoneme grid from a stored word list and supports configurable grid size, hints and difficulty.",
    link: "/word-search",
    linkLabel: "Open Word Search builder",
  },
  {
    symbol: "DB",
    title: "Manage Words",
    description:
      "Allows teachers to create, retrieve, update and delete phoneme words through a validated database workflow.",
    link: "/manage",
    linkLabel: "Manage database words",
  },
];

export default function AboutPage() {
  return (
    <main id="main-content" className="about-page">
      <section className="page-banner about-banner">
        <div className="page-container about-banner-content">
          <div>
            <p className="eyebrow">About the project</p>

            <h1>A full-stack classroom activity builder</h1>

            <p>
              The Phoneme Activity Builder helps teachers and Speech Pathology
              students manage, preview and download accessible phoneme-based
              activities using content stored in PostgreSQL.
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
              A database-driven builder for teachers
            </h2>

            <p>
              This project extends the Assessment 1 interface with server-side
              APIs and persistent storage. Teachers can manage ordered phoneme
              words, retrieve saved activity configurations and use stored data
              to generate classroom resources.
            </p>

            <p>
              Generated activities download as individual HTML files. Each file
              contains its own layout, styling and gameplay JavaScript, so it
              can run independently in a normal browser without the original
              Next.js application.
            </p>

            <div className="frontend-scope-notice">
              <span aria-hidden="true">✓</span>

              <div>
                <h3>Assessment 2 backend integration</h3>

                <p>
                  Next.js Route Handlers validate requests and use Prisma ORM to
                  store phonemes, words, word lists and activity settings in
                  PostgreSQL. The complete application can run with Docker
                  Compose.
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
                <dd>Assessment 2</dd>
              </div>

              <div>
                <dt>Framework</dt>
                <dd>Next.js and React</dd>
              </div>

              <div>
                <dt>Database</dt>
                <dd>PostgreSQL and Prisma</dd>
              </div>

              <div>
                <dt>Project type</dt>
                <dd>Full-stack application</dd>
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
            <p className="eyebrow">Teacher tools</p>

            <h2 id="activity-tools-heading">
              Manage content and generate activities
            </h2>

            <p>
              The interface connects teacher controls to reusable backend data
              while retaining accessible learner feedback.
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
        aria-labelledby="backend-workflow-heading"
      >
        <div className="page-container video-layout">
          <div className="video-introduction">
            <p className="eyebrow">Backend workflow</p>

            <h2 id="backend-workflow-heading">
              How stored content becomes an activity
            </h2>

            <p>
              A clear data flow connects the teacher interface, backend routes,
              PostgreSQL records and standalone activity generators.
            </p>

            <ul className="video-topic-list">
              <li>
                <span aria-hidden="true">1</span>A teacher creates or updates a
                phoneme word
              </li>
              <li>
                <span aria-hidden="true">2</span>
                The API validates the request and calls Prisma
              </li>
              <li>
                <span aria-hidden="true">3</span>
                PostgreSQL stores the word and ordered phonemes
              </li>
              <li>
                <span aria-hidden="true">4</span>A builder loads stored data and
                generates playable HTML
              </li>
            </ul>
          </div>

          <div className="video-card">
            <div className="video-card-heading">
              <div>
                <p>Full-stack architecture</p>
                <span>Next.js, Prisma, PostgreSQL and Docker</span>
              </div>

              <span className="video-duration">Assessment 2</span>
            </div>

            <div className="backend-flow-card">
              <ol>
                <li>
                  <strong>React interface</strong>
                  <span>Collects teacher input and displays stored data.</span>
                </li>
                <li>
                  <strong>Next.js Route Handlers</strong>
                  <span>
                    Validate requests and return clear HTTP responses.
                  </span>
                </li>
                <li>
                  <strong>Prisma and PostgreSQL</strong>
                  <span>Persist related words, phonemes and settings.</span>
                </li>
                <li>
                  <strong>HTML generators</strong>
                  <span>Create portable Wordle and Word Search files.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section
        className="design-principles-section"
        aria-labelledby="design-principles-heading"
      >
        <div className="page-container">
          <div className="section-heading">
            <p className="eyebrow">Technical approach</p>

            <h2 id="design-principles-heading">
              Designed for reliability and expansion
            </h2>
          </div>

          <div className="design-principles-grid">
            <article>
              <span aria-hidden="true">DB</span>
              <h3>Normalised schema</h3>
              <p>
                Related models preserve phoneme order and support reusable word
                lists and multiple activity configurations.
              </p>
            </article>

            <article>
              <span aria-hidden="true">API</span>
              <h3>Validated APIs</h3>
              <p>
                Route Handlers provide CRUD operations, clear status codes and
                graceful error responses.
              </p>
            </article>

            <article>
              <span aria-hidden="true">A</span>
              <h3>Accessible interaction</h3>
              <p>
                Semantic elements, keyboard controls, focus indicators, labels
                and status feedback support a wider range of users.
              </p>
            </article>

            <article>
              <span aria-hidden="true">◇</span>
              <h3>Reproducible execution</h3>
              <p>
                Docker Compose runs the application and PostgreSQL with health
                checks, migrations and persistent storage.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        className="references-section"
        aria-labelledby="references-heading"
      >
        <div className="page-container">
          <div className="section-heading">
            <p className="eyebrow">Research and guidance</p>
            <h2 id="references-heading">References</h2>
            <p>
              Industry and standards sources used to guide the full-stack,
              database, accessibility and phoneme-based implementation.
            </p>
          </div>

          <ol className="reference-list">
            <li>
              Docker, Inc. (n.d.).{" "}
              <cite>Control startup and shutdown order in Compose</cite>.{" "}
              <a
                href="https://docs.docker.com/compose/how-tos/startup-order/"
                target="_blank"
                rel="noreferrer"
              >
                https://docs.docker.com/compose/how-tos/startup-order/
              </a>
            </li>

            <li>
              International Phonetic Association. (n.d.).{" "}
              <cite>The International Phonetic Alphabet and the IPA chart</cite>
              .{" "}
              <a
                href="https://www.internationalphoneticassociation.org/content/ipa-chart"
                target="_blank"
                rel="noreferrer"
              >
                https://www.internationalphoneticassociation.org/content/ipa-chart
              </a>
            </li>

            <li>
              Meta Platforms, Inc. (n.d.). <cite>Thinking in React</cite>.
              React.{" "}
              <a
                href="https://react.dev/learn/thinking-in-react"
                target="_blank"
                rel="noreferrer"
              >
                https://react.dev/learn/thinking-in-react
              </a>
            </li>

            <li>
              PostgreSQL Global Development Group. (2026).{" "}
              <cite>PostgreSQL 17 documentation</cite>.{" "}
              <a
                href="https://www.postgresql.org/docs/17/"
                target="_blank"
                rel="noreferrer"
              >
                https://www.postgresql.org/docs/17/
              </a>
            </li>

            <li>
              Prisma Data, Inc. (n.d.). <cite>Prisma ORM documentation</cite>.{" "}
              <a
                href="https://www.prisma.io/docs/orm/v7"
                target="_blank"
                rel="noreferrer"
              >
                https://www.prisma.io/docs/orm/v7
              </a>
            </li>

            <li>
              Vercel. (2026). <cite>Route Handlers</cite>. Next.js.{" "}
              <a
                href="https://nextjs.org/docs/app/getting-started/route-handlers"
                target="_blank"
                rel="noreferrer"
              >
                https://nextjs.org/docs/app/getting-started/route-handlers
              </a>
            </li>

            <li>
              World Wide Web Consortium. (2024).{" "}
              <cite>Web Content Accessibility Guidelines (WCAG) 2.2</cite>.{" "}
              <a
                href="https://www.w3.org/TR/WCAG22/"
                target="_blank"
                rel="noreferrer"
              >
                https://www.w3.org/TR/WCAG22/
              </a>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}
