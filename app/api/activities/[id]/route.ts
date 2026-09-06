import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: activityInclude,
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: activity });
  } catch (error) {
    console.error("Failed to retrieve activity:", error);

    return NextResponse.json(
      { error: "Unable to retrieve activity" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = [
      "title",
      "type",
      "difficulty",
      "showHints",
      "maxGuesses",
      "gridSize",
      "outputFilename",
      "includeAnswers",
      "metadata",
      "wordListId",
      "answerWordId",
    ];

    if (!allowedFields.some((field) => field in input)) {
      return NextResponse.json(
        { error: "Provide at least one field to update" },
        { status: 400 },
      );
    }

    const current = await prisma.activity.findUnique({
      where: { id },
    });

    if (!current) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 },
      );
    }

    const title =
      typeof input.title === "string" ? input.title.trim() : current.title;

    const type = typeof input.type === "string" ? input.type : current.type;

    const difficulty =
      typeof input.difficulty === "string"
        ? input.difficulty
        : current.difficulty;

    const wordListId =
      typeof input.wordListId === "string"
        ? input.wordListId.trim()
        : current.wordListId;

    const answerWordId =
      input.answerWordId === null
        ? null
        : typeof input.answerWordId === "string"
          ? input.answerWordId.trim()
          : current.answerWordId;

    const maxGuesses =
      input.maxGuesses === null
        ? null
        : typeof input.maxGuesses === "number"
          ? input.maxGuesses
          : current.maxGuesses;

    const gridSize =
      input.gridSize === null
        ? null
        : typeof input.gridSize === "number"
          ? input.gridSize
          : current.gridSize;

    const errors: string[] = [];

    if (!title || title.length > 150) {
      errors.push("title must contain between 1 and 150 characters");
    }

    if (type !== "WORDLE" && type !== "WORD_SEARCH") {
      errors.push("type must be WORDLE or WORD_SEARCH");
    }

    if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      errors.push("difficulty must be EASY, MEDIUM or HARD");
    }

    if (!wordListId) {
      errors.push("wordListId is required");
    }

    if ("showHints" in input && typeof input.showHints !== "boolean") {
      errors.push("showHints must be true or false");
    }

    if (
      "includeAnswers" in input &&
      typeof input.includeAnswers !== "boolean"
    ) {
      errors.push("includeAnswers must be true or false");
    }

    if (
      "outputFilename" in input &&
      input.outputFilename !== null &&
      (typeof input.outputFilename !== "string" ||
        !input.outputFilename.trim() ||
        input.outputFilename.trim().length > 150)
    ) {
      errors.push("outputFilename must contain between 1 and 150 characters");
    }

    if (
      "metadata" in input &&
      input.metadata !== null &&
      (typeof input.metadata !== "object" || Array.isArray(input.metadata))
    ) {
      errors.push("metadata must be a JSON object or null");
    }

    if (type === "WORDLE") {
      if (!answerWordId) {
        errors.push("answerWordId is required for WORDLE");
      }

      if (
        !Number.isInteger(maxGuesses) ||
        (maxGuesses as number) < 3 ||
        (maxGuesses as number) > 10
      ) {
        errors.push(
          "maxGuesses must be an integer between 3 and 10 for WORDLE",
        );
      }
    }

    if (
      type === "WORD_SEARCH" &&
      (!Number.isInteger(gridSize) ||
        (gridSize as number) < 5 ||
        (gridSize as number) > 20)
    ) {
      errors.push(
        "gridSize must be an integer between 5 and 20 for WORD_SEARCH",
      );
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

    if (
      type === "WORDLE" &&
      answerWordId &&
      !wordList.words.some((item) => item.wordId === answerWordId)
    ) {
      return NextResponse.json(
        { error: "The Wordle answer must belong to the selected word list" },
        { status: 400 },
      );
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        title,
        type: type as "WORDLE" | "WORD_SEARCH",
        difficulty: difficulty as "EASY" | "MEDIUM" | "HARD",
        wordListId,
        showHints:
          typeof input.showHints === "boolean"
            ? input.showHints
            : current.showHints,
        includeAnswers:
          typeof input.includeAnswers === "boolean"
            ? input.includeAnswers
            : current.includeAnswers,
        outputFilename:
          "outputFilename" in input
            ? typeof input.outputFilename === "string"
              ? input.outputFilename.trim()
              : null
            : current.outputFilename,
        maxGuesses: type === "WORDLE" ? maxGuesses : null,
        gridSize: type === "WORD_SEARCH" ? gridSize : null,
        answerWordId: type === "WORDLE" ? answerWordId : null,
        ...("metadata" in input && {
          metadata:
            input.metadata &&
            typeof input.metadata === "object" &&
            !Array.isArray(input.metadata)
              ? (input.metadata as Prisma.InputJsonValue)
              : Prisma.JsonNull,
        }),
      },
      include: activityInclude,
    });

    return NextResponse.json({ data: activity });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body contains invalid JSON" },
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 },
      );
    }

    console.error("Failed to update activity:", error);

    return NextResponse.json(
      { error: "Unable to update activity" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.activity.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Activity deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 },
      );
    }

    console.error("Failed to delete activity:", error);

    return NextResponse.json(
      { error: "Unable to delete activity" },
      { status: 500 },
    );
  }
}
