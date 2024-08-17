-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "listCustomActionBackgroundColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "listCustomActionHoverBackgroundColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "listCustomActionTextColor" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "listLinkColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "listLocationNameColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "listSearchFilterColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "listTextColor" TEXT NOT NULL DEFAULT '#000000',
ALTER COLUMN "searchFilterBackgroundColor" DROP DEFAULT,
ALTER COLUMN "searchFilterHoverBackgroundColor" DROP DEFAULT,
ALTER COLUMN "searchFilterSelectedBackgroundColor" DROP DEFAULT,
ALTER COLUMN "searchFilterSelectedBorderColor" DROP DEFAULT,
ALTER COLUMN "searchFilterTextColor" DROP DEFAULT;
