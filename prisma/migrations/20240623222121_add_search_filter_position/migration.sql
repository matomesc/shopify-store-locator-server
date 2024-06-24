/*
  Warnings:

  - Added the required column `position` to the `SearchFilter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SearchFilter" ADD COLUMN     "position" INTEGER NOT NULL;
