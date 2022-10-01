/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCredential` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserCredential" DROP CONSTRAINT "UserCredential_userId_fkey";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserCredential";

-- CreateTable
CREATE TABLE "AccountCredentials" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "transports" TEXT,
    "counter" BIGINT NOT NULL,

    CONSTRAINT "AccountCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accounts" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "hashedPassword" TEXT,
    "salt" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "webAuthnChallenge" TEXT,
    "slackID" TEXT,
    "username" TEXT NOT NULL,
    "streakCount" INTEGER,
    "maxStreaks" INTEGER,
    "displayStreak" BOOLEAN,
    "streaksToggledOff" BOOLEAN,
    "customDomain" TEXT,
    "cssURL" TEXT,
    "website" TEXT,
    "github" TEXT,
    "fullSlackMember" BOOLEAN,
    "avatar" TEXT,
    "webring" TEXT[],
    "newMember" BOOLEAN NOT NULL,
    "timezoneOffset" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "pronouns" TEXT,
    "customAudioURL" TEXT,
    "lastUsernameUpdatedTime" TIMESTAMP(3),
    "webhookURL" TEXT,

    CONSTRAINT "Accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Updates" (
    "id" TEXT NOT NULL,
    "accountsID" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_email_key" ON "Accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_webAuthnChallenge_key" ON "Accounts"("webAuthnChallenge");

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_slackID_key" ON "Accounts"("slackID");

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_username_key" ON "Accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Updates_clubscrapID_key" ON "Updates"("clubscrapID");

-- CreateIndex
CREATE UNIQUE INDEX "EmojiType.name_unique" ON "EmojiType"("name");

-- AddForeignKey
ALTER TABLE "AccountCredentials" ADD CONSTRAINT "AccountCredentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Updates" ADD CONSTRAINT "Updates_accountsID_fkey" FOREIGN KEY ("accountsID") REFERENCES "Accounts"("slackID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmojiReactions" ADD CONSTRAINT "EmojiReactions_emojiTypeName_fkey" FOREIGN KEY ("emojiTypeName") REFERENCES "EmojiType"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmojiReactions" ADD CONSTRAINT "EmojiReactions_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "Updates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
