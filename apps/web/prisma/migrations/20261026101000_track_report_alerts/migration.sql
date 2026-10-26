ALTER TABLE "ScrapbookPostReport"
    ADD COLUMN "notifiedAt" TIMESTAMP(3);

CREATE INDEX "ScrapbookPostReport_notifiedAt_createdAt_idx"
    ON "ScrapbookPostReport"("notifiedAt", "createdAt");
