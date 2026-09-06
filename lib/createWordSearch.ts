import { PHONEMES, type PhonemeWord } from "@/lib/phonemes";

type Direction = {
  row: number;
  column: number;
};

const DIRECTIONS: Direction[] = [
  { row: 0, column: 1 },
  { row: 1, column: 0 },
  { row: 1, column: 1 },
  { row: 1, column: -1 },
];

function getCells(
  startIndex: number,
  direction: Direction,
  length: number,
  gridSize: number,
) {
  const startRow = Math.floor(startIndex / gridSize);
  const startColumn = startIndex % gridSize;
  const cells: number[] = [];

  for (let offset = 0; offset < length; offset += 1) {
    const row = startRow + direction.row * offset;
    const column = startColumn + direction.column * offset;

    if (row < 0 || row >= gridSize || column < 0 || column >= gridSize) {
      return [];
    }

    cells.push(row * gridSize + column);
  }

  return cells;
}

export function createWordSearch(sourceWords: PhonemeWord[], gridSize: number) {
  if (!Number.isInteger(gridSize) || gridSize < 5 || gridSize > 20) {
    throw new Error("Grid size must be an integer between 5 and 20.");
  }

  if (sourceWords.length === 0) {
    throw new Error("At least one word is required.");
  }

  const grid: Array<string | null> = Array(gridSize * gridSize).fill(null);

  const placedWords: PhonemeWord[] = [];

  sourceWords.forEach((word, wordIndex) => {
    if (word.tokens.length === 0) {
      throw new Error(`${word.english} has no phoneme tokens.`);
    }

    if (word.tokens.length > gridSize) {
      throw new Error(
        `${word.english} is too long for a ${gridSize} × ${gridSize} grid.`,
      );
    }

    let selectedCells: number[] | null = null;

    const orderedDirections = DIRECTIONS.map(
      (_, index) => DIRECTIONS[(index + wordIndex) % DIRECTIONS.length],
    );

    for (const direction of orderedDirections) {
      for (let startIndex = 0; startIndex < grid.length; startIndex += 1) {
        const cells = getCells(
          startIndex,
          direction,
          word.tokens.length,
          gridSize,
        );

        if (cells.length === 0) {
          continue;
        }

        const canPlace = cells.every((cell, index) => {
          const currentSymbol = grid[cell];

          return currentSymbol === null || currentSymbol === word.tokens[index];
        });

        if (canPlace) {
          selectedCells = cells;
          break;
        }
      }

      if (selectedCells) {
        break;
      }
    }

    if (!selectedCells) {
      throw new Error(`Unable to place ${word.english} in the grid.`);
    }

    selectedCells.forEach((cell, index) => {
      grid[cell] = word.tokens[index];
    });

    placedWords.push({
      ...word,
      cells: selectedCells,
    });
  });

  const fillerSymbols = PHONEMES.map((phoneme) => phoneme.symbol);

  const completedGrid = grid.map(
    (symbol, index) =>
      symbol ??
      fillerSymbols[(index * 7 + sourceWords.length) % fillerSymbols.length],
  );

  return {
    grid: completedGrid,
    words: placedWords,
  };
}
