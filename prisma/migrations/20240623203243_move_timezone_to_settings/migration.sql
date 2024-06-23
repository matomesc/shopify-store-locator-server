/*
  Warnings:

  - You are about to drop the column `timezone` on the `Shop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "timezone";
