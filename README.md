# Phoneme Activity Builder

A full-stack educational application for creating, storing, previewing and
downloading phoneme-based Wordle and Word Search classroom activities.

The application is designed for teachers and Speech Pathology students.
Teachers can manage phoneme words in PostgreSQL, retrieve saved activity
configurations and generate standalone playable HTML files from stored data.

## Assessment Information

- **Assessment:** Assessment 2 – Backend Implementation and Database Integration
- **Student:** Rudra Pandey
- **Student number:** 22455439
- **Framework:** Next.js, React and TypeScript
- **Database:** PostgreSQL 17
- **ORM:** Prisma ORM 7
- **Containers:** Docker and Docker Compose
- **Repository:** <https://github.com/prudra1723/phoneme-activity-builder>
- **Branch:** `assessment-2-backend`

The original project was created using the required starter workflow:

```bash
npx create-next-app .
```

Assessment 2 extends the Assessment 1 frontend with a database schema,
server-side API routes, validation, CRUD operations, stored activity loading,
database seeding, automated integration tests and containerised execution.

## Main Features

### Teacher word management

The **Manage Words** page allows a teacher to:

- create a word with an English spelling, phonetic transcription and hint;
- build an ordered phoneme sequence;
- store multi-character phonemes such as `/tʃ/` as one phoneme record;
- retrieve and display all saved words;
- select and update an existing word;
- delete a word after confirmation; and
- see validation and backend error messages in the interface.

### Phoneme Wordle

The Wordle builder can load a saved `WORDLE` activity from the database. The
stored answer word, ordered phonemes, difficulty, hint setting, maximum guesses
and output filename populate the builder. A teacher can preview the activity
and download it as a standalone HTML file.

### Phoneme Word Search

The Word Search builder can load a saved `WORD_SEARCH` activity and its related
word list. The grid is generated from the ordered phonemes stored for each word
rather than a single fixed example. Stored grid size, difficulty, hints and
output filename are applied to the preview and downloaded activity.

### Standalone activity output

Both builders create a single HTML file containing its own markup, CSS and
browser JavaScript. After download, the activity can be opened without the
Next.js application or an internet connection.

## Architecture

```mermaid
flowchart TD
    UI[React teacher interface] --> API[Next.js Route Handlers]
    API --> ORM[Prisma ORM]
    ORM --> DB[(PostgreSQL)]
    DB --> API
    API --> UI
    UI --> HTML[Standalone HTML activity]
```

The browser calls same-origin Next.js Route Handlers under `/api`. Route
Handlers validate JSON input and use the shared Prisma client in
`lib/prisma.ts`. Prisma maps application objects to the PostgreSQL relational
schema. Builder components transform retrieved database records into playable
Wordle and Word Search previews.

## Database Design

The Prisma schema is located at `prisma/schema.prisma`.

| Model | Purpose |
| --- | --- |
| `Phoneme` | Stores a phoneme symbol, matching letters and an example word |
| `Word` | Stores English spelling, phonetic transcription, hint and timestamps |
| `WordPhoneme` | Stores a word's phonemes in an explicit numeric order |
| `WordList` | Stores a named reusable collection of words |
| `WordListWord` | Connects words to lists and preserves list order |
| `Activity` | Stores activity type, difficulty, hints and output settings |

`WordPhoneme` is a separate relation instead of storing phonemes as individual
characters. This supports IPA symbols and phonemes containing multiple
characters. The `position` field preserves pronunciation order.

The `ActivityType` enum restricts activity types to `WORDLE` and
`WORD_SEARCH`. The `Difficulty` enum restricts difficulty to `EASY`, `MEDIUM`
or `HARD`. Relations allow multiple activity configurations and reusable word
lists.

## API Routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Confirm the application can connect to PostgreSQL |
| `GET` | `/api/health` | API-prefixed database health check |
| `GET`, `POST` | `/api/phonemes` | List or create phonemes |
| `GET` | `/api/phonemes/:id` | Retrieve one phoneme |
| `GET`, `POST` | `/api/words` | List or create words |
| `GET`, `PATCH`, `DELETE` | `/api/words/:id` | Read, update or delete one word |
| `GET`, `POST` | `/api/word-lists` | List or create word lists |
| `GET`, `PATCH`, `DELETE` | `/api/word-lists/:id` | Manage one word list |
| `GET`, `POST` | `/api/activities` | List or create activity configurations |
| `GET`, `PATCH`, `DELETE` | `/api/activities/:id` | Manage one activity configuration |

Successful creation returns HTTP `201`. Validation failures return `400`, a
missing record returns `404`, a duplicate unique value returns `409`, and an
unexpected server or database failure returns `500`. The health route returns
`503` when the database connection is unavailable.

## Technology Stack

- Next.js 16 App Router and Route Handlers
- React 19
- TypeScript
- PostgreSQL 17
- Prisma ORM and Prisma Client 7
- `@prisma/adapter-pg` and `pg`
- CSS and accessible semantic HTML
- Node.js built-in test runner
- Docker and Docker Compose
- Git and GitHub

## Project Structure

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

## Local Development

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

### Configure the local database connection

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://phoneme_user:phoneme_password@localhost:55432/phoneme_activity?schema=public"
```

The `.env` file is ignored by Git and must not be committed. The credentials in
`compose.yaml` are development credentials only and should be replaced with
secrets in a real deployment.

### Start PostgreSQL

```bash
docker compose up -d db
docker compose ps
```

The database is available to applications on the Mac at `localhost:55432`.
Inside the Compose network, containers connect to `db:5432`.

### Generate, migrate and seed

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

The seed is repeatable and creates the standard phonemes, sample words, two word
lists and two example activities.

### Start Next.js

```bash
npm run dev
```

Open <http://localhost:3000>.

## Running the Complete Application in Docker

Stop any local development server using port 3000, then run:

```bash
docker compose up --build -d
docker compose ps
```

The `app` service waits for the PostgreSQL health check, applies committed
Prisma migrations and starts the production Next.js server. Both services
should report `healthy`.

If a new Docker database contains no sample records, run:

```bash
docker compose exec app npx prisma db seed
```

Verify the application:

```bash
curl -i http://localhost:3000/health
curl -sS http://localhost:3000/api/activities
```

View logs:

```bash
docker compose logs --tail=100 app
```

Stop the containers without deleting stored data:

```bash
docker compose down
```

Do not add `-v` unless the PostgreSQL volume and all of its stored data are
intentionally being deleted.

## Using the Application

### Manage database words

1. Open `/manage`.
2. Enter an English spelling and phonetic transcription.
3. Optionally enter a teaching hint.
4. Add phonemes in pronunciation order.
5. Select **Save new word**.
6. Use **Edit** to load a record into the form.
7. Modify the record and select **Update word**.
8. Use **Delete** to remove a temporary record after confirmation.

### Generate a stored Wordle activity

1. Open `/wordle`.
2. Select a saved Wordle activity.
3. Select **Load saved activity**.
4. Confirm the stored word and settings populate the builder.
5. Test the playable preview.
6. Select **Download playable HTML**.

### Generate a stored Word Search activity

1. Open `/word-search`.
2. Select a saved Word Search activity.
3. Select **Load saved activity**.
4. Confirm the database word list and grid settings are displayed.
5. Test selecting the first and last cells of a target word.
6. Download and open the standalone HTML activity.

## Validation and Error Handling

The backend checks required fields, field types, maximum lengths, enum values,
numeric activity settings, JSON shape and referenced database identifiers.
Ordered phoneme arrays must be non-empty and every referenced phoneme must
exist. Prisma errors are translated into clear HTTP responses for duplicates
and missing records. The management interface also performs immediate checks
before sending a request and displays the API response to the teacher.

## Automated Tests and Code Quality

The integration tests expect a running application at
`http://localhost:3000`. They use the real API and PostgreSQL database.

```bash
npm test
npm run lint
npm run build
```

The health test verifies `GET /health` returns `200` with a connected database.
The word integration test creates a uniquely named temporary word, reads it,
updates it, deletes it and confirms the deleted record returns `404`. A
`finally` block attempts cleanup if the test stops before normal deletion. A
separate validation test confirms invalid word input returns `400`.

An alternative test server can be supplied using:

```bash
TEST_BASE_URL=http://localhost:3001 npm test
```

## Accessibility and Responsive Design

The interface uses semantic regions, explicit labels, keyboard-accessible
controls, visible focus states, status live regions and text feedback that does
not rely only on colour. Desktop builder and preview columns stack on smaller
screens. The standalone activities retain accessible labels, gameplay status
messages and keyboard-operable controls.

## Demonstration Video Checklist

- Show student ID within the first 30 seconds.
- Show face and provide narration throughout.
- Explain the Next.js Route Handler, Prisma and PostgreSQL architecture.
- Briefly show the Prisma models and ordered `WordPhoneme.position` field.
- Demonstrate creating, reading, updating and deleting a temporary word.
- Show validation rejecting missing or malformed data.
- Load a stored Wordle activity and download its HTML output.
- Load a stored Word Search activity and download its HTML output.
- Open both downloaded files and demonstrate that they are playable.
- Show `GET /health` returning HTTP `200 OK`.
- Show `docker compose ps` with both services healthy.
- Run `npm test` and show all automated tests passing.

## Troubleshooting

### Port 3000 is already in use

Stop the local Next.js process before starting the Docker application:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
kill <PID>
docker compose up -d
```

### Docker daemon is unavailable

Start Docker Desktop and wait until its engine is ready, then run:

```bash
docker compose ps
```

### Database health returns 503

```bash
docker compose ps
docker compose logs --tail=100 db
```

Confirm that local execution uses `localhost:55432`, while the Docker app uses
`db:5432`.

### Prisma update notification

This project intentionally pins Prisma packages to version `7.10.0`. Do not
copy borders or symbols from an update-notification box into an npm command.

## Current Limitations

- Authentication and teacher accounts are outside the current assessment scope.
- Learner progress is not stored.
- Database credentials in Compose are for reproducible local assessment use.
- Words can be managed in the UI; advanced word-list and activity composition
  remain available through the API and seeded configurations.

## Submission Checklist

1. Run `npm test`, `npm run lint` and `npm run build`.
2. Rebuild Docker and verify both services are healthy.
3. Confirm `/health` returns `200 OK`.
4. Confirm the working branch is pushed to GitHub.
5. Record the required narrated video demonstration.
6. Complete the university AI acknowledgement.
7. Create the submission ZIP without `node_modules`, `.next`, `.env`, `.git` or
   local database data.
8. Submit the ZIP, GitHub repository link and other required assessment items.

## References

Docker, Inc. (n.d.). *Control startup and shutdown order in Compose*.
<https://docs.docker.com/compose/how-tos/startup-order/>

International Phonetic Association. (n.d.). *The International Phonetic
Alphabet and the IPA chart*.
<https://www.internationalphoneticassociation.org/content/ipa-chart>

Meta Platforms, Inc. (n.d.). *Thinking in React*. React.
<https://react.dev/learn/thinking-in-react>

PostgreSQL Global Development Group. (2026). *PostgreSQL 17 documentation*.
<https://www.postgresql.org/docs/17/>

Prisma Data, Inc. (n.d.). *Prisma ORM documentation*.
<https://www.prisma.io/docs/orm/v7>

Vercel. (2026). *Route Handlers*. Next.js.
<https://nextjs.org/docs/app/getting-started/route-handlers>

World Wide Web Consortium. (2024). *Web Content Accessibility Guidelines
(WCAG) 2.2*. <https://www.w3.org/TR/WCAG22/>

## AI Acknowledgement

Generative AI was used as permitted by the assessment instructions to support
planning, code explanation, debugging, test design, documentation and language
refinement. All generated material was reviewed, tested and adapted by the
student. The separate university AI acknowledgement must also be completed and
submitted.

## Author

**Rudra Pandey**  
Student number: **22455439**
