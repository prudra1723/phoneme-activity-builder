-- CreateEnum
CREATE TYPE "UsageEventType" AS ENUM ('ACTIVITY_CREATED', 'GENERATION_SUCCESS', 'GENERATION_FAILED', 'PAGE_VIEW', 'PAGE_DURATION', 'VALIDATION_WARNING');

-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "eventType" "UsageEventType" NOT NULL,
    "activityType" "ActivityType",
    "pagePath" VARCHAR(255),
    "durationMs" INTEGER,
    "message" VARCHAR(500),
    "metadata" JSONB,
    "activityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsageEvent_eventType_idx" ON "UsageEvent"("eventType");

-- CreateIndex
CREATE INDEX "UsageEvent_activityType_idx" ON "UsageEvent"("activityType");

-- CreateIndex
CREATE INDEX "UsageEvent_activityId_idx" ON "UsageEvent"("activityId");

-- CreateIndex
CREATE INDEX "UsageEvent_createdAt_idx" ON "UsageEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
