"use client";

import { useState } from "react";
import { getPhonemeHint, type PhonemeWord } from "@/lib/phonemes";

type WordSearchPreviewProps = {
  title: string;
  grid: string[];
  words: PhonemeWord[];
  showHints: boolean;
};

function createSelection(
  startIndex: number,
  endIndex: number,
  gridSize: number,
) {
  const startRow = Math.floor(startIndex / gridSize);
  const startColumn = startIndex % gridSize;

  const endRow = Math.floor(endIndex / gridSize);
  const endColumn = endIndex % gridSize;

  const rowDifference = endRow - startRow;
  const columnDifference = endColumn - startColumn;

  const horizontal = startRow === endRow;
  const vertical = startColumn === endColumn;
  const diagonal = Math.abs(rowDifference) === Math.abs(columnDifference);

  if (!horizontal && !vertical && !diagonal) {
    return [];
  }

  const rowDirection = Math.sign(rowDifference);
  const columnDirection = Math.sign(columnDifference);
  const selectedCells: number[] = [];

  let currentRow = startRow;
  let currentColumn = startColumn;

  while (true) {
    selectedCells.push(currentRow * gridSize + currentColumn);

    if (currentRow === endRow && currentColumn === endColumn) {
      break;
    }

    currentRow += rowDirection;
    currentColumn += columnDirection;
  }

  return selectedCells;
}

function arraysMatch(first: number[], second: number[]) {
  return (
    first.length === second.length &&
    first.every((value, index) => value === second[index])
  );
}

export default function WordSearchPreview({
  title,
  grid,
  words,
  showHints,
}: WordSearchPreviewProps) {
  const gridSize = Math.sqrt(grid.length);

  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [foundWordIds, setFoundWordIds] = useState<string[]>([]);
  const [message, setMessage] = useState("Select the first phoneme of a word.");

  const foundCells = new Set(
    words
      .filter((word) => foundWordIds.includes(word.id))
      .flatMap((word) => word.cells ?? []),
  );

  const chooseCell = (cellIndex: number) => {
    if (selectionStart === null) {
      setSelectionStart(cellIndex);
      setSelectedCells([cellIndex]);
      setMessage("Now select the last phoneme of the word.");
      return;
    }

    const selection = createSelection(selectionStart, cellIndex, gridSize);

    setSelectionStart(null);
    setSelectedCells(selection);

    if (selection.length === 0) {
      setMessage("Select cells in a horizontal, vertical or diagonal line.");
      return;
    }

    const matchingWord = words.find((word) => {
      const wordCells = word.cells ?? [];
      const reversedCells = [...wordCells].reverse();

      return (
        arraysMatch(wordCells, selection) ||
        arraysMatch(reversedCells, selection)
      );
    });

    if (!matchingWord) {
      setMessage("That selection is not a target word. Try again.");
      return;
    }

    setFoundWordIds((previousIds) => {
      if (previousIds.includes(matchingWord.id)) {
        return previousIds;
      }

      return [...previousIds, matchingWord.id];
    });

    setMessage(`Found ${matchingWord.phoneme} — ${matchingWord.english}!`);
  };

  const resetGame = () => {
    setSelectionStart(null);
    setSelectedCells([]);
    setFoundWordIds([]);
    setMessage("Select the first phoneme of a word.");
  };

  const allWordsFound =
    words.length > 0 && foundWordIds.length === words.length;

  return (
    <div className="game-preview">
      <div className="game-preview-heading">
        <div>
          <p>Playable preview</p>
          <h3>{title}</h3>
        </div>

        <button type="button" className="small-button" onClick={resetGame}>
          Reset
        </button>
      </div>

      <p className="word-search-instruction">
        Select the first and last cell of each phoneme word. Words may appear
        horizontally, vertically or diagonally.
      </p>

      <div className="word-search-game">
        <div
          className="word-search-grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
          role="grid"
          aria-label="Phoneme word search grid"
        >
          {grid.map((symbol, index) => {
            const selected = selectedCells.includes(index);
            const found = foundCells.has(index);

            const stateClass = [
              "word-search-cell",
              selected ? "selected" : "",
              found ? "found" : "",
            ]
              .filter(Boolean)
              .join(" ");

            const row = Math.floor(index / gridSize) + 1;
            const column = (index % gridSize) + 1;
            const hint = getPhonemeHint(symbol);

            return (
              <button
                type="button"
                role="gridcell"
                key={`${symbol}-${index}`}
                className={stateClass}
                title={hint}
                aria-label={`${hint}. Row ${row}, column ${column}${
                  found ? ", found word" : ""
                }`}
                aria-selected={selected || found}
                onClick={() => chooseCell(index)}
              >
                {symbol}
              </button>
            );
          })}
        </div>

        <section className="target-list" aria-labelledby="target-list-heading">
          <h4 id="target-list-heading">Find these words</h4>

          <ul>
            {words.map((word) => {
              const found = foundWordIds.includes(word.id);

              return (
                <li
                  key={word.id}
                  className={found ? "found" : ""}
                  aria-label={`${word.phoneme}, ${
                    word.english
                  }, ${found ? "found" : "not found"}`}
                >
                  <span aria-hidden="true">{found ? "✓" : "○"}</span>

                  <strong>{word.phoneme}</strong>

                  {showHints && <small>{word.english}</small>}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div
        className="word-search-legend"
        aria-label="Word Search feedback explanation"
      >
        <span>
          <i className="search-legend-selected" aria-hidden="true" />
          Current selection
        </span>

        <span>
          <i className="search-legend-found" aria-hidden="true" />
          Found word
        </span>
      </div>

      <p className="game-message" role="status" aria-live="polite">
        {message}
      </p>

      {allWordsFound && (
        <p className="completion-message" role="status">
          Excellent! You found all {words.length} phoneme words.
        </p>
      )}
    </div>
  );
}
