export type Phoneme = {
  symbol: string;
  letters: string;
  example: string;
};

export type PhonemeWord = {
  id: string;
  phoneme: string;
  english: string;
  tokens: string[];
  cells?: number[];
};

export const PHONEMES: Phoneme[] = [
  { symbol: "θ", letters: "TH", example: "thin" },
  { symbol: "ʃ", letters: "SH", example: "ship" },
  { symbol: "tʃ", letters: "CH", example: "chip" },
  { symbol: "ɪ", letters: "I", example: "sit" },
  { symbol: "æ", letters: "A", example: "cat" },
  { symbol: "ɒ", letters: "O", example: "dog" },
  { symbol: "ə", letters: "A", example: "about" },
  { symbol: "k", letters: "K/C", example: "cat" },
  { symbol: "d", letters: "D", example: "dog" },
  { symbol: "g", letters: "G", example: "go" },
  { symbol: "f", letters: "F", example: "fish" },
  { symbol: "n", letters: "N", example: "thin" },
  { symbol: "p", letters: "P", example: "ship" },
  { symbol: "t", letters: "T", example: "cat" },
];

export const DEFAULT_WORDLE_WORD: PhonemeWord = {
  id: "thin",
  phoneme: "/θɪn/",
  english: "thin",
  tokens: ["θ", "ɪ", "n"],
};

export const WORD_SEARCH_WORDS: PhonemeWord[] = [
  {
    id: "cat",
    phoneme: "/kæt/",
    english: "cat",
    tokens: ["k", "æ", "t"],
    cells: [0, 1, 2],
  },
  {
    id: "dog",
    phoneme: "/dɒg/",
    english: "dog",
    tokens: ["d", "ɒ", "g"],
    cells: [21, 20, 19],
  },
  {
    id: "fish",
    phoneme: "/fɪʃ/",
    english: "fish",
    tokens: ["f", "ɪ", "ʃ"],
    cells: [8, 16, 24],
  },
  {
    id: "thin",
    phoneme: "/θɪn/",
    english: "thin",
    tokens: ["θ", "ɪ", "n"],
    cells: [26, 35, 44],
  },
  {
    id: "ship",
    phoneme: "/ʃɪp/",
    english: "ship",
    tokens: ["ʃ", "ɪ", "p"],
    cells: [63, 62, 61],
  },
];

export const WORD_SEARCH_GRID = [
  "k",
  "æ",
  "t",
  "n",
  "ə",
  "ʃ",
  "p",
  "ɪ",

  "f",
  "θ",
  "g",
  "p",
  "k",
  "n",
  "æ",
  "d",

  "ɪ",
  "t",
  "ʃ",
  "g",
  "ɒ",
  "d",
  "ə",
  "k",

  "ʃ",
  "p",
  "θ",
  "æ",
  "f",
  "t",
  "n",
  "ɪ",

  "d",
  "k",
  "ə",
  "ɪ",
  "g",
  "ʃ",
  "t",
  "ɒ",

  "æ",
  "f",
  "p",
  "d",
  "n",
  "k",
  "ɪ",
  "θ",

  "t",
  "ɒ",
  "g",
  "ʃ",
  "æ",
  "ə",
  "f",
  "n",

  "n",
  "k",
  "d",
  "θ",
  "t",
  "p",
  "ɪ",
  "ʃ",
];

export function getPhoneme(symbol: string) {
  return PHONEMES.find((phoneme) => phoneme.symbol === symbol);
}

export function getPhonemeHint(symbol: string) {
  const phoneme = getPhoneme(symbol);

  if (!phoneme) {
    return `/${symbol}/`;
  }

  return `/${phoneme.symbol}/ — ${phoneme.letters} as in ${phoneme.example}`;
}
