/*
  Warnings:

  - Made the column `googleMapsApiKey` on table `Settings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Settings" ALTER COLUMN "googleMapsApiKey" SET NOT NULL;
