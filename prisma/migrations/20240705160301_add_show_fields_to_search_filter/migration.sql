-- AlterTable
ALTER TABLE "SearchFilter" ADD COLUMN     "showInList" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showInMap" BOOLEAN NOT NULL DEFAULT true;
