/*
  Warnings:

  - You are about to drop the column `showPlanModal` on the `Shop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "showPlanModal",
ADD COLUMN     "showPlansModal" BOOLEAN NOT NULL DEFAULT true;
