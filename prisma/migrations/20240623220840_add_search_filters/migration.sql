-- CreateTable
CREATE TABLE "SearchFilter" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SearchFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LocationToSearchFilter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LocationToSearchFilter_AB_unique" ON "_LocationToSearchFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationToSearchFilter_B_index" ON "_LocationToSearchFilter"("B");

-- AddForeignKey
ALTER TABLE "SearchFilter" ADD CONSTRAINT "SearchFilter_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToSearchFilter" ADD CONSTRAINT "_LocationToSearchFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToSearchFilter" ADD CONSTRAINT "_LocationToSearchFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "SearchFilter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
