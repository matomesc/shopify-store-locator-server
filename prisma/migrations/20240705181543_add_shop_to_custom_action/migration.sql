/*
  Warnings:

  - Added the required column `shopId` to the `CustomAction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomAction" ADD COLUMN     "shopId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CustomAction" ADD CONSTRAINT "CustomAction_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
