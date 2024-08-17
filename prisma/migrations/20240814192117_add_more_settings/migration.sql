-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "searchInputBackgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "searchInputBorderColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "searchInputPlaceholderColor" TEXT NOT NULL DEFAULT '#636C72';
