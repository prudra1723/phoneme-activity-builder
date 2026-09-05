import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const listInclude = {
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
  activities: {
    orderBy: { createdAt: "desc" as const },
  },
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const wordList = await prisma.wordList.findUnique({
      where: { id },
      include: listInclude,
    });

    if (!wordList) {
      return NextResponse.json(
        { error: "Word list not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: wordList });
  } catch (error) {
    console.error("Failed to retrieve word list:", error);

    return NextResponse.json(
      { error: "Unable to retrieve word list" },
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

    if (
      !("name" in input) &&
      !("description" in input) &&
      !("wordIds" in input)
    ) {
      return NextResponse.json(
        { error: "Provide at least one field to update" },
        { status: 400 },
      );
    }

    const errors: string[] = [];

    if (
      "name" in input &&
      (typeof input.name !== "string" ||
        input.name.trim().length === 0 ||
        input.name.trim().length > 100)
    ) {
      errors.push("name must contain between 1 and 100 characters");
    }

    if (
      "description" in input &&
      input.description !== null &&
      typeof input.description !== "string"
    ) {
      errors.push("description must be a string or null");
    } else if (
      typeof input.description === "string" &&
      input.description.trim().length > 500
    ) {
      errors.push("description must contain no more than 500 characters");
    }

    if (
      "wordIds" in input &&
      (!Array.isArray(input.wordIds) ||
        input.wordIds.length === 0 ||
        !input.wordIds.every(
          (id) => typeof id === "string" && id.trim().length > 0,
        ))
    ) {
      errors.push("wordIds must be a non-empty array of word IDs");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const wordIds = Array.isArray(input.wordIds)
      ? (input.wordIds as string[]).map((id) => id.trim())
      : undefined;

    if (wordIds && new Set(wordIds).size !== wordIds.length) {
      return NextResponse.json(
        { error: "A word cannot appear twice in the same list" },
        { status: 400 },
      );
    }

    if (wordIds) {
      const existingWords = await prisma.word.findMany({
        where: { id: { in: wordIds } },
        select: { id: true },
      });

      const existingIds = new Set(existingWords.map((word) => word.id));
      const missingIds = wordIds.filter((wordId) => !existingIds.has(wordId));

      if (missingIds.length > 0) {
        return NextResponse.json(
          { error: "One or more words do not exist", missingIds },
          { status: 400 },
        );
      }
    }

    const wordList = await prisma.wordList.update({
      where: { id },
      data: {
        ...(typeof input.name === "string" && {
          name: input.name.trim(),
        }),
        ...("description" in input && {
          description:
            typeof input.description === "string"
              ? input.description.trim() || null
              : null,
        }),
        ...(wordIds && {
          words: {
            deleteMany: {},
            create: wordIds.map((wordId, position) => ({
              wordId,
              position,
            })),
          },
        }),
      },
      include: listInclude,
    });

    return NextResponse.json({ data: wordList });
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
          { error: "A word list with this name already exists" },
          { status: 409 },
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Word list not found" },
          { status: 404 },
        );
      }
    }

    console.error("Failed to update word list:", error);

    return NextResponse.json(
      { error: "Unable to update word list" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const activityCount = await prisma.activity.count({
      where: { wordListId: id },
    });

    if (activityCount > 0) {
      return NextResponse.json(
        {
          error:
            "This word list is used by saved activities and cannot be deleted",
        },
        { status: 409 },
      );
    }

    await prisma.wordList.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Word list deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Word list not found" },
        { status: 404 },
      );
    }

    console.error("Failed to delete word list:", error);

    return NextResponse.json(
      { error: "Unable to delete word list" },
      { status: 500 },
    );
  }
}
