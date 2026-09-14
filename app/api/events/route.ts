import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const EVENT_TYPES = [
  "ACTIVITY_CREATED",
  "GENERATION_SUCCESS",
  "GENERATION_FAILED",
  "PAGE_VIEW",
  "PAGE_DURATION",
  "VALIDATION_WARNING",
] as const;

const ACTIVITY_TYPES = ["WORDLE", "WORD_SEARCH"] as const;

export async function GET() {
  try {
    const events = await prisma.usageEvent.findMany({
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ data: events });
  } catch (error) {
    console.error("Failed to retrieve usage events:", error);

    return NextResponse.json(
      { error: "Unable to retrieve usage events" },
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

    const eventType =
      typeof input.eventType === "string" ? input.eventType : "";

    const activityType =
      typeof input.activityType === "string" ? input.activityType : null;

    const pagePath =
      typeof input.pagePath === "string" ? input.pagePath.trim() : null;

    const message =
      typeof input.message === "string" ? input.message.trim() : null;

    const activityId =
      typeof input.activityId === "string" ? input.activityId.trim() : null;

    const durationMs =
      typeof input.durationMs === "number" ? input.durationMs : null;

    if (!EVENT_TYPES.includes(eventType as (typeof EVENT_TYPES)[number])) {
      errors.push("eventType is invalid");
    }

    if (
      activityType !== null &&
      !ACTIVITY_TYPES.includes(activityType as (typeof ACTIVITY_TYPES)[number])
    ) {
      errors.push("activityType must be WORDLE or WORD_SEARCH");
    }

    if (pagePath !== null && (!pagePath || pagePath.length > 255)) {
      errors.push("pagePath must contain between 1 and 255 characters");
    }

    if (message !== null && (!message || message.length > 500)) {
      errors.push("message must contain between 1 and 500 characters");
    }

    if (
      durationMs !== null &&
      (!Number.isInteger(durationMs) ||
        durationMs < 0 ||
        durationMs > 86_400_000)
    ) {
      errors.push("durationMs must be an integer between 0 and 86400000");
    }

    if (
      input.metadata !== undefined &&
      input.metadata !== null &&
      (typeof input.metadata !== "object" || Array.isArray(input.metadata))
    ) {
      errors.push("metadata must be a JSON object or null");
    }

    if (
      ["GENERATION_SUCCESS", "GENERATION_FAILED"].includes(eventType) &&
      activityType === null
    ) {
      errors.push("activityType is required for generation events");
    }

    if (eventType === "PAGE_VIEW" && pagePath === null) {
      errors.push("pagePath is required for PAGE_VIEW");
    }

    if (
      eventType === "PAGE_DURATION" &&
      (pagePath === null || durationMs === null)
    ) {
      errors.push("pagePath and durationMs are required for PAGE_DURATION");
    }

    if (eventType === "VALIDATION_WARNING" && message === null) {
      errors.push("message is required for VALIDATION_WARNING");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const event = await prisma.usageEvent.create({
      data: {
        eventType: eventType as (typeof EVENT_TYPES)[number],
        activityType: activityType as (typeof ACTIVITY_TYPES)[number] | null,
        pagePath,
        durationMs,
        message,
        activityId,
        metadata:
          input.metadata &&
          typeof input.metadata === "object" &&
          !Array.isArray(input.metadata)
            ? (input.metadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,
      },
    });

    return NextResponse.json({ data: event }, { status: 201 });
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
        { error: "The selected activity does not exist" },
        { status: 400 },
      );
    }

    console.error("Failed to create usage event:", error);

    return NextResponse.json(
      { error: "Unable to create usage event" },
      { status: 500 },
    );
  }
}
