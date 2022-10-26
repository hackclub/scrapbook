/*
  Warnings:

  - The `usersReacted` column on the `EmojiReaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "EmojiReaction" DROP COLUMN "usersReacted",
ADD COLUMN     "usersReacted" INTEGER[];
