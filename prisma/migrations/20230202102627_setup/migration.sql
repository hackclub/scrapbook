-- CreateTable
CREATE TABLE "WebAccounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "WebAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Accounts" (
    "slackID" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "username" TEXT NOT NULL,
    "streakCount" INTEGER,
    "maxStreaks" INTEGER,
    "displayStreak" BOOLEAN,
    "streaksToggledOff" BOOLEAN,
    "customDomain" TEXT,
    "cssURL" TEXT,
    "website" TEXT,
    "github" TEXT,
    "image" TEXT,
    "fullSlackMember" BOOLEAN,
    "avatar" TEXT,
    "webring" TEXT[],
    "newMember" BOOLEAN NOT NULL,
    "timezoneOffset" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "pronouns" TEXT,
    "customAudioURL" TEXT,
    "lastUsernameUpdatedTime" TIMESTAMP(3),
    "webhookURL" TEXT
);

-- CreateTable
CREATE TABLE "Updates" (
    "id" TEXT NOT NULL,
    "accountsSlackID" TEXT,
    "postTime" TIMESTAMP(3),
    "text" TEXT,
    "attachments" TEXT[],
    "muxAssetIDs" TEXT[],
    "muxPlaybackIDs" TEXT[],
    "muxAssetStatuses" TEXT,
    "messageTimestamp" DOUBLE PRECISION,
    "backupAssetID" TEXT,
    "backupPlaybackID" TEXT,
    "isLargeVideo" BOOLEAN,
    "channel" TEXT,
    "clubscrapID" TEXT,

    CONSTRAINT "Updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmojiType" (
    "name" TEXT NOT NULL,
    "emojiSource" TEXT
);

-- CreateTable
CREATE TABLE "EmojiReactions" (
    "id" TEXT NOT NULL,
    "updateId" TEXT,
    "emojiTypeName" TEXT,
    "usersReacted" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmojiReactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clubscraps" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "club" TEXT,
    "timestamp" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Clubscraps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebAccounts_provider_providerAccountId_key" ON "WebAccounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Accounts.slackID_unique" ON "Accounts"("slackID");

-- CreateIndex
CREATE UNIQUE INDEX "Accounts.email_unique" ON "Accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Accounts.username_unique" ON "Accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Updates_clubscrapID_key" ON "Updates"("clubscrapID");

-- CreateIndex
CREATE UNIQUE INDEX "EmojiType.name_unique" ON "EmojiType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Clubscraps_timestamp_key" ON "Clubscraps"("timestamp");

-- AddForeignKey
ALTER TABLE "WebAccounts" ADD CONSTRAINT "WebAccounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Accounts"("slackID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Accounts"("slackID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Updates" ADD CONSTRAINT "Updates_accountsSlackID_fkey" FOREIGN KEY ("accountsSlackID") REFERENCES "Accounts"("slackID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Updates" ADD CONSTRAINT "Updates_clubscrapID_fkey" FOREIGN KEY ("clubscrapID") REFERENCES "Clubscraps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmojiReactions" ADD CONSTRAINT "EmojiReactions_emojiTypeName_fkey" FOREIGN KEY ("emojiTypeName") REFERENCES "EmojiType"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmojiReactions" ADD CONSTRAINT "EmojiReactions_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "Updates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
