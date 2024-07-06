/*
  Warnings:

  - Added the required column `showInList` to the `CustomAction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `showInMap` to the `CustomAction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomAction" ADD COLUMN     "showInList" BOOLEAN NOT NULL,
ADD COLUMN     "showInMap" BOOLEAN NOT NULL;
