"use client";

import { useEffect, useState } from "react";
import WordSearchPreview from "@/components/WordSearchPreview";
import {
  getPhonemeHint,
  WORD_SEARCH_GRID,
  WORD_SEARCH_WORDS,
  type PhonemeWord,
} from "@/lib/phonemes";
import { createWordSearch } from "@/lib/createWordSearch";
import {
  downloadWordSearchHtml,
  generateWordSearchHtml,
} from "@/lib/generateWordSearchHtml";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

type SavedActivitySummary = {
  id: string;
  title: string;
  type: "WORDLE" | "WORD_SEARCH";
};

type SavedWordSearchActivity = {
  id: string;
  title: string;
  type: "WORD_SEARCH";
  difficulty: Difficulty;
  showHints: boolean;
  gridSize: number | null;
  outputFilename: string | null;
  wordList: {
    name: string;
    words: Array<{
      position: number;
      word: {
        id: string;
        english: string;
        phonetic: string;
        phonemes: Array<{
          position: number;
          phoneme: {
            symbol: string;
          };
        }>;
      };
    }>;
  };
};

function normalisePhonemeSymbol(symbol: string) {
  return symbol.replace(/^\/+|\/+$/g, "");
}

function withoutCellPositions(words: PhonemeWord[]) {
  return words.map((word) => ({
    id: word.id,
    phoneme: word.phoneme,
    english: word.english,
    tokens: word.tokens,
  }));
}

export default function WordSearchBuilder() {
  const [title, setTitle] = useState("Phoneme Word Search");
  const [showHints, setShowHints] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [gridSize, setGridSize] = useState(8);
  const [outputFilename, setOutputFilename] = useState(
    "phoneme-word-search.html",
  );
  const [grid, setGrid] = useState<string[]>(WORD_SEARCH_GRID);
  const [words, setWords] = useState<PhonemeWord[]>(WORD_SEARCH_WORDS);

  const [savedActivities, setSavedActivities] = useState<
    SavedActivitySummary[]
  >([]);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [activityMessage, setActivityMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function retrieveActivities() {
      try {
        const response = await fetch("/api/activities");

        if (!response.ok) {
          throw new Error("Unable to retrieve saved activities");
        }

        const result = (await response.json()) as {
          data: SavedActivitySummary[];
        };

        if (!cancelled) {
          setSavedActivities(
            result.data.filter((activity) => activity.type === "WORD_SEARCH"),
          );
        }
      } catch {
        if (!cancelled) {
          setActivityMessage(
            "Saved activities could not be loaded. Check the database connection.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingActivities(false);
        }
      }
    }

    retrieveActivities();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadSavedActivity = async () => {
    if (!selectedActivityId) {
      setActivityMessage("Select a saved Word Search activity first.");
      return;
    }

    setActivityMessage("Loading saved activity...");

    try {
      const response = await fetch(`/api/activities/${selectedActivityId}`);

      const result = (await response.json()) as {
        data?: SavedWordSearchActivity;
        error?: string;
      };

      if (!response.ok || !result.data) {
        throw new Error(result.error || "Unable to load the selected activity");
      }

      const activity = result.data;

      if (activity.type !== "WORD_SEARCH" || !activity.wordList) {
        throw new Error(
          "The saved activity does not contain a valid Word Search word list.",
        );
      }

      const databaseWords: PhonemeWord[] = [...activity.wordList.words]
        .sort((first, second) => first.position - second.position)
        .map(({ word }) => {
          const tokens = [...word.phonemes]
            .sort((first, second) => first.position - second.position)
            .map((item) => normalisePhonemeSymbol(item.phoneme.symbol));

          return {
            id: word.id,
            phoneme: word.phonetic,
            english: word.english,
            tokens,
          };
        });

      if (databaseWords.length === 0) {
        throw new Error("The saved word list does not contain any words.");
      }

      if (databaseWords.some((word) => word.tokens.length === 0)) {
        throw new Error("One or more saved words have no phoneme data.");
      }

      const savedGridSize = activity.gridSize ?? 8;
      const generatedSearch = createWordSearch(databaseWords, savedGridSize);

      setTitle(activity.title);
      setShowHints(activity.showHints);
      setDifficulty(activity.difficulty);
      setGridSize(savedGridSize);
      setOutputFilename(activity.outputFilename || "phoneme-word-search.html");
      setGrid(generatedSearch.grid);
      setWords(generatedSearch.words);
      setActivityMessage(
        `Loaded "${activity.title}" from the database using "${activity.wordList.name}".`,
      );
    } catch (error) {
      setActivityMessage(
        error instanceof Error
          ? error.message
          : "Unable to load the selected activity",
      );
    }
  };

  const changeGridSize = (nextGridSize: number) => {
    try {
      const generatedSearch = createWordSearch(
        withoutCellPositions(words),
        nextGridSize,
      );

      setGridSize(nextGridSize);
      setGrid(generatedSearch.grid);
      setWords(generatedSearch.words);
      setActivityMessage("");
    } catch (error) {
      setActivityMessage(
        error instanceof Error ? error.message : "Unable to resize the grid.",
      );
    }
  };

  const generate = () => {
    if (words.length === 0 || grid.length !== gridSize * gridSize) {
      setActivityMessage(
        "Load a valid Word Search activity before downloading.",
      );
      return;
    }

    const hints = Object.fromEntries(
      [...new Set(grid)].map((symbol) => [symbol, getPhonemeHint(symbol)]),
    );

    downloadWordSearchHtml(
      generateWordSearchHtml({
        title: title.trim() || "Phoneme Word Search",
        grid,
        gridSize,
        words,
        showHints,
        hints,
      }),
      outputFilename.trim() || "phoneme-word-search.html",
    );
  };

  return (
    <div className="builder-workspace">
      <section
        className="builder-panel"
        aria-labelledby="search-settings-title"
      >
        <p className="eyebrow">Activity settings</p>
        <h2 id="search-settings-title">Configure Word Search</h2>

        <div className="form-field">
          <label htmlFor="saved-word-search">
            Load a saved database activity
          </label>

          <select
            id="saved-word-search"
            value={selectedActivityId}
            disabled={isLoadingActivities}
            onChange={(event) => {
              setSelectedActivityId(event.target.value);
              setActivityMessage("");
            }}
          >
            <option value="">
              {isLoadingActivities
                ? "Loading activities..."
                : "Select a saved Word Search"}
            </option>

            {savedActivities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="small-button"
            disabled={!selectedActivityId || isLoadingActivities}
            onClick={loadSavedActivity}
          >
            Load saved activity
          </button>

          {activityMessage && (
            <p role="status" aria-live="polite">
              {activityMessage}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="search-title">Activity title</label>
          <input
            id="search-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="search-difficulty">Difficulty</label>
          <select
            id="search-difficulty"
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as Difficulty)
            }
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="search-grid-size">Grid size</label>
          <select
            id="search-grid-size"
            value={gridSize}
            onChange={(event) => changeGridSize(Number(event.target.value))}
          >
            {[5, 6, 7, 8, 9, 10, 11, 12].map((size) => (
              <option key={size} value={size}>
                {size} × {size}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="search-output-filename">Download filename</label>
          <input
            id="search-output-filename"
            value={outputFilename}
            onChange={(event) => setOutputFilename(event.target.value)}
          />
        </div>

        <div className="fixed-word-list">
          <h3>Current database word list</h3>
          <p>
            These {words.length} words drive the preview and downloaded HTML.
          </p>
          <ul>
            {words.map((word) => (
              <li key={word.id}>
                <strong>{word.phoneme}</strong>
                <span>{word.english}</span>
              </li>
            ))}
          </ul>
        </div>

        <label className="toggle-setting">
          <input
            type="checkbox"
            checked={showHints}
            onChange={(event) => setShowHints(event.target.checked)}
          />
          <span>
            <strong>Show English hints</strong>
            <small>Display the English equivalence beside each target.</small>
          </span>
        </label>

        <button
          type="button"
          className="button button-primary generate-button"
          disabled={words.length === 0}
          onClick={generate}
        >
          Download playable HTML
        </button>
      </section>

      <section className="preview-panel">
        <WordSearchPreview
          key={`${selectedActivityId}-${gridSize}-${grid.join("|")}`}
          title={title || "Phoneme Word Search"}
          grid={grid}
          words={words}
          showHints={showHints}
        />
      </section>
    </div>
  );
}
