import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const phonemeData = [
  { symbol: "θ", letters: "TH", example: "thin" },
  { symbol: "ʃ", letters: "SH", example: "ship" },
  { symbol: "tʃ", letters: "CH", example: "chip" },
  { symbol: "ɪ", letters: "I", example: "sit" },
  { symbol: "ɛ", letters: "E", example: "bed" },
  { symbol: "æ", letters: "A", example: "cat" },
  { symbol: "ɒ", letters: "O", example: "dog" },
  { symbol: "ə", letters: "A", example: "about" },
  { symbol: "k", letters: "K/C", example: "cat" },
  { symbol: "d", letters: "D", example: "dog" },
  { symbol: "g", letters: "G", example: "go" },
  { symbol: "f", letters: "F", example: "fish" },
  { symbol: "n", letters: "N", example: "net" },
  { symbol: "p", letters: "P", example: "pen" },
  { symbol: "t", letters: "T", example: "cat" },
];

const wordData = [
  {
    english: "pen",
    phonetic: "/pɛn/",
    hint: "A tool used to write with ink",
    tokens: ["p", "ɛ", "n"],
  },
  {
    english: "cat",
    phonetic: "/kæt/",
    hint: "A small domesticated animal",
    tokens: ["k", "æ", "t"],
  },
  {
    english: "dog",
    phonetic: "/dɒg/",
    hint: "A common household pet",
    tokens: ["d", "ɒ", "g"],
  },
  {
    english: "fish",
    phonetic: "/fɪʃ/",
    hint: "An animal that swims",
    tokens: ["f", "ɪ", "ʃ"],
  },
  {
    english: "thin",
    phonetic: "/θɪn/",
    hint: "Not thick",
    tokens: ["θ", "ɪ", "n"],
  },
  {
    english: "ship",
    phonetic: "/ʃɪp/",
    hint: "A large vessel that travels on water",
    tokens: ["ʃ", "ɪ", "p"],
  },
  {
    english: "chip",
    phonetic: "/tʃɪp/",
    hint: "A small thin piece",
    tokens: ["tʃ", "ɪ", "p"],
  },
];

async function seedPhonemes() {
  const phonemeIds = new Map<string, string>();

  for (const item of phonemeData) {
    const barePhoneme = await prisma.phoneme.findUnique({
      where: { symbol: item.symbol },
    });

    const wrappedPhoneme =
      barePhoneme ??
      (await prisma.phoneme.findUnique({
        where: { symbol: `/${item.symbol}/` },
      }));

    const phoneme = wrappedPhoneme
      ? await prisma.phoneme.update({
          where: { id: wrappedPhoneme.id },
          data: {
            symbol: item.symbol,
            letters: item.letters,
            example: item.example,
          },
        })
      : await prisma.phoneme.create({
          data: item,
        });

    phonemeIds.set(item.symbol, phoneme.id);
  }

  return phonemeIds;
}

async function seedWords(phonemeIds: Map<string, string>) {
  const wordIds = new Map<string, string>();

  for (const item of wordData) {
    const phonemeLinks = item.tokens.map((symbol, position) => {
      const phonemeId = phonemeIds.get(symbol);

      if (!phonemeId) {
        throw new Error(`Missing phoneme ID for ${symbol}`);
      }

      return {
        phonemeId,
        position,
      };
    });

    const word = await prisma.word.upsert({
      where: { english: item.english },
      update: {
        phonetic: item.phonetic,
        hint: item.hint,
        phonemes: {
          deleteMany: {},
          create: phonemeLinks,
        },
      },
      create: {
        english: item.english,
        phonetic: item.phonetic,
        hint: item.hint,
        phonemes: {
          create: phonemeLinks,
        },
      },
    });

    wordIds.set(item.english, word.id);
  }

  return wordIds;
}

async function upsertWordList(
  name: string,
  description: string,
  englishWords: string[],
  wordIds: Map<string, string>,
) {
  const links = englishWords.map((english, position) => {
    const wordId = wordIds.get(english);

    if (!wordId) {
      throw new Error(`Missing word ID for ${english}`);
    }

    return {
      wordId,
      position,
    };
  });

  return prisma.wordList.upsert({
    where: { name },
    update: {
      description,
      words: {
        deleteMany: {},
        create: links,
      },
    },
    create: {
      name,
      description,
      words: {
        create: links,
      },
    },
  });
}

async function seedActivities(
  wordIds: Map<string, string>,
  wordleListId: string,
  wordSearchListId: string,
) {
  const thinId = wordIds.get("thin");

  if (!thinId) {
    throw new Error("Missing seeded word: thin");
  }

  const existingWordle = await prisma.activity.findFirst({
    where: {
      title: "Core Phoneme Wordle",
      type: "WORDLE",
    },
  });

  const wordleData = {
    title: "Core Phoneme Wordle",
    type: "WORDLE" as const,
    difficulty: "EASY" as const,
    showHints: true,
    maxGuesses: 5,
    gridSize: null,
    outputFilename: "core-phoneme-wordle.html",
    includeAnswers: false,
    wordListId: wordleListId,
    answerWordId: thinId,
    metadata: {
      audience: "Speech Pathology students",
      source: "Assessment 2 seed data",
    },
  };

  if (existingWordle) {
    await prisma.activity.update({
      where: { id: existingWordle.id },
      data: wordleData,
    });
  } else {
    await prisma.activity.create({
      data: wordleData,
    });
  }

  const existingWordSearch = await prisma.activity.findFirst({
    where: {
      title: "Core Phoneme Word Search",
      type: "WORD_SEARCH",
    },
  });

  const wordSearchData = {
    title: "Core Phoneme Word Search",
    type: "WORD_SEARCH" as const,
    difficulty: "MEDIUM" as const,
    showHints: true,
    maxGuesses: null,
    gridSize: 8,
    outputFilename: "core-phoneme-word-search.html",
    includeAnswers: true,
    wordListId: wordSearchListId,
    answerWordId: null,
    metadata: {
      audience: "Speech Pathology students",
      source: "Assessment 2 seed data",
    },
  };

  if (existingWordSearch) {
    await prisma.activity.update({
      where: { id: existingWordSearch.id },
      data: wordSearchData,
    });
  } else {
    await prisma.activity.create({
      data: wordSearchData,
    });
  }
}

async function main() {
  const phonemeIds = await seedPhonemes();
  const wordIds = await seedWords(phonemeIds);

  const wordleList = await upsertWordList(
    "Core Wordle Words",
    "Reusable words for phoneme Wordle activities",
    ["thin", "chip", "pen"],
    wordIds,
  );

  const wordSearchList = await upsertWordList(
    "Core Word Search Words",
    "Five target words for phoneme Word Search activities",
    ["cat", "dog", "fish", "thin", "ship"],
    wordIds,
  );

  await seedActivities(wordIds, wordleList.id, wordSearchList.id);

  console.log("Database seed completed successfully.");
  console.log(`Phonemes: ${phonemeIds.size}`);
  console.log(`Words: ${wordIds.size}`);
  console.log("Word lists: 2");
  console.log("Activities: 2");
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
