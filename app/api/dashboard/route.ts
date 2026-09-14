import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalWords,
      totalWordLists,
      totalActivities,
      wordleActivities,
      wordSearchActivities,
      successfulGenerations,
      failedGenerations,
      wordleGenerations,
      wordSearchGenerations,
      averagePageDuration,
      emptyWordLists,
      recentFailures,
      recentEvents,
    ] = await Promise.all([
      prisma.word.count(),

      prisma.wordList.count(),

      prisma.activity.count(),

      prisma.activity.count({
        where: { type: "WORDLE" },
      }),

      prisma.activity.count({
        where: { type: "WORD_SEARCH" },
      }),

      prisma.usageEvent.count({
        where: { eventType: "GENERATION_SUCCESS" },
      }),

      prisma.usageEvent.count({
        where: { eventType: "GENERATION_FAILED" },
      }),

      prisma.usageEvent.count({
        where: {
          eventType: "GENERATION_SUCCESS",
          activityType: "WORDLE",
        },
      }),

      prisma.usageEvent.count({
        where: {
          eventType: "GENERATION_SUCCESS",
          activityType: "WORD_SEARCH",
        },
      }),

      prisma.usageEvent.aggregate({
        where: {
          eventType: "PAGE_DURATION",
          durationMs: { not: null },
        },
        _avg: {
          durationMs: true,
        },
      }),

      prisma.wordList.findMany({
        where: {
          words: { none: {} },
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.usageEvent.count({
        where: {
          eventType: "GENERATION_FAILED",
          createdAt: { gte: oneDayAgo },
        },
      }),

      prisma.usageEvent.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          eventType: true,
          activityType: true,
          pagePath: true,
          durationMs: true,
          message: true,
          createdAt: true,
        },
      }),
    ]);

    let mostUsedActivityType: "WORDLE" | "WORD_SEARCH" | "TIE" | "NO_DATA";

    if (wordleGenerations === 0 && wordSearchGenerations === 0) {
      mostUsedActivityType = "NO_DATA";
    } else if (wordleGenerations === wordSearchGenerations) {
      mostUsedActivityType = "TIE";
    } else {
      mostUsedActivityType =
        wordleGenerations > wordSearchGenerations ? "WORDLE" : "WORD_SEARCH";
    }

    const averageTimeOnPageMs = Math.round(
      averagePageDuration._avg.durationMs ?? 0,
    );

    const alerts = [
      ...(emptyWordLists.length > 0
        ? [
            {
              severity: "warning",
              message: `${emptyWordLists.length} word list(s) contain no words`,
              items: emptyWordLists,
            },
          ]
        : []),

      ...(recentFailures > 0
        ? [
            {
              severity: "error",
              message: `${recentFailures} generation failure(s) occurred in the last 24 hours`,
            },
          ]
        : []),
    ];

    return NextResponse.json({
      data: {
        health: {
          status: "ok",
          database: "connected",
          generatedAt: new Date().toISOString(),
        },

        totals: {
          words: totalWords,
          wordLists: totalWordLists,
          activities: totalActivities,
          wordleActivities,
          wordSearchActivities,
          successfulGenerations,
          failedGenerations,
        },

        usage: {
          wordleGenerations,
          wordSearchGenerations,
          mostUsedActivityType,
          averageTimeOnPageMs,
        },

        alerts,
        recentEvents,
      },
    });
  } catch (error) {
    console.error("Failed to retrieve dashboard data:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve dashboard data",
        health: {
          status: "error",
          database: "unavailable",
        },
      },
      { status: 500 },
    );
  }
}
