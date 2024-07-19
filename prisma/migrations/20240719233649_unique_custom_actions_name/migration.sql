/*
  Warnings:

  - A unique constraint covering the columns `[shopId,name]` on the table `CustomAction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CustomAction_shopId_name_key" ON "CustomAction"("shopId", "name");
