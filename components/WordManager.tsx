"use client";

import { type FormEvent, useEffect, useState } from "react";

type PhonemeRecord = {
  id: string;
  symbol: string;
  letters: string;
  example: string;
};

type WordRecord = {
  id: string;
  english: string;
  phonetic: string;
  hint: string | null;
  phonemes: Array<{
    position: number;
    phonemeId: string;
    phoneme: PhonemeRecord;
  }>;
};

type ApiError = {
  error?: string;
  errors?: string[];
};

function formatApiError(result: ApiError, fallback: string) {
  if (Array.isArray(result.errors) && result.errors.length > 0) {
    return result.errors.join(". ");
  }

  return result.error || fallback;
}

function displaySymbol(symbol: string) {
  const normalised = symbol.replace(/^\/+|\/+$/g, "");
  return `/${normalised}/`;
}

function orderedPhonemes(word: WordRecord) {
  return [...word.phonemes].sort(
    (first, second) => first.position - second.position,
  );
}

export default function WordManager() {
  const [words, setWords] = useState<WordRecord[]>([]);
  const [phonemes, setPhonemes] = useState<PhonemeRecord[]>([]);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [english, setEnglish] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [hint, setHint] = useState("");
  const [phonemeToAdd, setPhonemeToAdd] = useState("");
  const [selectedPhonemeIds, setSelectedPhonemeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const retrieveWords = async () => {
    const response = await fetch("/api/words");
    const result = (await response.json()) as {
      data?: WordRecord[];
      error?: string;
    };

    if (!response.ok || !result.data) {
      throw new Error(result.error || "Unable to retrieve words");
    }

    setWords(result.data);
  };

  useEffect(() => {
    let cancelled = false;

    async function retrieveData() {
      try {
        const [wordResponse, phonemeResponse] = await Promise.all([
          fetch("/api/words"),
          fetch("/api/phonemes"),
        ]);

        const wordResult = (await wordResponse.json()) as {
          data?: WordRecord[];
          error?: string;
        };

        const phonemeResult = (await phonemeResponse.json()) as {
          data?: PhonemeRecord[];
          error?: string;
        };

        if (!wordResponse.ok || !wordResult.data) {
          throw new Error(wordResult.error || "Unable to retrieve words");
        }

        if (!phonemeResponse.ok || !phonemeResult.data) {
          throw new Error(phonemeResult.error || "Unable to retrieve phonemes");
        }

        if (!cancelled) {
          setWords(wordResult.data);
          setPhonemes(phonemeResult.data);
          setPhonemeToAdd(phonemeResult.data[0]?.id ?? "");
        }
      } catch (error) {
        if (!cancelled) {
          showMessage(
            error instanceof Error
              ? error.message
              : "Unable to load database content",
            "error",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    retrieveData();

    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setEditingWordId(null);
    setEnglish("");
    setPhonetic("");
    setHint("");
    setSelectedPhonemeIds([]);
    setPhonemeToAdd(phonemes[0]?.id ?? "");
  };

  const selectWordForEditing = (word: WordRecord) => {
    setEditingWordId(word.id);
    setEnglish(word.english);
    setPhonetic(word.phonetic);
    setHint(word.hint ?? "");
    setSelectedPhonemeIds(orderedPhonemes(word).map((item) => item.phonemeId));
    showMessage(`Editing “${word.english}”.`, "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addSelectedPhoneme = () => {
    if (!phonemeToAdd) {
      showMessage("Select a phoneme before adding it.", "error");
      return;
    }

    setSelectedPhonemeIds((current) => [...current, phonemeToAdd]);
    setMessage("");
  };

  const removePhonemeAt = (indexToRemove: number) => {
    setSelectedPhonemeIds((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  const saveWord = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!english.trim() || !phonetic.trim()) {
      showMessage(
        "English spelling and phonetic transcription are required.",
        "error",
      );
      return;
    }

    if (selectedPhonemeIds.length === 0) {
      showMessage("Add at least one phoneme to the word.", "error");
      return;
    }

    setIsSaving(true);
    setMessage("");

    const editing = editingWordId !== null;
    const endpoint = editing ? `/api/words/${editingWordId}` : "/api/words";

    try {
      const response = await fetch(endpoint, {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          english: english.trim(),
          phonetic: phonetic.trim(),
          hint: hint.trim() || null,
          phonemeIds: selectedPhonemeIds,
        }),
      });

      const result = (await response.json()) as ApiError & {
        data?: WordRecord;
      };

      if (!response.ok || !result.data) {
        throw new Error(
          formatApiError(
            result,
            editing ? "Unable to update word" : "Unable to create word",
          ),
        );
      }

      await retrieveWords();
      resetForm();
      showMessage(
        editing
          ? `Updated “${result.data.english}” successfully.`
          : `Created “${result.data.english}” successfully.`,
        "success",
      );
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Unable to save word",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteWord = async (word: WordRecord) => {
    const confirmed = window.confirm(
      `Delete “${word.english}”? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/words/${word.id}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as ApiError;

      if (!response.ok) {
        throw new Error(formatApiError(result, "Unable to delete word"));
      }

      if (editingWordId === word.id) {
        resetForm();
      }

      await retrieveWords();
      showMessage(`Deleted “${word.english}” successfully.`, "success");
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Unable to delete word",
        "error",
      );
    }
  };

  const selectedPhonemes = selectedPhonemeIds.map((id) =>
    phonemes.find((phoneme) => phoneme.id === id),
  );

  return (
    <div className="word-management-layout">
      <section className="management-card" aria-labelledby="word-form-heading">
        <p className="eyebrow">
          {editingWordId ? "Update database word" : "Create database word"}
        </p>
        <h2 id="word-form-heading">
          {editingWordId ? "Edit word" : "Add a new word"}
        </h2>

        <form className="management-form" onSubmit={saveWord}>
          <div className="form-field">
            <label htmlFor="managed-english">English spelling</label>
            <input
              id="managed-english"
              value={english}
              maxLength={100}
              placeholder="Example: ship"
              onChange={(event) => setEnglish(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="managed-phonetic">Phonetic transcription</label>
            <input
              id="managed-phonetic"
              value={phonetic}
              maxLength={100}
              placeholder="Example: /ʃɪp/"
              onChange={(event) => setPhonetic(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="managed-hint">Teaching hint (optional)</label>
            <input
              id="managed-hint"
              value={hint}
              maxLength={255}
              placeholder="Example: A boat that travels on water"
              onChange={(event) => setHint(event.target.value)}
            />
          </div>

          <fieldset className="phoneme-sequence-field">
            <legend>Ordered phoneme sequence</legend>
            <p>
              Add phonemes in pronunciation order. Multi-character phonemes such
              as /tʃ/ remain one item.
            </p>

            <div className="phoneme-add-control">
              <select
                aria-label="Phoneme to add"
                value={phonemeToAdd}
                onChange={(event) => setPhonemeToAdd(event.target.value)}
              >
                {phonemes.map((phoneme) => (
                  <option key={phoneme.id} value={phoneme.id}>
                    {displaySymbol(phoneme.symbol)} — {phoneme.letters} as in{" "}
                    {phoneme.example}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="button button-secondary"
                disabled={!phonemeToAdd}
                onClick={addSelectedPhoneme}
              >
                Add phoneme
              </button>
            </div>

            <div className="selected-phoneme-preview" aria-live="polite">
              <strong>Sequence:</strong>
              <span>
                {selectedPhonemes.length > 0
                  ? selectedPhonemes
                      .map((phoneme) =>
                        phoneme
                          ? phoneme.symbol.replace(/^\/+|\/+$/g, "")
                          : "?",
                      )
                      .join("")
                  : "No phonemes selected"}
              </span>
            </div>

            {selectedPhonemes.length > 0 && (
              <ol className="selected-phoneme-list">
                {selectedPhonemes.map((phoneme, index) => (
                  <li key={`${phoneme?.id ?? "missing"}-${index}`}>
                    <span>
                      {index + 1}.{" "}
                      {phoneme ? displaySymbol(phoneme.symbol) : "?"}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove phoneme at position ${index + 1}`}
                      onClick={() => removePhonemeAt(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </fieldset>

          {message && (
            <p
              className={`management-message ${messageType}`}
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          )}

          <div className="management-form-actions">
            <button
              type="submit"
              className="button button-primary"
              disabled={isSaving || isLoading}
            >
              {isSaving
                ? "Saving..."
                : editingWordId
                  ? "Update word"
                  : "Save new word"}
            </button>

            {editingWordId && (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  resetForm();
                  setMessage("");
                }}
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>
      </section>

      <section
        className="management-card"
        aria-labelledby="saved-words-heading"
      >
        <div className="management-list-heading">
          <div>
            <p className="eyebrow">PostgreSQL records</p>
            <h2 id="saved-words-heading">Saved words</h2>
          </div>
          <span>{words.length} words</span>
        </div>

        {isLoading ? (
          <p className="management-empty">Loading database words...</p>
        ) : words.length === 0 ? (
          <p className="management-empty">No words have been stored yet.</p>
        ) : (
          <ul className="managed-word-list">
            {words.map((word) => (
              <li key={word.id}>
                <div className="managed-word-content">
                  <strong>{word.english}</strong>
                  <span>{word.phonetic}</span>
                  <small>
                    {orderedPhonemes(word)
                      .map((item) => displaySymbol(item.phoneme.symbol))
                      .join(" ")}
                  </small>
                  {word.hint && <p>{word.hint}</p>}
                </div>

                <div className="managed-word-actions">
                  <button
                    type="button"
                    className="small-button"
                    onClick={() => selectWordForEditing(word)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="small-button danger-button"
                    onClick={() => deleteWord(word)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
