/*
  Warnings:

  - Added the required column `installedAt` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "installedAt" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "uninstalledAt" TIMESTAMPTZ(3),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;
