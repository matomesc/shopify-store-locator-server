/*
  Warnings:

  - Added the required column `position` to the `CustomAction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomAction" ADD COLUMN     "position" INTEGER NOT NULL;
