"use client";

import { useEffect, useState } from "react";
import WordSearchPreview from "@/components/WordSearchPreview";
import PageUsageTracker from "@/components/PageUsageTracker";
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
import { recordUsageEvent } from "@/lib/usageEvents";

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
  const [loadedActivityId, setLoadedActivityId] = useState("");
  const [loadedWordListName, setLoadedWordListName] = useState("");
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingSavedActivity, setIsLoadingSavedActivity] = useState(false);
  const [activityMessage, setActivityMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function retrieveActivities() {
      try {
        const response = await fetch("/api/activities", {
          cache: "no-store",
        });

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

    void retrieveActivities();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadSavedActivity = async () => {
    if (!selectedActivityId || isLoadingSavedActivity) {
      return;
    }

    setIsLoadingSavedActivity(true);
    setActivityMessage("Loading saved activity...");

    try {
      const response = await fetch(`/api/activities/${selectedActivityId}`, {
        cache: "no-store",
      });

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

      if (
        databaseWords.some((word) =>
          word.tokens.some((token) => !token.trim()),
        ) ||
        databaseWords.some((word) => word.tokens.length === 0)
      ) {
        throw new Error(
          "One or more saved words contain missing phoneme data.",
        );
      }

      const savedGridSize = activity.gridSize ?? 8;

      const generatedSearch = createWordSearch(databaseWords, savedGridSize);

      setLoadedActivityId(activity.id);
      setLoadedWordListName(activity.wordList.name);
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
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load the selected activity.";

      setActivityMessage(message);

      void recordUsageEvent({
        eventType: "VALIDATION_WARNING",
        activityType: "WORD_SEARCH",
        pagePath: "/word-search",
        message: message.slice(0, 500),
        metadata: {
          operation: "load saved activity",
          selectedActivityId,
        },
      });
    } finally {
      setIsLoadingSavedActivity(false);
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
      const message =
        error instanceof Error ? error.message : "Unable to resize the grid.";

      setActivityMessage(message);

      void recordUsageEvent({
        eventType: "VALIDATION_WARNING",
        activityType: "WORD_SEARCH",
        pagePath: "/word-search",
        ...(loadedActivityId ? { activityId: loadedActivityId } : {}),
        message: message.slice(0, 500),
        metadata: {
          operation: "resize grid",
          requestedGridSize: nextGridSize,
        },
      });
    }
  };

  const generate = () => {
    const eventContext = {
      activityType: "WORD_SEARCH" as const,
      pagePath: "/word-search",
      ...(loadedActivityId ? { activityId: loadedActivityId } : {}),
    };

    if (
      words.length === 0 ||
      words.some(
        (word) =>
          word.tokens.length === 0 ||
          word.tokens.some((token) => !token.trim()),
      ) ||
      grid.length !== gridSize * gridSize
    ) {
      const message = "Load a valid Word Search activity before downloading.";

      setActivityMessage(message);

      void recordUsageEvent({
        ...eventContext,
        eventType: "VALIDATION_WARNING",
        message,
      });

      return;
    }

    try {
      const filename = outputFilename.trim() || "phoneme-word-search.html";

      const hints = Object.fromEntries(
        [...new Set(grid)].map((symbol) => [symbol, getPhonemeHint(symbol)]),
      );

      const content = generateWordSearchHtml({
        title: title.trim() || "Phoneme Word Search",
        grid,
        gridSize,
        words,
        showHints,
        hints,
      });

      downloadWordSearchHtml(content, filename);

      setActivityMessage("Playable HTML created. Download initiated.");

      void recordUsageEvent({
        ...eventContext,
        eventType: "GENERATION_SUCCESS",
        message: "Word Search HTML created and download initiated",
        metadata: {
          filename,
          difficulty,
          gridSize,
          showHints,
          wordCount: words.length,
          source: loadedActivityId
            ? "saved activity"
            : "frontend configuration",
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to generate Word Search HTML.";

      setActivityMessage(message);

      void recordUsageEvent({
        ...eventContext,
        eventType: "GENERATION_FAILED",
        message: message.slice(0, 500),
      });
    }
  };

  return (
    <div className="builder-workspace">
      <PageUsageTracker pagePath="/word-search" activityType="WORD_SEARCH" />

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
            disabled={isLoadingActivities || isLoadingSavedActivity}
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
            disabled={
              !selectedActivityId ||
              isLoadingActivities ||
              isLoadingSavedActivity
            }
            onClick={() => void loadSavedActivity()}
          >
            {isLoadingSavedActivity ? "Loading..." : "Load saved activity"}
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
          <h3>
            {loadedActivityId
              ? "Loaded database word list"
              : "Example word list"}
          </h3>

          <p>
            {loadedActivityId
              ? `"${loadedWordListName}" provides these ${words.length} words.`
              : "Load a saved activity to use database content. These example words are available for preview."}
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
          disabled={words.length === 0 || isLoadingSavedActivity}
          onClick={generate}
        >
          Download playable HTML
        </button>
      </section>

      <section className="preview-panel">
        <WordSearchPreview
          key={`${loadedActivityId}-${gridSize}-${grid.join("|")}`}
          title={title || "Phoneme Word Search"}
          grid={grid}
          words={words}
          showHints={showHints}
        />
      </section>
    </div>
  );
}
