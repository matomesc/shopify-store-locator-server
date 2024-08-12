/*
  Warnings:

  - Added the required column `enabled` to the `Language` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Language" ADD COLUMN     "enabled" BOOLEAN NOT NULL;
