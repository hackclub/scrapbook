/*
  Warnings:

  - You are about to drop the `AccountCredentials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmojiReactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Updates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountCredentials" DROP CONSTRAINT "AccountCredentials_userId_fkey";

-- DropForeignKey
ALTER TABLE "EmojiReactions" DROP CONSTRAINT "EmojiReactions_emojiTypeName_fkey";

-- DropForeignKey
ALTER TABLE "EmojiReactions" DROP CONSTRAINT "EmojiReactions_updateId_fkey";

-- DropForeignKey
ALTER TABLE "Updates" DROP CONSTRAINT "Updates_accountsID_fkey";

-- DropTable
DROP TABLE "AccountCredentials";

-- DropTable
DROP TABLE "Accounts";

-- DropTable
DROP TABLE "EmojiReactions";

-- DropTable
DROP TABLE "Updates";

-- CreateTable
CREATE TABLE "AccountCredential" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "transports" TEXT,
    "counter" BIGINT NOT NULL,

    CONSTRAINT "AccountCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "hashedPassword" TEXT,
    "salt" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "webAuthnChallenge" TEXT,
    "slackID" TEXT,
    "username" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Factory',
    "timezoneOffset" INTEGER NOT NULL DEFAULT 0,
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
    "pronouns" TEXT,
    "customAudioURL" TEXT,
    "lastUsernameUpdatedTime" TIMESTAMP(3),
    "webhookURL" TEXT,
    "newMember" BOOLEAN,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Update" (
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

    CONSTRAINT "Update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmojiReaction" (
    "id" TEXT NOT NULL,
    "updateId" TEXT,
    "emojiTypeName" TEXT,
    "usersReacted" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmojiReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_webAuthnChallenge_key" ON "Account"("webAuthnChallenge");

-- CreateIndex
CREATE UNIQUE INDEX "Account_slackID_key" ON "Account"("slackID");

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Update_clubscrapID_key" ON "Update"("clubscrapID");

-- AddForeignKey
ALTER TABLE "AccountCredential" ADD CONSTRAINT "AccountCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Update" ADD CONSTRAINT "Update_accountsID_fkey" FOREIGN KEY ("accountsID") REFERENCES "Account"("slackID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmojiReaction" ADD CONSTRAINT "EmojiReaction_emojiTypeName_fkey" FOREIGN KEY ("emojiTypeName") REFERENCES "EmojiType"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmojiReaction" ADD CONSTRAINT "EmojiReaction_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "Update"("id") ON DELETE SET NULL ON UPDATE CASCADE;
