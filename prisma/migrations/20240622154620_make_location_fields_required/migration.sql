/*
  Warnings:

  - Made the column `phone` on table `Location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `website` on table `Location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address2` on table `Location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `Location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `Location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zip` on table `Location` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Location" ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "website" SET NOT NULL,
ALTER COLUMN "address2" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "zip" SET NOT NULL;
