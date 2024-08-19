-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "analytics" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "locationsLimit" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "CustomAction_enabled_idx" ON "CustomAction"("enabled");

-- CreateIndex
CREATE INDEX "CustomField_enabled_idx" ON "CustomField"("enabled");

-- CreateIndex
CREATE INDEX "Language_enabled_idx" ON "Language"("enabled");

-- CreateIndex
CREATE INDEX "Location_active_idx" ON "Location"("active");

-- CreateIndex
CREATE INDEX "SearchFilter_enabled_idx" ON "SearchFilter"("enabled");

UPDATE "Plan"
SET "locationsLimit" = 5,
    analytics = false
WHERE id = 'free';

UPDATE "Plan"
SET "locationsLimit" = 300,
    analytics = true
WHERE id = 'starter';

UPDATE "Plan"
SET "locationsLimit" = 1000,
    analytics = true
WHERE id = 'pro';

UPDATE "Plan"
SET "locationsLimit" = 5000,
    analytics = true
WHERE id = 'enterprise';

UPDATE "Plan"
SET "locationsLimit" = 100000,
    analytics = true
WHERE id = 'unlimited';
