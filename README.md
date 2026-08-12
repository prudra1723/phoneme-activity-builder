# Phoneme Activity Builder

A responsive frontend application for creating, previewing and downloading phoneme-based classroom activities.

The application is designed for teachers and Speech Pathology students. It provides builders for a phoneme-based Wordle game and a phoneme Word Search. Each generated activity can be downloaded as a single playable HTML file and opened in a normal web browser.

## Assessment Information

- **Assessment:** Assessment 1 – Frontend Design and Usability
- **Student:** Rudra Pandey
- **Student number:** 22455439
- **Framework:** Next.js and React
- **Project type:** Frontend-only activity builder
- **Repository:** [prudra1723/phoneme-activity-builder](https://github.com/prudra1723/phoneme-activity-builder)

This project was created using the required command:

```bash
npx create-next-app .
```

Assessment 1 focuses on frontend design, component structure, responsiveness, usability and accessibility. It does not use a database. Database-driven word lists and more advanced generation options may be introduced in later assessments.

## Main Features

### Phoneme Wordle

The Wordle builder allows a teacher to:

- create one answer using phoneme symbols;
- enter the normal English equivalence;
- select between three and six guesses;
- enable or disable phoneme hints;
- preview and play the activity;
- display the English word after a correct answer; and
- download the game as one standalone HTML file.

For example, the teacher can create the word **thin** using:

```text
/θ/ + /ɪ/ + /n/ = /θɪn/
```

### Phoneme Word Search

The Word Search builder provides:

- approximately five fixed phoneme-based words;
- English-equivalence hints;
- an interactive phoneme grid;
- live progress and learner feedback;
- a preview of the generated activity; and
- a downloadable standalone HTML file.

The fixed word list keeps Assessment 1 within its frontend-only scope. Dynamic word-list management can be added in a future assessment.

### Interface Settings

The Settings page provides:

- light and dark themes;
- theme preferences stored in browser cookies;
- comfortable and compact layout options; and
- interface preferences that remain after refreshing the page.

## Required Pages

| Page        | Purpose                                                                       |
| ----------- | ----------------------------------------------------------------------------- |
| Home        | Introduces the application and links to both activity builders                |
| Wordle      | Configures, previews and downloads a single-word phoneme Wordle               |
| Word Search | Previews and downloads a five-word phoneme Word Search                        |
| About       | Explains the project, assessment scope, student details, video and references |
| Settings    | Controls the theme and layout preferences                                     |

## Teacher Workflow

The application follows a simple three-step workflow:

1. **Configure** – Select the phoneme content and activity settings.
2. **Preview** – Test the activity and review the learner experience.
3. **Download** – Generate one standalone playable HTML file.

The downloaded file contains its own HTML, CSS and JavaScript. It does not require the original Next.js application or an internet connection to run after it has been downloaded.

## Technology Stack

- Next.js
- React
- TypeScript
- CSS
- HTML
- Browser JavaScript
- Git and GitHub

## Component Structure

The application follows a modular, component-based architecture.

```text
app/
├── about/
│   └── page.tsx
├── settings/
│   └── page.tsx
├── wordle/
│   └── page.tsx
├── word-search/
│   └── page.tsx
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── Footer.tsx
├── Header.tsx
├── MobileMenu.tsx
├── Navigation.tsx
├── PhonemeButton.tsx
├── ThemeProvider.tsx
├── WordleBuilder.tsx
├── WordlePreview.tsx
├── WordSearchBuilder.tsx
└── WordSearchPreview.tsx

lib/
├── generateWordleHtml.ts
├── generateWordSearchHtml.ts
└── phonemes.ts
```

The builders, previews, phoneme data and HTML generators are separated to reduce duplication and support future expansion.

## Getting Started

### Requirements

Install the following software:

- Node.js
- npm
- Git

### Clone the repository

```bash
git clone https://github.com/prudra1723/phoneme-activity-builder.git
cd phoneme-activity-builder
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the following address:

```text
http://localhost:3000
```

Next.js uses port **3000** by default. Port **5173** is normally associated with Vite and is not used by this project.

## Creating a Wordle Activity

1. Open the Wordle page.
2. Enter an activity title.
3. Select phoneme buttons to build the answer.
4. Enter the English equivalence.
5. Choose the number of guesses.
6. Enable or disable phoneme hints.
7. Test the activity in the live preview.
8. Select **Download playable HTML**.
9. Open `phoneme-wordle.html` in a normal browser.

Example:

```text
Title: TH Sound Practice
Phoneme answer: /θɪn/
English equivalence: thin
Number of guesses: 5
Hints: Enabled
```

## Creating a Word Search Activity

1. Open the Word Search page.
2. Enter an activity title.
3. Review the five fixed phoneme words.
4. Enable or disable English hints.
5. Test the grid using the live preview.
6. Select **Download playable HTML**.
7. Open the downloaded HTML file in a browser.

## Accessibility

Accessibility features include:

- semantic HTML elements;
- keyboard-accessible buttons and form controls;
- visible keyboard focus indicators;
- descriptive form labels;
- ARIA labels and live regions;
- a Skip to Main Content link;
- phoneme hints for visual and assistive-technology users;
- text feedback that does not rely only on colour;
- responsive layouts for desktop, tablet and mobile screens; and
- video caption and transcript support.

For example, a phoneme button can provide `/θ/ — TH as in thin` through both a visual hover hint and an accessible label.

## Responsive Design

The interface adapts to different screen sizes.

- Desktop screens display the builder and preview in columns.
- Tablet and mobile screens stack the panels vertically.
- Desktop navigation changes to a hamburger menu on compact screens.
- Controls remain readable and usable without removing important functionality.

## Production Build

Create an optimised production build with:

```bash
npm run build
```

If the build succeeds, start the production server with:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## Code Quality

Run the linter with:

```bash
npm run lint
```

Before committing changes, run:

```bash
npm run lint
npm run build
```

## Git Workflow

Check changed files:

```bash
git status
```

Stage the intended files:

```bash
git add README.md
```

Commit the changes:

```bash
git commit -m "Update project README and references"
```

Push the commit:

```bash
git push origin main
```

## Project Limitations and Future Development

Assessment 1 intentionally has the following limitations:

- no database;
- one phoneme answer for each Wordle activity;
- a fixed Word Search word list;
- no user accounts; and
- no saved activities inside the builder.

Possible future improvements include:

- database-driven word lists;
- teacher-created Word Search content;
- multiple difficulty levels;
- saved teacher activities;
- learner progress records;
- additional phoneme sets; and
- richer classroom activity templates.

## References

International Phonetic Association. (n.d.). _The International Phonetic Alphabet and the IPA chart_. https://www.internationalphoneticassociation.org/content/ipa-chart

Meta Platforms, Inc. (n.d.). _Thinking in React_. React. https://react.dev/learn/thinking-in-react

Mozilla. (2026, May 20). _HTML: A good basis for accessibility_. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML

Vercel. (n.d.). _Next.js documentation: App Router_. Next.js. https://nextjs.org/docs/app

World Wide Web Consortium. (2024, December 12). _Web Content Accessibility Guidelines (WCAG) 2.2_. https://www.w3.org/TR/WCAG22/

## AI Acknowledgement

Generative AI was used as permitted by the assessment instructions to support planning, code explanation, debugging, documentation and language refinement. All generated material was reviewed, tested and adapted by the student. The required university AI acknowledgement should also be completed and submitted separately.

## Author

**Rudra Pandey**
Student number: **22455439**
