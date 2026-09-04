import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const wordInclude = {
  phonemes: {
    include: {
      phoneme: true,
    },
    orderBy: {
      position: "asc" as const,
    },
  },
};

export async function GET() {
  try {
    const words = await prisma.word.findMany({
      include: wordInclude,
      orderBy: {
        english: "asc",
      },
    });

    return NextResponse.json({ data: words }, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve words:", error);

    return NextResponse.json(
      { error: "Unable to retrieve words" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const english =
      typeof input.english === "string" ? input.english.trim() : "";

    const phonetic =
      typeof input.phonetic === "string" ? input.phonetic.trim() : "";

    const hint =
      typeof input.hint === "string" ? input.hint.trim() : null;

    const phonemeIds = input.phonemeIds;
    const errors: string[] = [];

    if (!english) errors.push("english is required");
    if (!phonetic) errors.push("phonetic is required");

    if (english.length > 100) {
      errors.push("english must contain no more than 100 characters");
    }

    if (phonetic.length > 100) {
      errors.push("phonetic must contain no more than 100 characters");
    }

    if (hint !== null && hint.length > 255) {
      errors.push("hint must contain no more than 255 characters");
    }

    if (
      !Array.isArray(phonemeIds) ||
      phonemeIds.length === 0 ||
      !phonemeIds.every(
        (id): id is string => typeof id === "string" && id.trim().length > 0,
      )
    ) {
      errors.push("phonemeIds must be a non-empty array of phoneme IDs");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const orderedPhonemeIds = phonemeIds as string[];
    const uniquePhonemeIds = [...new Set(orderedPhonemeIds)];

    const existingPhonemes = await prisma.phoneme.findMany({
      where: {
        id: {
          in: uniquePhonemeIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingPhonemes.length !== uniquePhonemeIds.length) {
      const existingIds = new Set(
        existingPhonemes.map((phoneme) => phoneme.id),
      );

      const missingIds = uniquePhonemeIds.filter(
        (id) => !existingIds.has(id),
      );

      return NextResponse.json(
        {
          error: "One or more phoneme IDs do not exist",
          missingIds,
        },
        { status: 400 },
      );
    }

    const word = await prisma.word.create({
      data: {
        english,
        phonetic,
        hint: hint || null,
        phonemes: {
          create: orderedPhonemeIds.map((phonemeId, position) => ({
            phonemeId,
            position,
          })),
        },
      },
      include: wordInclude,
    });

    return NextResponse.json({ data: word }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body contains invalid JSON" },
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A word with this English spelling already exists" },
        { status: 409 },
      );
    }

    console.error("Failed to create word:", error);

    return NextResponse.json(
      { error: "Unable to create word" },
      { status: 500 },
    );
  }
}
