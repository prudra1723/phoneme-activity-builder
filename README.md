# Phoneme Activity Builder

A full-stack educational application for creating, storing, previewing and downloading phoneme-based Wordle and Word Search classroom activities.

Designed for teachers and Speech Pathology students, the application stores teacher-created phoneme content in PostgreSQL, loads saved activity configurations and generates standalone playable HTML files.

## Assessment information

- **Assessment:** Assessment 2 – Backend Implementation and Database Integration
- **Student:** Rudra Pandey
- **Student number:** 22455439
- **Framework:** Next.js, React and TypeScript
- **Database:** PostgreSQL 17
- **ORM:** Prisma ORM 7
- **Containers:** Docker and Docker Compose
- **Repository:** <https://github.com/prudra1723/phoneme-activity-builder>
- **Branch:** `assessment-2-backend`

The project was originally created with the required starter workflow:

```bash
npx create-next-app .
```

Assessment 2 extends the Assessment 1 frontend with a relational database, server-side API routes, validation, CRUD operations, saved activity loading, repeatable seeding, automated integration tests and containerised execution.

## Main features

### Teacher word management

The **Manage Words** page allows teachers to:

- create words with English spelling, phonetic transcription and a teaching hint;
- build and store ordered phoneme sequences;
- store multi-character phonemes such as `/tʃ/` as one phoneme;
- retrieve, edit and delete saved words; and
- receive clear validation and API error messages.

### Phoneme Wordle

The Wordle builder loads saved `WORDLE` activities. The answer word, ordered phonemes, difficulty, hint preference, maximum guesses and output filename populate the builder. Teachers can test the preview and download a standalone HTML activity.

### Phoneme Word Search

The Word Search builder loads saved `WORD_SEARCH` activities and their word lists. It generates a grid from ordered database phonemes and applies the stored grid size, difficulty, hint preference and output filename.

### Standalone output

Both builders generate one HTML file containing its own markup, CSS and JavaScript. The activity can be opened without the Next.js application or an internet connection.

## Architecture

```mermaid
flowchart TD
    UI[React teacher interface] --> API[Next.js Route Handlers]
    API --> ORM[Prisma ORM]
    ORM --> DB[(PostgreSQL)]
    DB --> ORM
    ORM --> API
    API --> UI
    UI --> HTML[Standalone HTML activity]
```

The browser calls same-origin Next.js Route Handlers under `/api`. The handlers validate JSON and use the shared Prisma client in `lib/prisma.ts`. Prisma maps application objects to PostgreSQL. Builder components transform retrieved records into playable previews.

This is a full-stack Next.js project, so it does not require a separate backend folder or server.

## Database design

The schema is defined in `prisma/schema.prisma`.

| Model | Purpose |
| --- | --- |
| `Phoneme` | Stores a phoneme symbol, matching letters and an example |
| `Word` | Stores English spelling, phonetic transcription, hint and timestamps |
| `WordPhoneme` | Connects words to phonemes and preserves pronunciation order |
| `WordList` | Stores a reusable named collection of words |
| `WordListWord` | Connects words to lists and preserves list order |
| `Activity` | Stores activity type, difficulty, hints and output settings |

The `WordPhoneme.position` field preserves pronunciation order. Phonemes are stored as strings, supporting IPA and multi-character values. `ActivityType` accepts `WORDLE` or `WORD_SEARCH`; `Difficulty` accepts `EASY`, `MEDIUM` or `HARD`.

## API routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Confirm the application can connect to PostgreSQL |
| `GET` | `/api/health` | API-prefixed database health check |
| `GET`, `POST` | `/api/phonemes` | List or create phonemes |
| `GET`, `PATCH`, `DELETE` | `/api/phonemes/:id` | Read, update or delete one phoneme |
| `GET`, `POST` | `/api/words` | List or create words |
| `GET`, `PATCH`, `DELETE` | `/api/words/:id` | Read, update or delete one word |
| `GET`, `POST` | `/api/word-lists` | List or create word lists |
| `GET`, `PATCH`, `DELETE` | `/api/word-lists/:id` | Manage one word list |
| `GET`, `POST` | `/api/activities` | List or create activities |
| `GET`, `PATCH`, `DELETE` | `/api/activities/:id` | Manage one activity |

Creation returns HTTP `201`. Validation errors return `400`, missing records `404`, duplicate unique values `409`, and unexpected failures `500`. The health endpoint returns `503` when the database is unavailable.

## Technology stack

- Next.js 16 App Router and Route Handlers
- React 19 and TypeScript
- PostgreSQL 17
- Prisma ORM and Prisma Client 7
- `@prisma/adapter-pg` and `pg`
- Node.js built-in test runner
- Docker and Docker Compose
- Git and GitHub

## Project structure

```text
app/
├── api/
│   ├── activities/
│   ├── health/
│   ├── phonemes/
│   ├── word-lists/
│   └── words/
├── health/route.ts
├── manage/page.tsx
├── settings/page.tsx
├── wordle/page.tsx
└── word-search/page.tsx

components/
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
└── prisma.ts

prisma/
├── migrations/
├── schema.prisma
└── seed.ts

tests/
├── health.test.mjs
└── words-crud.test.mjs

Dockerfile
compose.yaml
prisma7.config.ts
```

The Prisma Client is generated in `app/generated/prisma`.

## Local development

### Requirements

- Node.js 22 or a compatible supported release
- npm
- Git
- Docker Desktop

### Clone and install

```bash
git clone https://github.com/prudra1723/phoneme-activity-builder.git
cd phoneme-activity-builder
git switch assessment-2-backend
npm ci
```

### Configure the database

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://phoneme_user:phoneme_password@localhost:55432/phoneme_activity?schema=public"
```

The `.env` file is ignored by Git and must not be committed. Compose credentials are for local assessment use, not production.

### Start and prepare PostgreSQL

```bash
docker compose up -d db
docker compose ps
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Local processes connect to `localhost:55432`; containers connect to `db:5432`. The repeatable seed creates 15 phonemes, 7 words, 2 word lists and 2 activities.

### Start Next.js locally

```bash
npm run dev
```

Open <http://localhost:3000>. If the Docker app already uses port 3000, stop it first with `docker compose stop app`.

## Run the complete application with Docker

Stop any local development server on port 3000, then run:

```bash
docker compose up --build -d
docker compose ps
```

The app waits for PostgreSQL to become healthy, applies committed migrations and starts the production server. Both services should report `healthy`.

Seed a new Docker database if necessary:

```bash
docker compose exec app npx prisma db seed
```

Verify the system:

```bash
curl -i http://localhost:3000/health
curl -sS http://localhost:3000/api/activities
```

View logs or stop without deleting data:

```bash
docker compose logs --tail=100 app
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
2. Select an activity and choose **Load saved activity**.
3. Confirm the database word and settings populate the builder.
4. Test the preview and select **Download playable HTML**.
5. Open the downloaded file in a browser.

### Generate a stored Word Search activity

1. Open `/word-search`.
2. Select an activity and choose **Load saved activity**.
3. Confirm the database word list and grid settings.
4. Test a word by selecting its first and last cells.
5. Download and open the standalone HTML file.

## Validation and error handling

The backend validates required fields, types, maximum lengths, enum values, numeric settings, JSON shape and referenced IDs. Phoneme arrays must be non-empty, and every referenced phoneme must exist. Prisma errors are translated into clear HTTP responses. The management interface also performs immediate validation and displays API messages.

## Automated tests and code quality

Tests require a running application at `http://localhost:3000` and use the real API and PostgreSQL database.

```bash
npm test
npm run lint
npm run build
```

The tests verify the connected health endpoint, full word CRUD, a `404` after deletion, and rejection of invalid word input. The CRUD test uses a unique temporary record and attempts cleanup in a `finally` block.

To test another port:

```bash
TEST_BASE_URL=http://localhost:3001 npm test
```

## Accessibility and responsive design

The interface uses semantic regions, explicit labels, keyboard-accessible controls, visible focus states, live status regions and feedback that does not rely only on colour. Builder and preview columns stack on smaller screens. Downloaded activities retain accessible labels and keyboard-operable controls.

## Demonstration video checklist

- Show student ID within the first 30 seconds.
- Keep the face camera visible and narrate throughout.
- Explain the Next.js, Prisma and PostgreSQL architecture.
- Show the Prisma models and `WordPhoneme.position`.
- Demonstrate creating, reading, updating and deleting a temporary word.
- Show validation rejecting invalid data.
- Load and download both stored activity types.
- Open both generated HTML files.
- Show `GET /health` returning `200 OK`.
- Show both Compose services as healthy.
- Run `npm test` and show all tests passing.

## Troubleshooting

### Port 3000 is already in use

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Identify and stop the correct local process, or run `docker compose stop app`. Do not terminate an unfamiliar process.

### Docker daemon is unavailable

Start Docker Desktop, wait for the engine, then run `docker compose ps`.

### Database health returns 503

```bash
docker compose ps
docker compose logs --tail=100 db
```

Confirm local execution uses `localhost:55432`, while Docker uses `db:5432`.

### Prisma update notification

The project pins Prisma packages to `7.10.0`. Do not copy border characters such as `│` from Prisma's update box into an npm command.

## Current limitations

- Authentication and teacher accounts are outside scope.
- Learner progress is not stored.
- Compose credentials are only for reproducible local use.
- Advanced word-list and activity composition is available through the API and seeded configurations rather than a dedicated UI.

## Submission checklist

1. Run `npm test`, `npm run lint` and `npm run build`.
2. Rebuild Docker and verify both services are healthy.
3. Confirm `/health` returns `200 OK`.
4. Commit and push the correct branch to GitHub.
5. Record the narrated video.
6. Complete the university AI acknowledgement.
7. Create the submission ZIP without `node_modules`, `.next`, `.env`, `.git` or local database data.
8. Submit the ZIP, repository link and other required items.

## References

- Docker, Inc. (n.d.). *Control startup and shutdown order in Compose*. <https://docs.docker.com/compose/how-tos/startup-order/>
- International Phonetic Association. (n.d.). *The International Phonetic Alphabet and the IPA chart*. <https://www.internationalphoneticassociation.org/content/ipa-chart>
- Meta Platforms, Inc. (n.d.). *Thinking in React*. <https://react.dev/learn/thinking-in-react>
- PostgreSQL Global Development Group. (2026). *PostgreSQL 17 documentation*. <https://www.postgresql.org/docs/17/>
- Prisma Data, Inc. (n.d.). *Prisma ORM documentation*. <https://www.prisma.io/docs/orm/>
- Vercel. (2026). *Route Handlers*. <https://nextjs.org/docs/app/getting-started/route-handlers>
- World Wide Web Consortium. (2024). *Web Content Accessibility Guidelines WCAG 2.2*. <https://www.w3.org/TR/WCAG22/>

## AI acknowledgement

Generative AI was used as permitted by the assessment instructions to support planning, code explanation, debugging, test design, documentation and language refinement. All generated material was reviewed, tested and adapted by the student. The separate university AI acknowledgement must also be completed and submitted.

## Author

**Rudra Pandey**  
Student number: **22455439**

