/*
  Warnings:

  - Added the required column `enabled` to the `CustomAction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomAction" ADD COLUMN     "enabled" BOOLEAN NOT NULL;
