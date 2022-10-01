/*
  Warnings:

  - The `accountsID` column on the `Update` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Update" DROP CONSTRAINT "Update_accountsID_fkey";

-- AlterTable
ALTER TABLE "Update" DROP COLUMN "accountsID",
ADD COLUMN     "accountsID" INTEGER,
ALTER COLUMN "postTime" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Update" ADD CONSTRAINT "Update_accountsID_fkey" FOREIGN KEY ("accountsID") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
