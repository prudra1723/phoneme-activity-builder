import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const ACTIVITY_TYPES = ["WORDLE", "WORD_SEARCH"] as const;
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

const activityInclude = {
  wordList: {
    include: {
      words: {
        orderBy: { position: "asc" as const },
        include: {
          word: {
            include: {
              phonemes: {
                orderBy: { position: "asc" as const },
                include: { phoneme: true },
              },
            },
          },
        },
      },
    },
  },
  answerWord: {
    include: {
      phonemes: {
        orderBy: { position: "asc" as const },
        include: { phoneme: true },
      },
    },
  },
};

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: activityInclude,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ data: activities });
  } catch (error) {
    console.error("Failed to retrieve activities:", error);

    return NextResponse.json(
      { error: "Unable to retrieve activities" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const errors: string[] = [];

    const title = typeof input.title === "string" ? input.title.trim() : "";

    const type = typeof input.type === "string" ? input.type : "";

    const difficulty =
      typeof input.difficulty === "string" ? input.difficulty : "EASY";

    const wordListId =
      typeof input.wordListId === "string" ? input.wordListId.trim() : "";

    if (!title || title.length > 150) {
      errors.push("title must contain between 1 and 150 characters");
    }

    if (!ACTIVITY_TYPES.includes(type as (typeof ACTIVITY_TYPES)[number])) {
      errors.push("type must be WORDLE or WORD_SEARCH");
    }

    if (!DIFFICULTIES.includes(difficulty as (typeof DIFFICULTIES)[number])) {
      errors.push("difficulty must be EASY, MEDIUM or HARD");
    }

    if (!wordListId) {
      errors.push("wordListId is required");
    }

    if (input.showHints !== undefined && typeof input.showHints !== "boolean") {
      errors.push("showHints must be true or false");
    }

    if (
      input.includeAnswers !== undefined &&
      typeof input.includeAnswers !== "boolean"
    ) {
      errors.push("includeAnswers must be true or false");
    }

    if (
      input.outputFilename !== undefined &&
      input.outputFilename !== null &&
      (typeof input.outputFilename !== "string" ||
        !input.outputFilename.trim() ||
        input.outputFilename.trim().length > 150)
    ) {
      errors.push("outputFilename must contain between 1 and 150 characters");
    }

    if (
      input.metadata !== undefined &&
      input.metadata !== null &&
      (typeof input.metadata !== "object" || Array.isArray(input.metadata))
    ) {
      errors.push("metadata must be a JSON object or null");
    }

    if (type === "WORDLE") {
      if (
        typeof input.answerWordId !== "string" ||
        !input.answerWordId.trim()
      ) {
        errors.push("answerWordId is required for WORDLE");
      }

      if (
        !Number.isInteger(input.maxGuesses) ||
        (input.maxGuesses as number) < 3 ||
        (input.maxGuesses as number) > 10
      ) {
        errors.push(
          "maxGuesses must be an integer between 3 and 10 for WORDLE",
        );
      }
    }

    if (type === "WORD_SEARCH") {
      if (
        !Number.isInteger(input.gridSize) ||
        (input.gridSize as number) < 5 ||
        (input.gridSize as number) > 20
      ) {
        errors.push(
          "gridSize must be an integer between 5 and 20 for WORD_SEARCH",
        );
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const wordList = await prisma.wordList.findUnique({
      where: { id: wordListId },
      include: {
        words: {
          select: { wordId: true },
        },
      },
    });

    if (!wordList) {
      return NextResponse.json(
        { error: "Word list not found" },
        { status: 404 },
      );
    }

    const answerWordId =
      type === "WORDLE" && typeof input.answerWordId === "string"
        ? input.answerWordId.trim()
        : null;

    if (
      answerWordId &&
      !wordList.words.some((item) => item.wordId === answerWordId)
    ) {
      return NextResponse.json(
        { error: "The Wordle answer must belong to the selected word list" },
        { status: 400 },
      );
    }

    const activity = await prisma.activity.create({
      data: {
        title,
        type: type as "WORDLE" | "WORD_SEARCH",
        difficulty: difficulty as "EASY" | "MEDIUM" | "HARD",
        showHints:
          typeof input.showHints === "boolean" ? input.showHints : true,
        includeAnswers:
          typeof input.includeAnswers === "boolean"
            ? input.includeAnswers
            : false,
        outputFilename:
          typeof input.outputFilename === "string"
            ? input.outputFilename.trim()
            : null,
        maxGuesses: type === "WORDLE" ? (input.maxGuesses as number) : null,
        gridSize: type === "WORD_SEARCH" ? (input.gridSize as number) : null,
        answerWordId,
        wordListId,
        metadata:
          input.metadata &&
          typeof input.metadata === "object" &&
          !Array.isArray(input.metadata)
            ? (input.metadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,
      },
      include: activityInclude,
    });

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body contains invalid JSON" },
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "A selected word or word list no longer exists" },
        { status: 400 },
      );
    }

    console.error("Failed to create activity:", error);

    return NextResponse.json(
      { error: "Unable to create activity" },
      { status: 500 },
    );
  }
}
