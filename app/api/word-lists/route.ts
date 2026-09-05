import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

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
};

export async function GET() {
  try {
    const lists = await prisma.wordList.findMany({
      include: listInclude,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: lists });
  } catch (error) {
    console.error("Failed to retrieve word lists:", error);

    return NextResponse.json(
      { error: "Unable to retrieve word lists" },
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
    const name = typeof input.name === "string" ? input.name.trim() : "";

    if (!name || name.length > 100) {
      return NextResponse.json(
        { error: "name must contain between 1 and 100 characters" },
        { status: 400 },
      );
    }

    if (
      input.description !== undefined &&
      input.description !== null &&
      typeof input.description !== "string"
    ) {
      return NextResponse.json(
        { error: "description must be a string or null" },
        { status: 400 },
      );
    }

    const description =
      typeof input.description === "string" ? input.description.trim() : null;

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "description must contain no more than 500 characters" },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(input.wordIds) ||
      input.wordIds.length === 0 ||
      !input.wordIds.every(
        (id) => typeof id === "string" && id.trim().length > 0,
      )
    ) {
      return NextResponse.json(
        { error: "wordIds must be a non-empty array of word IDs" },
        { status: 400 },
      );
    }

    const wordIds = (input.wordIds as string[]).map((id) => id.trim());

    if (new Set(wordIds).size !== wordIds.length) {
      return NextResponse.json(
        { error: "A word cannot appear twice in the same list" },
        { status: 400 },
      );
    }

    const existingWords = await prisma.word.findMany({
      where: { id: { in: wordIds } },
      select: { id: true },
    });

    const existingIds = new Set(existingWords.map((word) => word.id));
    const missingIds = wordIds.filter((id) => !existingIds.has(id));

    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: "One or more words do not exist", missingIds },
        { status: 400 },
      );
    }

    const list = await prisma.wordList.create({
      data: {
        name,
        description: description || null,
        words: {
          create: wordIds.map((wordId, position) => ({
            wordId,
            position,
          })),
        },
      },
      include: listInclude,
    });

    return NextResponse.json({ data: list }, { status: 201 });
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

      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "A selected word no longer exists; refresh and retry" },
          { status: 400 },
        );
      }
    }

    console.error("Failed to create word list:", error);

    return NextResponse.json(
      { error: "Unable to create word list" },
      { status: 500 },
    );
  }
}
