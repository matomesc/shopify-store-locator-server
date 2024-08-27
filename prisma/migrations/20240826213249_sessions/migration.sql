/*
  Warnings:

  - Added the required column `browserName` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `browserVersion` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpuArchitecture` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceModel` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceType` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceVendor` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `engineName` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `engineVersion` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `osName` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `osVersion` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAgent` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "browserName" TEXT NOT NULL,
ADD COLUMN     "browserVersion" TEXT NOT NULL,
ADD COLUMN     "cpuArchitecture" TEXT NOT NULL,
ADD COLUMN     "deviceModel" TEXT NOT NULL,
ADD COLUMN     "deviceType" TEXT NOT NULL,
ADD COLUMN     "deviceVendor" TEXT NOT NULL,
ADD COLUMN     "engineName" TEXT NOT NULL,
ADD COLUMN     "engineVersion" TEXT NOT NULL,
ADD COLUMN     "osName" TEXT NOT NULL,
ADD COLUMN     "osVersion" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT NOT NULL;
