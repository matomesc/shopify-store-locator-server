/*
  Warnings:

  - You are about to drop the column `scope` on the `Shop` table. All the data in the column will be lost.
  - Added the required column `accessTokenScope` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "scope",
ADD COLUMN     "accessTokenScope" TEXT NOT NULL;
