"use client";

import { useState } from "react";
import WordSearchPreview from "@/components/WordSearchPreview";
import {
  getPhonemeHint,
  WORD_SEARCH_GRID,
  WORD_SEARCH_WORDS,
} from "@/lib/phonemes";
import {
  downloadWordSearchHtml,
  generateWordSearchHtml,
} from "@/lib/generateWordSearchHtml";

export default function WordSearchBuilder() {
  const [title, setTitle] = useState("Phoneme Word Search");
  const [showHints, setShowHints] = useState(true);
  const generate = () => {
    const hints = Object.fromEntries(
      [...new Set(WORD_SEARCH_GRID)].map((symbol) => [
        symbol,
        getPhonemeHint(symbol),
      ]),
    );
    downloadWordSearchHtml(
      generateWordSearchHtml({
        title: title.trim() || "Phoneme Word Search",
        grid: WORD_SEARCH_GRID,
        words: WORD_SEARCH_WORDS,
        showHints,
        hints,
      }),
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
          <label htmlFor="search-title">Activity title</label>
          <input
            id="search-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="fixed-word-list">
          <h3>Fixed phoneme words</h3>
          <p>Assessment 1 uses approximately five fixed words.</p>
          <ul>
            {WORD_SEARCH_WORDS.map((word) => (
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
          onClick={generate}
        >
          Download playable HTML
        </button>
      </section>
      <section className="preview-panel">
        <WordSearchPreview
          title={title || "Phoneme Word Search"}
          grid={WORD_SEARCH_GRID}
          words={WORD_SEARCH_WORDS}
          showHints={showHints}
        />
      </section>
    </div>
  );
}
