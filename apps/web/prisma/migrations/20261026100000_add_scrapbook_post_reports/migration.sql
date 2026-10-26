CREATE TABLE "ScrapbookPostReport" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "reporterAccountId" TEXT NOT NULL,
    "reporterUsername" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapbookPostReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScrapbookPostReport_updateId_reporterAccountId_key"
    ON "ScrapbookPostReport"("updateId", "reporterAccountId");

CREATE INDEX "ScrapbookPostReport_reporterAccountId_createdAt_idx"
    ON "ScrapbookPostReport"("reporterAccountId", "createdAt");
