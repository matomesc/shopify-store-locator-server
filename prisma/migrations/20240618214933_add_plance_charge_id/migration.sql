-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "lastTrialAt" TIMESTAMPTZ(3),
ADD COLUMN     "planChargeId" BIGINT;
