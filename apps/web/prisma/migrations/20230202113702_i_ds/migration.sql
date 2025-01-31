-- AlterTable
ALTER TABLE "Accounts" ADD COLUMN     "id" TEXT,
ALTER COLUMN "slackID" DROP NOT NULL;
