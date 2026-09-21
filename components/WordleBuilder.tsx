"use client";

import { useEffect, useState } from "react";
import PageUsageTracker from "@/components/PageUsageTracker";
import PhonemeButton from "@/components/PhonemeButton";
import WordlePreview from "@/components/WordlePreview";
import { DEFAULT_WORDLE_WORD, PHONEMES, getPhonemeHint } from "@/lib/phonemes";
import { downloadHtml, generateWordleHtml } from "@/lib/generateWordleHtml";
import { recordUsageEvent } from "@/lib/usageEvents";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

type SavedActivitySummary = {
  id: string;
  title: string;
  type: "WORDLE" | "WORD_SEARCH";
};

type SavedWordleActivity = {
  id: string;
  title: string;
  type: "WORDLE";
  difficulty: Difficulty;
  showHints: boolean;
  maxGuesses: number | null;
  outputFilename: string | null;
  answerWord: {
    english: string;
    phonemes: Array<{
      position: number;
      phoneme: {
        symbol: string;
      };
    }>;
  } | null;
};

function normalisePhonemeSymbol(symbol: string) {
  return symbol.replace(/^\/+|\/+$/g, "");
}

export default function WordleBuilder() {
  const [title, setTitle] = useState("Phoneme Wordle");

  const [answer, setAnswer] = useState<string[]>(DEFAULT_WORDLE_WORD.tokens);

  const [english, setEnglish] = useState(DEFAULT_WORDLE_WORD.english);

  const [maxGuesses, setMaxGuesses] = useState(5);
  const [showHints, setShowHints] = useState(true);

  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");

  const [outputFilename, setOutputFilename] = useState("phoneme-wordle.html");

  const [savedActivities, setSavedActivities] = useState<
    SavedActivitySummary[]
  >([]);

  const [selectedActivityId, setSelectedActivityId] = useState("");

  const [loadedActivityId, setLoadedActivityId] = useState("");

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
            result.data.filter((activity) => activity.type === "WORDLE"),
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
        data?: SavedWordleActivity;
        error?: string;
      };

      if (!response.ok || !result.data) {
        throw new Error(result.error || "Unable to load the selected activity");
      }

      const activity = result.data;

      if (activity.type !== "WORDLE" || !activity.answerWord) {
        throw new Error(
          "The saved activity does not contain a valid Wordle answer.",
        );
      }

      const tokens = [...activity.answerWord.phonemes]
        .sort((first, second) => first.position - second.position)
        .map((item) => normalisePhonemeSymbol(item.phoneme.symbol));

      if (tokens.length === 0 || tokens.some((token) => !token.trim())) {
        throw new Error(
          "The saved answer does not contain valid phoneme data.",
        );
      }

      setLoadedActivityId(activity.id);
      setTitle(activity.title);
      setAnswer(tokens);
      setEnglish(activity.answerWord.english);
      setMaxGuesses(activity.maxGuesses ?? 5);
      setShowHints(activity.showHints);
      setDifficulty(activity.difficulty);

      setOutputFilename(activity.outputFilename || "phoneme-wordle.html");

      setActivityMessage(`Loaded "${activity.title}" from the database.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load the selected activity.";

      setActivityMessage(message);

      void recordUsageEvent({
        eventType: "VALIDATION_WARNING",
        activityType: "WORDLE",
        pagePath: "/wordle",
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

  const generate = async () => {
    const eventContext = {
      activityType: "WORDLE" as const,
      pagePath: "/wordle",
      ...(loadedActivityId ? { activityId: loadedActivityId } : {}),
    };

    if (
      answer.length === 0 ||
      answer.some((symbol) => !symbol.trim()) ||
      !english.trim()
    ) {
      const message = "Choose phonemes and enter an English equivalence.";

      setActivityMessage(message);

      await recordUsageEvent({
        ...eventContext,
        eventType: "VALIDATION_WARNING",
        message,
      });

      return;
    }

    try {
      const filename = outputFilename.trim() || "phoneme-wordle.html";

      const content = generateWordleHtml({
        title: title.trim() || "Phoneme Wordle",
        answer,
        english: english.trim(),
        maxGuesses,
        showHints,
        hints: answer.map(getPhonemeHint),
      });

      downloadHtml(content, filename);

      setActivityMessage("Playable HTML created. Download initiated.");

      await recordUsageEvent({
        ...eventContext,
        eventType: "GENERATION_SUCCESS",
        message: "Wordle HTML created and download initiated",
        metadata: {
          filename,
          difficulty,
          maxGuesses,
          showHints,
          phonemeCount: answer.length,
          source: loadedActivityId
            ? "saved activity"
            : "frontend configuration",
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to generate Wordle HTML.";

      setActivityMessage(message);

      await recordUsageEvent({
        ...eventContext,
        eventType: "GENERATION_FAILED",
        message: message.slice(0, 500),
      });
    }
  };

  return (
    <div className="builder-workspace">
      <PageUsageTracker pagePath="/wordle" activityType="WORDLE" />

      <section
        className="builder-panel"
        aria-labelledby="wordle-settings-title"
      >
        <p className="eyebrow">Activity settings</p>

        <h2 id="wordle-settings-title">Configure Wordle</h2>

        <div className="form-field">
          <label htmlFor="saved-wordle">Load a saved database activity</label>

          <select
            id="saved-wordle"
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
                : "Select a saved Wordle"}
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
          <label htmlFor="wordle-title">Activity title</label>

          <input
            id="wordle-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Phoneme word</label>

          <div className="answer-builder" aria-live="polite">
            /{answer.join("")}/
          </div>

          <div className="phoneme-picker">
            {PHONEMES.map((item) => (
              <PhonemeButton
                key={item.symbol}
                symbol={item.symbol}
                onClick={(symbol) =>
                  setAnswer((value) =>
                    value.length < 6 ? [...value, symbol] : value,
                  )
                }
              />
            ))}
          </div>

          <button
            type="button"
            className="small-button"
            onClick={() => setAnswer((value) => value.slice(0, -1))}
          >
            Remove last phoneme
          </button>
        </div>

        <div className="form-field">
          <label htmlFor="english-answer">English equivalence</label>

          <input
            id="english-answer"
            value={english}
            onChange={(event) => setEnglish(event.target.value)}
            placeholder="thin"
          />
        </div>

        <div className="form-field">
          <label htmlFor="difficulty">Difficulty</label>

          <select
            id="difficulty"
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
          <label htmlFor="guess-count">Number of guesses</label>

          <select
            id="guess-count"
            value={maxGuesses}
            onChange={(event) => setMaxGuesses(Number(event.target.value))}
          >
            {[3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="output-filename">Download filename</label>

          <input
            id="output-filename"
            value={outputFilename}
            onChange={(event) => setOutputFilename(event.target.value)}
          />
        </div>

        <label className="toggle-setting">
          <input
            type="checkbox"
            checked={showHints}
            onChange={(event) => setShowHints(event.target.checked)}
          />

          <span>
            <strong>Show phoneme hints</strong>

            <small>Display phonetic-to-English equivalences.</small>
          </span>
        </label>

        <button
          type="button"
          className="button button-primary generate-button"
          disabled={!answer.length || !english.trim() || isLoadingSavedActivity}
          onClick={generate}
        >
          Download playable HTML
        </button>
      </section>

      <section className="preview-panel">
        <WordlePreview
          key={`${loadedActivityId}-${answer.join("")}-${maxGuesses}`}
          title={title || "Phoneme Wordle"}
          answer={answer}
          english={english || "answer"}
          maxGuesses={maxGuesses}
          showHints={showHints}
        />
      </section>
    </div>
  );
}
