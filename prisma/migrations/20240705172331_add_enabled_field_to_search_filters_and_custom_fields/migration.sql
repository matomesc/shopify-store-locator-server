-- AlterTable
ALTER TABLE "CustomField" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SearchFilter" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;
