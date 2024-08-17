/*
  Warnings:

  - You are about to drop the column `searchButtonColor` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "searchButtonColor",
ADD COLUMN     "searchButtonTextColor" TEXT NOT NULL DEFAULT '#FFFFFF';
