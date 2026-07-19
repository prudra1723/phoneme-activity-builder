import type { PhonemeWord } from "@/lib/phonemes";
import { downloadHtml } from "@/lib/generateWordleHtml";

type GenerateWordSearchOptions = {
  title: string;
  grid: string[];
  words: PhonemeWord[];
  showHints: boolean;
  hints: Record<string, string>;
};

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function safeTitle(value: string) {
  return value.replace(/[<>&"]/g, "");
}

export function generateWordSearchHtml(options: GenerateWordSearchOptions) {
  const data = safeJson(options);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>${safeTitle(options.title)}</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #f3f8f8;
      color: #172033;
      font-family: Arial, Helvetica, sans-serif;
    }

    button {
      font: inherit;
    }

    button:focus-visible {
      outline: 3px solid #5b4ee8;
      outline-offset: 2px;
    }

    .app {
      width: min(94%, 920px);
      margin: 30px auto;
      padding: 30px;
      border-radius: 20px;
      background: #ffffff;
      box-shadow: 0 16px 45px rgba(29, 39, 69, 0.1);
    }

    .heading {
      margin-bottom: 26px;
      text-align: center;
    }

    h1 {
      margin: 0 0 10px;
    }

    .instructions {
      max-width: 650px;
      margin: 0 auto;
      color: #5f6c82;
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(320px, 1fr) 230px;
      align-items: start;
      gap: 28px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(8, minmax(36px, 1fr));
      gap: 5px;
    }

    .cell {
      display: grid;
      min-width: 0;
      aspect-ratio: 1;
      padding: 0;
      place-items: center;
      border: 2px solid #d9e1e7;
      border-radius: 7px;
      background: #f8fafc;
      color: #172033;
      font-size: 1.05rem;
      font-weight: 800;
      cursor: pointer;
    }

    .cell:hover {
      border-color: #5b4ee8;
      background: #eeecff;
    }

    .cell.selected {
      border-color: #5b4ee8;
      background: #eeecff;
      color: #4438ca;
    }

    .cell.found {
      border-color: #0d9488;
      background: #0d9488;
      color: #ffffff;
    }

    .word-panel {
      padding: 18px;
      border: 1px solid #dfe4ee;
      border-radius: 14px;
      background: #f8fafc;
    }

    .word-panel h2 {
      margin: 0 0 14px;
      font-size: 1.15rem;
    }

    .words {
      display: grid;
      margin: 0;
      padding: 0;
      gap: 7px;
      list-style: none;
    }

    .words li {
      display: grid;
      padding: 10px;
      grid-template-columns: 22px 1fr;
      align-items: center;
      gap: 5px;
      border: 1px solid #e1e6ee;
      border-radius: 9px;
      background: #ffffff;
    }

    .word-status {
      color: #647086;
      font-weight: 900;
    }

    .word-phoneme {
      font-weight: 800;
    }

    .word-english {
      grid-column: 2;
      color: #647086;
      font-size: 0.8rem;
    }

    .words li.found {
      border-color: #0d9488;
      background: #e7f8f5;
      color: #0f766e;
      text-decoration: line-through;
    }

    .words li.found .word-status {
      color: #0f766e;
    }

    .message {
      min-height: 28px;
      margin: 24px 0 12px;
      font-weight: 700;
      text-align: center;
    }

    .completion {
      display: none;
      padding: 14px;
      border: 1px solid #86efac;
      border-radius: 11px;
      background: #dcfce7;
      color: #166534;
      font-weight: 800;
      text-align: center;
    }

    .completion.visible {
      display: block;
    }

    .reset {
      display: block;
      min-height: 44px;
      margin: 18px auto 0;
      padding: 10px 18px;
      border: 0;
      border-radius: 9px;
      background: #5b4ee8;
      color: #ffffff;
      font-weight: 750;
      cursor: pointer;
    }

    .reset:hover {
      background: #4438ca;
    }

    .legend {
      display: flex;
      margin-top: 20px;
      justify-content: center;
      gap: 16px;
      color: #647086;
      font-size: 0.8rem;
    }

    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .legend i {
      width: 14px;
      height: 14px;
      border-radius: 3px;
    }

    @media (max-width: 720px) {
      .layout {
        grid-template-columns: 1fr;
      }

      .word-panel {
        order: -1;
      }

      .words {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 520px) {
      .app {
        padding: 18px;
      }

      .grid {
        grid-template-columns: repeat(8, minmax(31px, 1fr));
        gap: 3px;
      }

      .cell {
        font-size: 0.85rem;
      }

      .words {
        grid-template-columns: 1fr;
      }

      .legend {
        align-items: center;
        flex-direction: column;
      }
    }
  </style>
</head>

<body>
  <main class="app">
    <header class="heading">
      <h1 id="activity-title"></h1>

      <p class="instructions">
        Select the first and last phoneme of each hidden word.
        Words may appear horizontally, vertically or diagonally.
      </p>
    </header>

    <div class="layout">
      <div>
        <div
          class="grid"
          id="word-search-grid"
          role="grid"
          aria-label="Phoneme word search grid"
        ></div>

        <div class="legend" aria-label="Grid feedback">
          <span>
            <i style="background:#eeecff;border:1px solid #5b4ee8"></i>
            Current selection
          </span>

          <span>
            <i style="background:#0d9488"></i>
            Found word
          </span>
        </div>
      </div>

      <section
        class="word-panel"
        aria-labelledby="target-words-heading"
      >
        <h2 id="target-words-heading">Find these words</h2>

        <ul class="words" id="target-words"></ul>
      </section>
    </div>

    <p
      class="message"
      id="game-message"
      aria-live="polite"
    >
      Select the first phoneme of a word.
    </p>

    <p
      class="completion"
      id="completion-message"
      role="status"
      aria-live="polite"
    ></p>

    <button class="reset" id="reset-button" type="button">
      Reset activity
    </button>
  </main>

  <script>
    const data = ${data};

    let selectionStart = null;
    let selectedCells = [];
    let foundWords = [];

    const gridElement =
      document.getElementById("word-search-grid");

    const wordListElement =
      document.getElementById("target-words");

    const messageElement =
      document.getElementById("game-message");

    const completionElement =
      document.getElementById("completion-message");

    function createSelection(startIndex, endIndex) {
      const startRow = Math.floor(startIndex / 8);
      const startColumn = startIndex % 8;

      const endRow = Math.floor(endIndex / 8);
      const endColumn = endIndex % 8;

      const rowDifference = endRow - startRow;
      const columnDifference = endColumn - startColumn;

      const horizontal = startRow === endRow;
      const vertical = startColumn === endColumn;

      const diagonal =
        Math.abs(rowDifference) ===
        Math.abs(columnDifference);

      if (!horizontal && !vertical && !diagonal) {
        return [];
      }

      const rowDirection = Math.sign(rowDifference);
      const columnDirection = Math.sign(columnDifference);

      const cells = [];

      let currentRow = startRow;
      let currentColumn = startColumn;

      while (true) {
        cells.push(currentRow * 8 + currentColumn);

        if (
          currentRow === endRow &&
          currentColumn === endColumn
        ) {
          break;
        }

        currentRow += rowDirection;
        currentColumn += columnDirection;
      }

      return cells;
    }

    function arraysMatch(first, second) {
      return (
        first.length === second.length &&
        first.every(
          (value, index) => value === second[index],
        )
      );
    }

    function getMatchingWord(selectedPath) {
      return data.words.find((word) => {
        const cells = word.cells || [];
        const reversedCells = [...cells].reverse();

        return (
          arraysMatch(cells, selectedPath) ||
          arraysMatch(reversedCells, selectedPath)
        );
      });
    }

    function getFoundCells() {
      const foundCells = new Set();

      data.words.forEach((word) => {
        if (foundWords.includes(word.id)) {
          (word.cells || []).forEach((cell) => {
            foundCells.add(cell);
          });
        }
      });

      return foundCells;
    }

    function renderGrid() {
      const foundCells = getFoundCells();

      const cellButtons =
        gridElement.querySelectorAll(".cell");

      cellButtons.forEach((button, index) => {
        button.className = "cell";

        if (selectedCells.includes(index)) {
          button.classList.add("selected");
        }

        if (foundCells.has(index)) {
          button.classList.add("found");
          button.setAttribute("aria-pressed", "true");
        } else {
          button.setAttribute("aria-pressed", "false");
        }
      });
    }

    function renderWordList() {
      wordListElement.innerHTML = "";

      data.words.forEach((word) => {
        const hasBeenFound =
          foundWords.includes(word.id);

        const listItem = document.createElement("li");

        if (hasBeenFound) {
          listItem.className = "found";
        }

        const status = document.createElement("span");
        status.className = "word-status";
        status.textContent = hasBeenFound ? "✓" : "○";
        status.setAttribute("aria-hidden", "true");

        const phoneme = document.createElement("span");
        phoneme.className = "word-phoneme";
        phoneme.textContent = word.phoneme;

        listItem.appendChild(status);
        listItem.appendChild(phoneme);

        if (data.showHints) {
          const english = document.createElement("span");

          english.className = "word-english";
          english.textContent = word.english;

          listItem.appendChild(english);
        }

        const accessibilityStatus =
          hasBeenFound ? "Found" : "Not found";

        listItem.setAttribute(
          "aria-label",
          word.phoneme +
            ", " +
            word.english +
            ", " +
            accessibilityStatus,
        );

        wordListElement.appendChild(listItem);
      });
    }

    function renderCompletion() {
      const complete =
        foundWords.length === data.words.length;

      if (complete) {
        completionElement.className =
          "completion visible";

        completionElement.textContent =
          "Excellent! You found all " +
          data.words.length +
          " phoneme words.";
      } else {
        completionElement.className = "completion";
        completionElement.textContent = "";
      }
    }

    function render() {
      renderGrid();
      renderWordList();
      renderCompletion();
    }

    function selectCell(index) {
      if (selectionStart === null) {
        selectionStart = index;
        selectedCells = [index];

        messageElement.textContent =
          "Now select the last phoneme of the word.";

        renderGrid();
        return;
      }

      const selectedPath =
        createSelection(selectionStart, index);

      selectionStart = null;
      selectedCells = selectedPath;

      if (selectedPath.length === 0) {
        messageElement.textContent =
          "Select cells in a horizontal, vertical or diagonal line.";

        renderGrid();
        return;
      }

      const matchingWord =
        getMatchingWord(selectedPath);

      if (matchingWord) {
        if (!foundWords.includes(matchingWord.id)) {
          foundWords.push(matchingWord.id);
        }

        messageElement.textContent =
          "Found " +
          matchingWord.phoneme +
          " — " +
          matchingWord.english +
          "!";
      } else {
        messageElement.textContent =
          "That selection is not a target word. Try again.";
      }

      render();
    }

    function createGrid() {
      gridElement.innerHTML = "";

      data.grid.forEach((symbol, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "cell";
        button.setAttribute("role", "gridcell");
        button.setAttribute("aria-pressed", "false");

        const phonemeHint =
          data.hints[symbol] || "/" + symbol + "/";

        button.title = phonemeHint;
        button.setAttribute(
          "aria-label",
          phonemeHint +
            ". Row " +
            (Math.floor(index / 8) + 1) +
            ", column " +
            ((index % 8) + 1),
        );

        button.textContent = symbol;

        button.addEventListener("click", () => {
          selectCell(index);
        });

        gridElement.appendChild(button);
      });
    }

    function resetActivity() {
      selectionStart = null;
      selectedCells = [];
      foundWords = [];

      messageElement.textContent =
        "Select the first phoneme of a word.";

      render();
    }

    document.getElementById("activity-title").textContent =
      data.title;

    document
      .getElementById("reset-button")
      .addEventListener("click", resetActivity);

    createGrid();
    render();
  </script>
</body>
</html>`;
}

export function downloadWordSearchHtml(content: string) {
  downloadHtml(content, "phoneme-word-search.html");
}
