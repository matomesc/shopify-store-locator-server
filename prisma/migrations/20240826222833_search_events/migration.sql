/*
  Warnings:

  - Added the required column `address` to the `SearchEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `SearchEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `SearchEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryCode` to the `SearchEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `SearchEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stateCode` to the `SearchEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip` to the `SearchEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SearchEvent" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "stateCode" TEXT NOT NULL,
ADD COLUMN     "zip" TEXT NOT NULL;
