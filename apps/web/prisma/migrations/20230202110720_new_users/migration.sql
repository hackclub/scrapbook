-- AlterTable
ALTER TABLE "Accounts" ALTER COLUMN "newMember" SET DEFAULT false,
ALTER COLUMN "timezoneOffset" DROP NOT NULL,
ALTER COLUMN "timezone" DROP NOT NULL;
