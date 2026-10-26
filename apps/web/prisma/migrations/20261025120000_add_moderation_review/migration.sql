CREATE TABLE "ModerationReview" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "flaggedTerms" TEXT[] NOT NULL,
    "flaggedCategories" TEXT[] NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reportChannel" TEXT,
    "reportMessageTs" TEXT,
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ModerationReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ModerationReview_updateId_key" ON "ModerationReview"("updateId");

CREATE TABLE "ModerationScanState" (
    "id" TEXT NOT NULL,
    "lastScannedAt" TIMESTAMP(3) NOT NULL DEFAULT '1970-01-01 00:00:00',
    CONSTRAINT "ModerationScanState_pkey" PRIMARY KEY ("id")
);
