-- CreateEnum
CREATE TYPE "CustomActionType" AS ENUM ('link', 'js');

-- CreateTable
CREATE TABLE "CustomAction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CustomActionType" NOT NULL,
    "defaultValue" TEXT NOT NULL,
    "openInNewTab" BOOLEAN,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CustomAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomActionValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "customActionId" TEXT NOT NULL,

    CONSTRAINT "CustomActionValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomActionValue_locationId_customActionId_key" ON "CustomActionValue"("locationId", "customActionId");

-- AddForeignKey
ALTER TABLE "CustomActionValue" ADD CONSTRAINT "CustomActionValue_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomActionValue" ADD CONSTRAINT "CustomActionValue_customActionId_fkey" FOREIGN KEY ("customActionId") REFERENCES "CustomAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
