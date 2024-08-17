-- CreateEnum
CREATE TYPE "MapMarkerType" AS ENUM ('pin', 'image');

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "mapMarkerBackgroundColor" TEXT NOT NULL DEFAULT '#E7453C',
ADD COLUMN     "mapMarkerBorderColor" TEXT NOT NULL DEFAULT '#CC2E2B',
ADD COLUMN     "mapMarkerGlyphColor" TEXT NOT NULL DEFAULT '#B1171C',
ADD COLUMN     "mapMarkerType" "MapMarkerType" NOT NULL DEFAULT 'pin';
