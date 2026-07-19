"use client";

import { useState } from "react";
import PhonemeButton from "@/components/PhonemeButton";
import WordlePreview from "@/components/WordlePreview";
import { DEFAULT_WORDLE_WORD, PHONEMES, getPhonemeHint } from "@/lib/phonemes";
import { downloadHtml, generateWordleHtml } from "@/lib/generateWordleHtml";

export default function WordleBuilder() {
  const [title, setTitle] = useState("Phoneme Wordle");
  const [answer, setAnswer] = useState<string[]>(DEFAULT_WORDLE_WORD.tokens);
  const [english, setEnglish] = useState(DEFAULT_WORDLE_WORD.english);
  const [maxGuesses, setMaxGuesses] = useState(5);
  const [showHints, setShowHints] = useState(true);

  const generate = () => {
    if (!answer.length || !english.trim()) return;
    downloadHtml(
      generateWordleHtml({
        title: title.trim() || "Phoneme Wordle",
        answer,
        english: english.trim(),
        maxGuesses,
        showHints,
        hints: answer.map(getPhonemeHint),
      }),
      "phoneme-wordle.html",
    );
  };

  return (
    <div className="builder-workspace">
      <section
        className="builder-panel"
        aria-labelledby="wordle-settings-title"
      >
        <p className="eyebrow">Activity settings</p>
        <h2 id="wordle-settings-title">Configure Wordle</h2>
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
          <label htmlFor="guess-count">Number of guesses</label>
          <select
            id="guess-count"
            value={maxGuesses}
            onChange={(event) => setMaxGuesses(Number(event.target.value))}
          >
            {[3, 4, 5, 6].map((count) => (
              <option key={count}>{count}</option>
            ))}
          </select>
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
          disabled={!answer.length || !english.trim()}
          onClick={generate}
        >
          Download playable HTML
        </button>
      </section>
      <section className="preview-panel">
        <WordlePreview
          key={`${answer.join("")}-${maxGuesses}`}
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
