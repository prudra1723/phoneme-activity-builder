import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const wordInclude = {
  phonemes: {
    include: {
      phoneme: true,
    },
    orderBy: {
      position: "asc" as const,
    },
  },
  wordLists: {
    include: {
      wordList: true,
    },
  },
};

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const word = await prisma.word.findUnique({
      where: { id },
      include: wordInclude,
    });

    if (!word) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: word }, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve word:", error);

    return NextResponse.json(
      { error: "Unable to retrieve word" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const errors: string[] = [];

    if (
      !("english" in input) &&
      !("phonetic" in input) &&
      !("hint" in input) &&
      !("phonemeIds" in input)
    ) {
      return NextResponse.json(
        { error: "Provide at least one field to update" },
        { status: 400 },
      );
    }

    if (
      "english" in input &&
      (typeof input.english !== "string" || !input.english.trim())
    ) {
      errors.push("english must be a non-empty string");
    } else if (
      typeof input.english === "string" &&
      input.english.trim().length > 100
    ) {
      errors.push("english must contain no more than 100 characters");
    }

    if (
      "phonetic" in input &&
      (typeof input.phonetic !== "string" || !input.phonetic.trim())
    ) {
      errors.push("phonetic must be a non-empty string");
    } else if (
      typeof input.phonetic === "string" &&
      input.phonetic.trim().length > 100
    ) {
      errors.push("phonetic must contain no more than 100 characters");
    }

    if (
      "hint" in input &&
      input.hint !== null &&
      typeof input.hint !== "string"
    ) {
      errors.push("hint must be a string or null");
    } else if (
      typeof input.hint === "string" &&
      input.hint.trim().length > 255
    ) {
      errors.push("hint must contain no more than 255 characters");
    }

    if (
      "phonemeIds" in input &&
      (!Array.isArray(input.phonemeIds) ||
        input.phonemeIds.length === 0 ||
        !input.phonemeIds.every(
          (value) =>
            typeof value === "string" && value.trim().length > 0,
        ))
    ) {
      errors.push("phonemeIds must be a non-empty array of phoneme IDs");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const phonemeIds = Array.isArray(input.phonemeIds)
      ? (input.phonemeIds as string[])
      : undefined;

    if (phonemeIds) {
      const uniqueIds = [...new Set(phonemeIds)];

      const phonemeCount = await prisma.phoneme.count({
        where: {
          id: {
            in: uniqueIds,
          },
        },
      });

      if (phonemeCount !== uniqueIds.length) {
        return NextResponse.json(
          { error: "One or more phoneme IDs do not exist" },
          { status: 400 },
        );
      }
    }

    const word = await prisma.word.update({
      where: { id },
      data: {
        ...(typeof input.english === "string" && {
          english: input.english.trim(),
        }),
        ...(typeof input.phonetic === "string" && {
          phonetic: input.phonetic.trim(),
        }),
        ...("hint" in input && {
          hint:
            typeof input.hint === "string"
              ? input.hint.trim() || null
              : null,
        }),
        ...(phonemeIds && {
          phonemes: {
            deleteMany: {},
            create: phonemeIds.map((phonemeId, position) => ({
              phonemeId,
              position,
            })),
          },
        }),
      },
      include: wordInclude,
    });

    return NextResponse.json({ data: word }, { status: 200 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body contains invalid JSON" },
        { status: 400 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A word with this English spelling already exists" },
          { status: 409 },
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Word not found" },
          { status: 404 },
        );
      }
    }

    console.error("Failed to update word:", error);

    return NextResponse.json(
      { error: "Unable to update word" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    await prisma.word.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Word deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 },
      );
    }

    console.error("Failed to delete word:", error);

    return NextResponse.json(
      { error: "Unable to delete word" },
      { status: 500 },
    );
  }
}
