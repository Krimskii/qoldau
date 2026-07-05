-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "diagnosisLabel" TEXT,
    "currentState" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceRole" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "confidence" REAL,
    "rawText" TEXT,
    "linkedEventIds" TEXT,
    "payload" TEXT,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "events_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recordings" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recordings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "recordings_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "events_childId_idx" ON "events"("childId");

-- CreateIndex
CREATE INDEX "events_timestamp_idx" ON "events"("timestamp");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX "recordings_childId_idx" ON "recordings"("childId");

-- CreateIndex
CREATE INDEX "recordings_timestamp_idx" ON "recordings"("timestamp");
