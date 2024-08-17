-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "mapCustomActionBackgroundColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "mapCustomActionHoverBackgroundColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "mapCustomActionTextColor" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "mapLinkColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "mapLocationNameColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "mapSearchFilterColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "mapTextColor" TEXT NOT NULL DEFAULT '#000000',
ALTER COLUMN "mapMarkerImage" DROP DEFAULT;
