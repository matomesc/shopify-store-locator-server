-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "searchFilterBackgroundColor" TEXT NOT NULL DEFAULT '#EEEEEE',
ADD COLUMN     "searchFilterHoverBackgroundColor" TEXT NOT NULL DEFAULT '#EEEEEE',
ADD COLUMN     "searchFilterSelectedBackgroundColor" TEXT NOT NULL DEFAULT '#EEEEEE',
ADD COLUMN     "searchFilterSelectedBorderColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "searchFilterTextColor" TEXT NOT NULL DEFAULT '#000000';
