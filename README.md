# Phoneme Activity Builder

A full-stack educational application for creating, storing, previewing and downloading phoneme-based Wordle and Word Search classroom activities.

Designed for teachers and Speech Pathology students, the application stores teacher-created phoneme content in PostgreSQL, loads saved activity configurations, generates standalone playable HTML files and records operational usage data for an analytics dashboard.

## Assessment information

- **Assessment:** Assessment 3 – Dashboard, Analytics and Application Testing
- **Student:** Rudra Pandey
- **Student number:** 22455439
- **Framework:** Next.js, React and TypeScript
- **Database:** PostgreSQL 17
- **ORM:** Prisma ORM 7
- **Testing:** Node.js Test Runner, Playwright and Apache JMeter
- **Containers:** Docker and Docker Compose
- **Repository:** https://github.com/prudra1723/phoneme-activity-builder
- **Branch:** `assessment-3-dashboard`

The project was originally created with:

```bash
npx create-next-app .
```

Assessment 3 extends the full-stack Assessment 2 application with database-backed usage analytics, an operations dashboard, activity-generation tracking, automated browser testing and API performance testing.

## Main features

### Operations dashboard

The **Dashboard** page retrieves live metrics from PostgreSQL through `/api/dashboard`. It displays:

- totals for words, word lists and saved activities;
- Wordle and Word Search activity counts;
- successful and failed HTML generations;
- generation totals by activity type;
- the most frequently generated activity type;
- average recorded page duration;
- empty-word-list and recent-failure alerts;
- application and database health; and
- the ten most recent usage events.

The dashboard includes loading, error and empty states and can be refreshed without reloading the complete application.

### Usage analytics

The application records operational events in PostgreSQL, including:

- page views;
- visible page duration;
- successful activity generation;
- failed activity generation;
- validation warnings; and
- saved activity creation.

`PageUsageTracker` records page-view and visible-duration events for the Wordle and Word Search builders. Generation events are recorded when a standalone HTML download succeeds or fails.

### Teacher word management

The **Manage Words** page allows teachers to:

- create words with English spelling, phonetic transcription and a teaching hint;
- build and store ordered phoneme sequences;
- store multi-character phonemes such as `/tʃ/` as one phoneme;
- retrieve, edit and delete saved words; and
- receive clear validation and API error messages.

### Phoneme Wordle

The Wordle builder loads saved `WORDLE` activities. The answer word, ordered phonemes, difficulty, hint preference, maximum guesses and output filename populate the builder.

Teachers can test the playable preview and download a standalone HTML activity. Successful, failed and invalid generation attempts can be recorded as usage events.

### Phoneme Word Search

The Word Search builder loads saved `WORD_SEARCH` activities and their word lists. It generates a grid from ordered database phonemes and applies the stored grid size, difficulty, hint preference and output filename.

Teachers can preview the activity, select target words and download a standalone HTML file. Generation outcomes can be stored for dashboard reporting.

### Standalone output

Both builders generate one HTML file containing its own markup, CSS and JavaScript. The downloaded activity can be opened without the Next.js application or an internet connection.

## Architecture

```mermaid
flowchart TD
    UI[React interface] --> API[Next.js Route Handlers]
    API --> ORM[Prisma ORM]
    ORM --> DB[(PostgreSQL)]
    DB --> ORM
    ORM --> API
    API --> UI
    UI --> HTML[Standalone HTML]
    UI --> EVENTS[Usage events]
    EVENTS --> API
```

The browser calls same-origin Next.js Route Handlers under `/api`. Route Handlers validate requests and use the shared Prisma client in `lib/prisma.ts`.

Prisma maps application objects to PostgreSQL records. Builder components transform retrieved records into playable previews and standalone HTML. Usage events are sent to `/api/events`, and `/api/dashboard` aggregates stored records into dashboard metrics.

This is a full-stack Next.js project, so it does not require a separate backend folder or backend server.

## Database design

The schema is defined in `prisma/schema.prisma`.

| Model          | Purpose                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| `Phoneme`      | Stores a phoneme symbol, matching letters and an example                  |
| `Word`         | Stores English spelling, phonetic transcription, hint and timestamps      |
| `WordPhoneme`  | Connects words to phonemes and preserves pronunciation order              |
| `WordList`     | Stores a reusable named collection of words                               |
| `WordListWord` | Connects words to lists and preserves list order                          |
| `Activity`     | Stores activity type, difficulty, hints and output settings               |
| `UsageEvent`   | Stores page views, durations, generation outcomes and validation warnings |

The `WordPhoneme.position` field preserves pronunciation order. Phonemes are stored as strings, supporting IPA and multi-character values.

`ActivityType` accepts:

- `WORDLE`
- `WORD_SEARCH`

`Difficulty` accepts:

- `EASY`
- `MEDIUM`
- `HARD`

`UsageEventType` accepts:

- `ACTIVITY_CREATED`
- `GENERATION_SUCCESS`
- `GENERATION_FAILED`
- `PAGE_VIEW`
- `PAGE_DURATION`
- `VALIDATION_WARNING`

A usage event can optionally reference an activity. Events that are not connected to one saved activity can still be stored and included in analytics.

## API routes

| Method                   | Endpoint              | Purpose                                                |
| ------------------------ | --------------------- | ------------------------------------------------------ |
| `GET`                    | `/health`             | Confirm that the application can connect to PostgreSQL |
| `GET`                    | `/api/health`         | API-prefixed database health check                     |
| `GET`, `POST`            | `/api/phonemes`       | List or create phonemes                                |
| `GET`, `PATCH`, `DELETE` | `/api/phonemes/:id`   | Read, update or delete one phoneme                     |
| `GET`, `POST`            | `/api/words`          | List or create words                                   |
| `GET`, `PATCH`, `DELETE` | `/api/words/:id`      | Read, update or delete one word                        |
| `GET`, `POST`            | `/api/word-lists`     | List or create word lists                              |
| `GET`, `PATCH`, `DELETE` | `/api/word-lists/:id` | Manage one word list                                   |
| `GET`, `POST`            | `/api/activities`     | List or create activities                              |
| `GET`, `PATCH`, `DELETE` | `/api/activities/:id` | Manage one activity                                    |
| `GET`, `POST`            | `/api/events`         | Retrieve or record usage events                        |
| `GET`                    | `/api/dashboard`      | Aggregate health, operational, usage and alert metrics |

Creation normally returns HTTP `201`. Validation errors return `400`, missing records return `404`, duplicate unique values return `409`, and unexpected failures return `500`.

The health endpoint returns `503` when the database is unavailable.

## Dashboard calculations

The dashboard API performs database queries for:

- total words;
- total word lists;
- total activities;
- Wordle and Word Search activity counts;
- successful and failed generations;
- successful generations grouped by activity type;
- average page duration;
- empty word lists;
- generation failures from the previous 24 hours; and
- the ten most recent usage events.

The most-used activity type is reported as:

- `WORDLE`;
- `WORD_SEARCH`;
- `TIE`; or
- `NO_DATA`.

Dashboard alerts are created when:

- one or more word lists contain no words; or
- one or more generation failures occurred in the previous 24 hours.

## Technology stack

- Next.js 16 App Router and Route Handlers
- React 19
- TypeScript
- PostgreSQL 17
- Prisma ORM and Prisma Client 7
- `@prisma/adapter-pg`
- `pg`
- Node.js built-in test runner
- Playwright
- Apache JMeter 5.6.3
- Docker and Docker Compose
- ESLint
- Git and GitHub

## Project structure

```text
app/
├── api/
│   ├── activities/
│   ├── dashboard/
│   ├── events/
│   ├── health/
│   ├── phonemes/
│   ├── word-lists/
│   └── words/
├── dashboard/
│   └── page.tsx
├── health/
│   └── route.ts
├── manage/
│   └── page.tsx
├── settings/
│   └── page.tsx
├── wordle/
│   └── page.tsx
└── word-search/
    └── page.tsx

components/
├── Dashboard.tsx
├── PageUsageTracker.tsx
├── WordManager.tsx
├── WordleBuilder.tsx
├── WordlePreview.tsx
├── WordSearchBuilder.tsx
└── WordSearchPreview.tsx

lib/
├── createWordSearch.ts
├── generateWordleHtml.ts
├── generateWordSearchHtml.ts
├── phonemes.ts
├── prisma.ts
└── usageEvents.ts

prisma/
├── migrations/
├── schema.prisma
└── seed.ts

tests/
├── health.test.mjs
└── words-crud.test.mjs

e2e/
├── activity-generation.spec.ts
├── smoke.spec.ts
└── word-management.spec.ts

performance/
└── api-load-test.jmx

Dockerfile
compose.yaml
eslint.config.mjs
playwright.config.ts
prisma7.config.ts
```

The Prisma Client is generated in `app/generated/prisma` and is excluded from Git.

Generated Playwright results, JMeter result files and JMeter HTML reports are also excluded from Git.

## Local development

### Requirements

Install:

- Node.js 22 or a compatible supported release;
- npm;
- Git;
- Docker Desktop;
- Chromium for Playwright testing; and
- Apache JMeter for performance testing.

### Clone and install

```bash
git clone https://github.com/prudra1723/phoneme-activity-builder.git
cd phoneme-activity-builder
git switch assessment-3-dashboard
npm ci
```

Install the Playwright browser if necessary:

```bash
npx playwright install chromium
```

### Configure the database

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://phoneme_user:phoneme_password@localhost:55432/phoneme_activity?schema=public"
```

The `.env` file is ignored by Git and must not be committed. Compose credentials are intended for reproducible local assessment use and are not production credentials.

### Start and prepare PostgreSQL

```bash
docker compose up -d db
docker compose ps
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Local processes connect to PostgreSQL through `localhost:55432`. Processes inside Compose use `db:5432`.

The repeatable seed creates:

- 15 phonemes;
- 7 words;
- 2 word lists; and
- 2 activities.

### Start Next.js locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If the Docker application already occupies port 3000, stop it first:

```bash
docker compose stop app
```

## Run the complete application with Docker

Stop any local development server using port 3000, then run:

```bash
docker compose up --build -d
docker compose ps
```

The application waits for PostgreSQL to become healthy, applies committed migrations and starts the production server. Both services should report `healthy`.

Seed a new Docker database if necessary:

```bash
docker compose exec app npx prisma db seed
```

Verify the application and database:

```bash
curl -i http://localhost:3000/health
curl -sS http://localhost:3000/api/dashboard | python3 -m json.tool
```

View application logs:

```bash
docker compose logs --tail=100 app
```

Stop the containers without deleting stored PostgreSQL data:

```bash
docker compose down
```

Do not add `-v` unless you intentionally want to delete the PostgreSQL volume and all stored records.

## Using the application

### Manage database words

1. Open `/manage`.
2. Enter an English spelling, phonetic transcription and optional hint.
3. Add phonemes in pronunciation order.
4. Select **Save new word**.
5. Use **Edit** and **Update word** to modify it.
6. Use **Delete** to remove a temporary record after confirmation.

### Generate a stored Wordle activity

1. Open `/wordle`.
2. Select a saved Wordle activity.
3. Select **Load saved activity**.
4. Confirm that the database word and activity settings populate the builder.
5. Test the playable preview.
6. Select **Download playable HTML**.
7. Open the downloaded file in a browser.
8. Open the Dashboard to observe the generation event.

### Generate a stored Word Search activity

1. Open `/word-search`.
2. Select a saved Word Search activity.
3. Select **Load saved activity**.
4. Confirm the database word list and grid settings.
5. Test a target word by selecting its first and last cells.
6. Select **Download playable HTML**.
7. Open the downloaded file in a browser.
8. Open the Dashboard to observe the generation event.

### Review operational analytics

1. Open `/dashboard`.
2. Review the database health indicator.
3. Review word, list and activity totals.
4. Compare Wordle and Word Search generation counts.
5. Review average page duration.
6. Review warnings and errors.
7. Review the recent-event table.
8. Select **Refresh dashboard** after performing another tracked action.

## Validation and error handling

The backend validates:

- required fields;
- input types;
- maximum string lengths;
- enum values;
- numeric ranges;
- JSON structure;
- referenced database IDs;
- usage-event requirements; and
- activity-specific settings.

Phoneme arrays must be non-empty, and every referenced phoneme must exist. Prisma errors are translated into appropriate HTTP responses.

The management interface performs immediate validation and displays API messages. Invalid generation attempts can be recorded as `VALIDATION_WARNING` events.

The dashboard provides an error state if its API request fails.

## Automated tests and code quality

The application uses three complementary testing levels.

### API integration tests

Node.js integration tests use the running application and PostgreSQL database:

```bash
npm test
```

The tests verify:

- the connected health endpoint;
- complete word CRUD behaviour;
- a `404` response after deletion; and
- rejection of invalid word input.

The CRUD test creates a uniquely named temporary record and attempts cleanup in a `finally` block.

To test another port:

```bash
TEST_BASE_URL=http://localhost:3001 npm test
```

### Playwright end-to-end tests

Playwright exercises the application through Chromium:

```bash
npm run test:e2e
```

The suite verifies:

- the connected health endpoint;
- Manage Words page controls;
- browser-based word creation;
- browser-based word editing;
- browser-based word deletion;
- loading a stored Wordle activity;
- downloading a standalone Wordle file;
- loading a stored Word Search activity;
- downloading a standalone Word Search file; and
- successful analytics requests during activity generation.

Additional Playwright commands include:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:report
```

Failure screenshots and videos are retained according to `playwright.config.ts`. Traces are captured on the first retry.

### JMeter API performance testing

The reusable JMeter test plan is:

```text
performance/api-load-test.jmx
```

It sends `GET` requests to:

- `/health`
- `/api/words`
- `/api/activities`
- `/api/dashboard`

A response assertion requires HTTP `200`.

Example 100-user run:

```bash
jmeter -n \
  -t performance/api-load-test.jmx \
  -Jthreads=100 \
  -Jramp=10 \
  -Jloops=1 \
  -l performance/results/load-100.jtl
```

Generate an HTML report:

```bash
jmeter -g performance/results/load-100.jtl \
  -o performance/reports/load-100
```

Open the report on macOS:

```bash
open performance/reports/load-100/index.html
```

### Performance results

| Workload               | Requests |           Duration | Throughput | Average | Maximum | Errors |
| ---------------------- | -------: | -----------------: | ---------: | ------: | ------: | -----: |
| 1 user                 |        4 | Less than 1 second |   32.0/sec |   17 ms |   39 ms |  0.00% |
| 10 users               |       40 |          5 seconds |    8.8/sec |   12 ms |   34 ms |  0.00% |
| 100 users              |      400 |         10 seconds |   40.2/sec |    6 ms |   19 ms |  0.00% |
| 1,000 users            |    4,000 |         60 seconds |   66.7/sec |    5 ms |  106 ms |  0.00% |
| 10,000 user iterations |   40,000 |         60 seconds |  666.6/sec |    1 ms |   46 ms |  0.00% |

The final workload used 1,000 concurrent threads with ten iterations per thread. This represented 10,000 user iterations and 40,000 API requests. It was not a test of 10,000 simultaneously active users.

The measurements were collected against the application running in the local Docker environment. They demonstrate performance under the tested local conditions and should not be interpreted as public-cloud or internet performance.

The test measured application API performance. It did not test a load balancer because the Compose environment contains one application container.

### Code-quality commands

```bash
npx tsc --noEmit
npm run lint
npm run build
npm test
npm run test:e2e
```

Generated Playwright and JMeter outputs are excluded from Git and ESLint.

## Accessibility and responsive design

The interface uses:

- semantic page regions;
- explicit form labels;
- keyboard-accessible controls;
- visible focus indicators;
- live status regions;
- feedback that does not rely only on colour; and
- responsive layouts for desktop, tablet and mobile screens.

Builder and preview columns stack on smaller screens. Downloaded activities retain accessible labels and keyboard-operable controls.

## Demonstration video checklist

- Show student ID within the first 30 seconds.
- Keep the face camera visible and narrate throughout.
- Show the `assessment-3-dashboard` Git branch.
- Explain the Next.js, Prisma and PostgreSQL architecture.
- Show the `UsageEvent` model and migration.
- Show `/health` returning `200 OK`.
- Show both Docker Compose services as healthy.
- Demonstrate creating, reading, editing and deleting a temporary word.
- Demonstrate Wordle and Word Search activity generation.
- Open both downloaded standalone HTML files.
- Open the Dashboard and explain the displayed metrics.
- Demonstrate a new generation event appearing in recent events.
- Explain the empty-word-list or recent-failure alert logic.
- Run the Node.js integration tests.
- Run the Playwright end-to-end tests.
- Explain the JMeter test plan.
- Show the generated JMeter HTML report.
- Accurately describe the final workload as 1,000 concurrent threads, 10,000 user iterations and 40,000 API requests.

## Troubleshooting

### Port 3000 is already in use

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Identify and stop the correct local process, or stop the Compose application:

```bash
docker compose stop app
```

Do not terminate an unfamiliar process.

### Docker daemon is unavailable

Start Docker Desktop, wait for the Docker engine to become available, then run:

```bash
docker version
docker compose ps
```

### Database health returns 503

```bash
docker compose ps
docker compose logs --tail=100 db
```

Confirm that local execution uses `localhost:55432`, while Docker uses `db:5432`.

### Playwright report port is already in use

Find the process using the default report port:

```bash
lsof -nP -iTCP:9323 -sTCP:LISTEN
```

Close the existing Playwright report tab or stop only the identified report process before reopening the report.

### JMeter reports assertion failures despite HTTP 200

Confirm that the response assertion:

- tests the response code;
- uses the equals comparison;
- contains `200` as the expected pattern; and
- does not place `200` in the custom-message field.

### Prisma update notification

The project pins Prisma packages to `7.10.0`. Major-version upgrades should be handled separately and tested before adoption.

## Current limitations

- Authentication and teacher accounts are outside the current assessment scope.
- Learner progress is not stored.
- Analytics identify activity types and page paths but do not identify individual users.
- Compose credentials are intended only for reproducible local use.
- Dashboard metrics are aggregate operational values rather than a full learning-analytics system.
- Advanced word-list and activity composition remains available through the API and seeded configurations rather than a dedicated interface.
- Performance results represent the local Docker environment rather than public-cloud performance.

## Submission checklist

1. Run `npx tsc --noEmit`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Run `npm test`.
5. Run `npm run test:e2e`.
6. Rebuild Docker and verify both services are healthy.
7. Confirm `/health` returns `200 OK`.
8. Confirm `/api/dashboard` returns database-backed metrics.
9. Confirm the JMeter test plan is committed.
10. Confirm generated reports and results are ignored.
11. Commit and push the `assessment-3-dashboard` branch.
12. Record the narrated demonstration video.
13. Complete the university AI acknowledgement.
14. Create the submission ZIP without `node_modules`, `.next`, `.env`, `.git`, generated reports or local database data.
15. Submit the required video, source archive, repository link and any other required items.

## References

- Apache Software Foundation. (n.d.). _Apache JMeter user manual_. <https://jmeter.apache.org/usermanual/>
- Docker, Inc. (n.d.). _Control startup and shutdown order in Compose_. <https://docs.docker.com/compose/how-tos/startup-order/>
- International Phonetic Association. (n.d.). _The International Phonetic Alphabet and the IPA chart_. <https://www.internationalphoneticassociation.org/content/ipa-chart>
- Meta Platforms, Inc. (n.d.). _Thinking in React_. <https://react.dev/learn/thinking-in-react>
- Microsoft. (n.d.). _Playwright documentation_. <https://playwright.dev/docs/intro>
- PostgreSQL Global Development Group. (2026). _PostgreSQL 17 documentation_. <https://www.postgresql.org/docs/17/>
- Prisma Data, Inc. (n.d.). _Prisma ORM documentation_. <https://www.prisma.io/docs/orm/>
- Vercel. (2026). _Route Handlers_. <https://nextjs.org/docs/app/getting-started/route-handlers>
- World Wide Web Consortium. (2024). _Web Content Accessibility Guidelines WCAG 2.2_. <https://www.w3.org/TR/WCAG22/>

## AI acknowledgement

Generative AI was used as permitted by the assessment instructions to support planning, code explanation, debugging, test design, documentation and language refinement.

All generated material was reviewed, tested and adapted by the student. The separate university AI acknowledgement must also be completed and submitted.

## Author

**Rudra Pandey**  
Student number: **22455439**
