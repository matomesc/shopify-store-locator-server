/*
  Warnings:

  - Made the column `openInNewTab` on table `CustomAction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CustomAction" ALTER COLUMN "openInNewTab" SET NOT NULL;
