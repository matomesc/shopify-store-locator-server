-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "mapMarkerImage" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "mapMarkerBackgroundColor" DROP DEFAULT,
ALTER COLUMN "mapMarkerBorderColor" DROP DEFAULT,
ALTER COLUMN "mapMarkerGlyphColor" DROP DEFAULT,
ALTER COLUMN "mapMarkerType" DROP DEFAULT;
