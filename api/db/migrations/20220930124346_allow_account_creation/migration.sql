-- AlterTable
ALTER TABLE "Accounts" ALTER COLUMN "newMember" DROP NOT NULL,
ALTER COLUMN "timezoneOffset" SET DEFAULT 0,
ALTER COLUMN "timezone" SET DEFAULT 'Factory';
