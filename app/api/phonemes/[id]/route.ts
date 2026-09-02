import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const phoneme = await prisma.phoneme.findUnique({
      where: { id },
      include: {
        words: {
          include: {
            word: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!phoneme) {
      return NextResponse.json(
        { error: "Phoneme not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: phoneme }, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve phoneme:", error);

    return NextResponse.json(
      { error: "Unable to retrieve phoneme" },
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
    const data: {
      symbol?: string;
      letters?: string;
      example?: string;
    } = {};
    const errors: string[] = [];

    if ("symbol" in input) {
      if (typeof input.symbol !== "string" || !input.symbol.trim()) {
        errors.push("symbol must be a non-empty string");
      } else if (input.symbol.trim().length > 16) {
        errors.push("symbol must contain no more than 16 characters");
      } else {
        data.symbol = input.symbol.trim();
      }
    }

    if ("letters" in input) {
      if (typeof input.letters !== "string" || !input.letters.trim()) {
        errors.push("letters must be a non-empty string");
      } else if (input.letters.trim().length > 32) {
        errors.push("letters must contain no more than 32 characters");
      } else {
        data.letters = input.letters.trim();
      }
    }

    if ("example" in input) {
      if (typeof input.example !== "string" || !input.example.trim()) {
        errors.push("example must be a non-empty string");
      } else if (input.example.trim().length > 100) {
        errors.push("example must contain no more than 100 characters");
      } else {
        data.example = input.example.trim();
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Provide symbol, letters, or example to update" },
        { status: 400 },
      );
    }

    const phoneme = await prisma.phoneme.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: phoneme }, { status: 200 });
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
          { error: "A phoneme with this symbol already exists" },
          { status: 409 },
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Phoneme not found" },
          { status: 404 },
        );
      }
    }

    console.error("Failed to update phoneme:", error);

    return NextResponse.json(
      { error: "Unable to update phoneme" },
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

    await prisma.phoneme.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Phoneme deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Phoneme not found" },
          { status: 404 },
        );
      }

      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Cannot delete a phoneme currently used by a word" },
          { status: 409 },
        );
      }
    }

    console.error("Failed to delete phoneme:", error);

    return NextResponse.json(
      { error: "Unable to delete phoneme" },
      { status: 500 },
    );
  }
}
