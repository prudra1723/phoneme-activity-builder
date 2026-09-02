import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const phonemes = await prisma.phoneme.findMany({
      orderBy: {
        symbol: "asc",
      },
    });

    return NextResponse.json({ data: phonemes }, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve phonemes:", error);

    return NextResponse.json(
      { error: "Unable to retrieve phonemes" },
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

    const symbol =
      typeof input.symbol === "string" ? input.symbol.trim() : "";

    const letters =
      typeof input.letters === "string" ? input.letters.trim() : "";

    const example =
      typeof input.example === "string" ? input.example.trim() : "";

    const errors: string[] = [];

    if (!symbol) errors.push("symbol is required");
    if (!letters) errors.push("letters is required");
    if (!example) errors.push("example is required");

    if (symbol.length > 16) {
      errors.push("symbol must contain no more than 16 characters");
    }

    if (letters.length > 32) {
      errors.push("letters must contain no more than 32 characters");
    }

    if (example.length > 100) {
      errors.push("example must contain no more than 100 characters");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const phoneme = await prisma.phoneme.create({
      data: {
        symbol,
        letters,
        example,
      },
    });

    return NextResponse.json({ data: phoneme }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A phoneme with this symbol already exists" },
        { status: 409 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body contains invalid JSON" },
        { status: 400 },
      );
    }

    console.error("Failed to create phoneme:", error);

    return NextResponse.json(
      { error: "Unable to create phoneme" },
      { status: 500 },
    );
  }
}
