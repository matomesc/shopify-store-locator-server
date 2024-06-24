/*
  Warnings:

  - A unique constraint covering the columns `[shopId,name]` on the table `SearchFilter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SearchFilter_shopId_name_key" ON "SearchFilter"("shopId", "name");
