/*
  Warnings:

  - You are about to drop the column `analytics` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "analytics",
ADD COLUMN     "analyticsRetention" INTEGER NOT NULL DEFAULT 0;

UPDATE "Plan"
SET "analyticsRetention" = 1
WHERE id = 'free';

UPDATE "Plan"
SET "analyticsRetention" = 30
WHERE id = 'starter';

UPDATE "Plan"
SET "analyticsRetention" = 90
WHERE id = 'pro';

UPDATE "Plan"
SET "analyticsRetention" = 365
WHERE id = 'enterprise';
