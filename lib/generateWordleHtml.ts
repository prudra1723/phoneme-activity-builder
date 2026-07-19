type GenerateWordleOptions = {
  title: string;
  answer: string[];
  english: string;
  maxGuesses: number;
  showHints: boolean;
  hints: string[];
};

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function safeTitle(value: string) {
  return value.replace(/[<>&"]/g, "");
}

export function generateWordleHtml(options: GenerateWordleOptions) {
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
      background: #f5f7ff;
      color: #182033;
      font-family: Arial, Helvetica, sans-serif;
    }

    button {
      font: inherit;
    }

    button:focus-visible {
      outline: 3px solid #5b4ee8;
      outline-offset: 3px;
    }

    .app {
      width: min(94%, 760px);
      margin: 32px auto;
      padding: 28px;
      border-radius: 20px;
      background: #ffffff;
      box-shadow: 0 16px 45px rgba(29, 39, 69, 0.1);
      text-align: center;
    }

    h1 {
      margin: 0 0 8px;
    }

    .instructions {
      color: #5f6c82;
    }

    .target {
      margin-bottom: 5px;
      color: #5145cd;
      font-size: 2rem;
      font-weight: 800;
    }

    .hint {
      min-height: 24px;
      color: #5f6c82;
    }

    .board {
      display: grid;
      width: max-content;
      margin: 24px auto;
      gap: 8px;
    }

    .row {
      display: flex;
      gap: 8px;
    }

    .tile {
      display: grid;
      width: 54px;
      height: 54px;
      place-items: center;
      border: 2px solid #d8deea;
      border-radius: 9px;
      background: #ffffff;
      font-size: 1.25rem;
      font-weight: 800;
    }

    .correct {
      border-color: #0d9488;
      background: #0d9488;
      color: #ffffff;
    }

    .present {
      border-color: #eab308;
      background: #eab308;
      color: #1f2937;
    }

    .absent {
      border-color: #64748b;
      background: #64748b;
      color: #ffffff;
    }

    .keys {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 7px;
    }

    .key,
    .action {
      padding: 10px 12px;
      border: 1px solid #ccd3e0;
      border-radius: 9px;
      background: #f4f6fb;
      font-weight: 700;
      cursor: pointer;
    }

    .key:hover,
    .action:hover {
      border-color: #5b4ee8;
    }

    .key small {
      display: block;
      margin-top: 2px;
      color: #596579;
      font-size: 0.65rem;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 16px;
    }

    .primary {
      border-color: #5b4ee8;
      background: #5b4ee8;
      color: #ffffff;
    }

    .message {
      min-height: 28px;
      font-weight: 700;
    }

    .success {
      color: #15803d;
    }

    .reveal {
      padding: 12px;
      border-radius: 10px;
      background: #eeecff;
    }

    .legend {
      display: flex;
      margin: 20px 0;
      justify-content: center;
      gap: 14px;
      color: #5f6c82;
      font-size: 0.8rem;
    }

    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .legend i {
      width: 14px;
      height: 14px;
      border-radius: 3px;
    }

    @media (max-width: 520px) {
      .app {
        padding: 18px;
      }

      .tile {
        width: 44px;
        height: 44px;
      }
    }
  </style>
</head>

<body>
  <main class="app">
    <h1 id="title"></h1>

    <p class="instructions">
      Build the displayed phoneme word using the keyboard.
    </p>

    <p class="target" id="target"></p>
    <p class="hint" id="hint"></p>

    <div
      class="board"
      id="board"
      aria-label="Phoneme Wordle guesses"
    ></div>

    <div class="legend" aria-label="Feedback explanation">
      <span>
        <i style="background:#0d9488"></i>
        Correct position
      </span>

      <span>
        <i style="background:#eab308"></i>
        Wrong position
      </span>

      <span>
        <i style="background:#64748b"></i>
        Not in answer
      </span>
    </div>

    <p
      class="message"
      id="message"
      aria-live="polite"
    ></p>

    <div class="keys" id="keys"></div>

    <div class="actions">
      <button class="action" id="delete" type="button">
        Delete
      </button>

      <button class="action primary" id="enter" type="button">
        Enter guess
      </button>

      <button class="action" id="reset" type="button">
        Reset
      </button>
    </div>

    <p id="reveal"></p>
  </main>

  <script>
    const data = ${data};

    const phonemes = [
      ["θ", "TH as in thin"],
      ["ʃ", "SH as in ship"],
      ["tʃ", "CH as in chip"],
      ["ɪ", "I as in sit"],
      ["æ", "A as in cat"],
      ["ɒ", "O as in dog"],
      ["ə", "A as in about"],
      ["k", "K/C as in cat"],
      ["d", "D as in dog"],
      ["g", "G as in go"],
      ["f", "F as in fish"],
      ["n", "N as in thin"],
      ["p", "P as in ship"],
      ["t", "T as in cat"]
    ];

    let current = [];
    let guesses = [];

    const board = document.getElementById("board");
    const message = document.getElementById("message");
    const reveal = document.getElementById("reveal");
    const keys = document.getElementById("keys");
    const enterButton = document.getElementById("enter");
    const deleteButton = document.getElementById("delete");

    function scoreGuess(guess) {
      const marks = Array(data.answer.length).fill("absent");
      const remaining = [...data.answer];

      guess.forEach((symbol, index) => {
        if (symbol === data.answer[index]) {
          marks[index] = "correct";
          remaining[index] = "";
        }
      });

      guess.forEach((symbol, index) => {
        if (marks[index] === "correct") {
          return;
        }

        const foundIndex = remaining.indexOf(symbol);

        if (foundIndex >= 0) {
          marks[index] = "present";
          remaining[foundIndex] = "";
        }
      });

      return marks;
    }

    function hasWon() {
      return guesses.some(
        (guess) =>
          guess.join("|") === data.answer.join("|")
      );
    }

    function renderBoard() {
      board.innerHTML = "";

      for (let rowIndex = 0; rowIndex < data.maxGuesses; rowIndex += 1) {
        const row = document.createElement("div");
        row.className = "row";

        const guess = guesses[rowIndex];
        const active =
          rowIndex === guesses.length ? current : [];

        const marks = guess ? scoreGuess(guess) : [];

        data.answer.forEach((unused, columnIndex) => {
          const tile = document.createElement("span");

          tile.className =
            "tile " + (marks[columnIndex] || "");

          tile.textContent =
            (guess && guess[columnIndex]) ||
            active[columnIndex] ||
            "";

          if (marks[columnIndex]) {
            tile.setAttribute(
              "aria-label",
              tile.textContent + ", " + marks[columnIndex],
            );
          }

          row.appendChild(tile);
        });

        board.appendChild(row);
      }
    }

    function render() {
      document.getElementById("title").textContent =
        data.title;

      document.getElementById("target").textContent =
        "/" + data.answer.join("") + "/";

      document.getElementById("hint").textContent =
        data.showHints ? data.hints.join(" · ") : "";

      renderBoard();

      const won = hasWon();
      const finished =
        won || guesses.length >= data.maxGuesses;

      keys.hidden = finished;
      enterButton.disabled = finished;
      deleteButton.disabled = finished;

      if (finished && !won) {
        reveal.className = "reveal";
        reveal.textContent =
          "Answer: /" +
          data.answer.join("") +
          "/ — " +
          data.english;
      }
    }

    phonemes.forEach(([symbol, hint]) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "key";
      button.title = "/" + symbol + "/ — " + hint;

      button.setAttribute(
        "aria-label",
        "/" + symbol + "/ — " + hint + ". Add phoneme.",
      );

      const symbolElement = document.createElement("span");
      symbolElement.textContent = "/" + symbol + "/";

      const hintElement = document.createElement("small");
      hintElement.textContent = hint;

      button.appendChild(symbolElement);
      button.appendChild(hintElement);

      button.addEventListener("click", () => {
        if (current.length < data.answer.length) {
          current.push(symbol);
          render();
        }
      });

      keys.appendChild(button);
    });

    deleteButton.addEventListener("click", () => {
      current.pop();
      render();
    });

    enterButton.addEventListener("click", () => {
      if (current.length !== data.answer.length) {
        message.className = "message";
        message.textContent =
          "Choose exactly " +
          data.answer.length +
          " phonemes.";

        return;
      }

      const correct =
        current.join("|") === data.answer.join("|");

      guesses.push([...current]);
      current = [];

      if (correct) {
        message.className = "message success";
        message.textContent =
          "Correct! /" +
          data.answer.join("") +
          "/ means “" +
          data.english +
          "”.";
      } else {
        message.className = "message";
        message.textContent =
          "Not quite—use the feedback and try again.";
      }

      render();
    });

    document
      .getElementById("reset")
      .addEventListener("click", () => {
        current = [];
        guesses = [];

        message.className = "message";
        message.textContent = "";

        reveal.className = "";
        reveal.textContent = "";

        render();
      });

    render();
  </script>
</body>
</html>`;
}

export function downloadHtml(content: string, filename: string) {
  const blob = new Blob([content], {
    type: "text/html;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}
