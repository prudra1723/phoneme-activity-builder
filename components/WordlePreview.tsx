"use client";

import { useState } from "react";

import PhonemeButton from "@/components/PhonemeButton";
import { PHONEMES, getPhonemeHint } from "@/lib/phonemes";

type WordlePreviewProps = {
  title: string;
  answer: string[];
  english: string;
  maxGuesses: number;
  showHints: boolean;
};

type TileMark = "correct" | "present" | "absent";

function scoreGuess(guess: string[], answer: string[]): TileMark[] {
  const marks: TileMark[] = Array(answer.length).fill("absent");
  const remainingAnswer = [...answer];

  guess.forEach((symbol, index) => {
    if (symbol === answer[index]) {
      marks[index] = "correct";
      remainingAnswer[index] = "";
    }
  });

  guess.forEach((symbol, index) => {
    if (marks[index] === "correct") {
      return;
    }

    const matchingIndex = remainingAnswer.indexOf(symbol);

    if (matchingIndex >= 0) {
      marks[index] = "present";
      remainingAnswer[matchingIndex] = "";
    }
  });

  return marks;
}

function guessesMatch(guess: string[], answer: string[]) {
  return guess.join("|") === answer.join("|");
}

export default function WordlePreview({
  title,
  answer,
  english,
  maxGuesses,
  showHints,
}: WordlePreviewProps) {
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);

  const [submittedGuesses, setSubmittedGuesses] = useState<string[][]>([]);

  const [message, setMessage] = useState(
    "Build a guess using the phoneme keyboard.",
  );

  const hasWon = submittedGuesses.some((guess) => guessesMatch(guess, answer));

  const gameFinished = hasWon || submittedGuesses.length >= maxGuesses;

  const addPhoneme = (symbol: string) => {
    if (currentGuess.length >= answer.length || gameFinished) {
      return;
    }

    setCurrentGuess((previousGuess) => [...previousGuess, symbol]);
  };

  const removeLastPhoneme = () => {
    setCurrentGuess((previousGuess) => previousGuess.slice(0, -1));
  };

  const submitGuess = () => {
    if (gameFinished) {
      return;
    }

    if (currentGuess.length !== answer.length) {
      setMessage(`Choose exactly ${answer.length} phonemes.`);

      return;
    }

    const correct = guessesMatch(currentGuess, answer);

    setSubmittedGuesses((previousGuesses) => [
      ...previousGuesses,
      [...currentGuess],
    ]);

    setCurrentGuess([]);

    if (correct) {
      setMessage(`Correct! /${answer.join("")}/ means “${english}”.`);
    } else {
      setMessage("Not quite—use the feedback and try again.");
    }
  };

  const resetGame = () => {
    setCurrentGuess([]);
    setSubmittedGuesses([]);

    setMessage("Build a guess using the phoneme keyboard.");
  };

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

      <p
        className="target-phoneme"
        aria-label={`Target phoneme word /${answer.join("")}/`}
      >
        /{answer.join("")}/
      </p>

      {showHints && (
        <p className="phoneme-hint">{answer.map(getPhonemeHint).join(" · ")}</p>
      )}

      <div className="wordle-board" aria-label="Phoneme Wordle guesses">
        {Array.from({ length: maxGuesses }, (_, rowIndex) => {
          const submittedGuess = submittedGuesses[rowIndex];

          const activeGuess =
            rowIndex === submittedGuesses.length ? currentGuess : [];

          const marks = submittedGuess
            ? scoreGuess(submittedGuess, answer)
            : [];

          return (
            <div className="wordle-row" key={rowIndex}>
              {answer.map((unusedSymbol, columnIndex) => {
                const displayedSymbol =
                  submittedGuess?.[columnIndex] ??
                  activeGuess[columnIndex] ??
                  "";

                const mark = marks[columnIndex];

                return (
                  <span
                    key={columnIndex}
                    className={`wordle-tile ${mark ?? ""}`}
                    aria-label={
                      displayedSymbol
                        ? `${displayedSymbol}, ${mark ?? "not submitted"}`
                        : "Empty tile"
                    }
                  >
                    {displayedSymbol}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      <div
        className="wordle-feedback-legend"
        aria-label="Wordle feedback explanation"
      >
        <span>
          <i className="legend-correct" aria-hidden="true" />
          Correct position
        </span>

        <span>
          <i className="legend-present" aria-hidden="true" />
          Wrong position
        </span>

        <span>
          <i className="legend-absent" aria-hidden="true" />
          Not in answer
        </span>
      </div>

      <p
        className={`game-message ${hasWon ? "success" : ""}`}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>

      {!gameFinished && (
        <>
          <div className="phoneme-keyboard" aria-label="Phoneme keyboard">
            {PHONEMES.map((phoneme) => (
              <PhonemeButton
                key={phoneme.symbol}
                symbol={phoneme.symbol}
                disabled={currentGuess.length >= answer.length}
                onClick={addPhoneme}
              />
            ))}
          </div>

          <div className="preview-actions">
            <button
              type="button"
              className="button button-secondary"
              disabled={currentGuess.length === 0}
              onClick={removeLastPhoneme}
            >
              Delete
            </button>

            <button
              type="button"
              className="button button-primary"
              onClick={submitGuess}
            >
              Enter guess
            </button>
          </div>
        </>
      )}

      {gameFinished && !hasWon && (
        <p className="answer-reveal">
          Answer: /{answer.join("")}/ — {english}
        </p>
      )}
    </div>
  );
}
