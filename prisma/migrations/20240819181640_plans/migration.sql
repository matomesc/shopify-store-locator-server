-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "languagesLimit" INTEGER NOT NULL DEFAULT 0;

UPDATE "Plan"
SET "languagesLimit" = 1
WHERE id = 'free';

UPDATE "Plan"
SET "languagesLimit" = 2
WHERE id = 'starter';

UPDATE "Plan"
SET "languagesLimit" = 5
WHERE id = 'pro';

UPDATE "Plan"
SET "languagesLimit" = 10
WHERE id = 'enterprise';

UPDATE "Plan"
SET "languagesLimit" = 100
WHERE id = 'unlimited';
